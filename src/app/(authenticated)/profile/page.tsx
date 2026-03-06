"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useProfile, useUpdateProfile } from "@/hooks/use-data";
import {
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Lock,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const qc = useQueryClient();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Initialize form after profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        address: profile.address || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaveStatus("saving");
    setErrorMessage("");

    const data: any = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone || null,
      bio: form.bio || null,
      address: form.address || null,
    };

    if (form.password) {
      if (form.password !== form.confirmPassword) {
        setSaveStatus("error");
        setErrorMessage("Passwords do not match.");
        return;
      }
      if (form.password.length < 6) {
        setSaveStatus("error");
        setErrorMessage("Password must be at least 6 characters.");
        return;
      }
      data.password = form.password;
    }

    try {
      // 1. Update basic profile info
      await updateProfile.mutateAsync(data);

      // 2. Handle avatar upload if needed
      if (avatarFile && profile?.id) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        formData.append("staffId", String(profile.id));

        const res = await fetch("/api/staff/upload", { method: "POST", body: formData });
        if (!res.ok) {
          throw new Error("Failed to upload profile picture.");
        }
      }

      // 3. Cleanup and refresh
      setForm((f) => ({ ...f, password: "", confirmPassword: "" }));
      setAvatarFile(null);
      setSaveStatus("success");

      // Force refresh profile data
      qc.invalidateQueries({ queryKey: ["profile"] });

      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err: any) {
      console.error(err);
      setSaveStatus("error");
      setErrorMessage(err.message || "Failed to update profile. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500">Update your personal information</p>
        </div>
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium animate-in slide-in-from-right-4">
            <CheckCircle2 className="w-4 h-4" />
            Changes saved!
          </div>
        )}
      </div>

      {saveStatus === "error" && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-100">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-sm transition-all group-hover:border-black group-hover:bg-gray-100">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} className="w-full h-full object-cover" />
              ) : profile?.avatarUrl ? (
                <img src={profile.avatarUrl} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-gray-300" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-xl shadow-lg transform group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.firstName} {profile?.lastName}
            </h2>
            <p className="text-gray-500 font-medium">{profile?.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xs font-bold bg-black text-white px-3 py-1 rounded-lg uppercase tracking-wider">
                {profile?.role}
              </span>
              <span className="text-sm text-gray-400 font-medium">{profile?.department}</span>
              <div className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-sm text-gray-400 font-medium">ID: {profile?.staffId}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" /> First Name
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50 hover:bg-gray-50"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <User className="w-3.5 h-3.5" /> Last Name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50 hover:bg-gray-50"
              />
            </div>
          </div>

          {/* Phone & Address */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <Phone className="w-3.5 h-3.5" /> Phone
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50 hover:bg-gray-50"
                placeholder="+237..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <MapPin className="w-3.5 h-3.5" /> Address
              </label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black transition-all bg-gray-50/50 hover:bg-gray-50"
                placeholder="City, Country"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Bio / About
            </label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-gray-200 p-4 text-sm focus:border-black focus:ring-1 focus:ring-black resize-none transition-all bg-gray-50/50 hover:bg-gray-50"
              placeholder="Tell a bit about your expertise and background..."
            />
          </div>

          {/* Password Change */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Change Password (optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black bg-white"
                placeholder="New password"
              />
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="h-11 rounded-xl border border-gray-200 px-4 text-sm focus:border-black focus:ring-1 focus:ring-black bg-white"
                placeholder="Confirm password"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || !form.firstName || !form.lastName}
            className="w-full flex items-center justify-center gap-2 bg-black text-white font-bold h-12 rounded-xl text-sm hover:bg-gray-900 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
          >
            {saveStatus === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === "saving" ? "Updating profile..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
