"use client";

import { useSession } from "next-auth/react";
import { User, Shield, Bell, Monitor, Save } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "appearance", label: "Appearance", icon: Monitor },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Manage your account preferences and security</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-black text-white shadow-lg shadow-black/10"
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center text-white text-2xl font-black">
                  {session?.user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{session?.user?.name}</h3>
                  <p className="text-sm text-gray-500">{session?.user?.role?.replace("_", " ")}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={session?.user?.name || ""}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-black focus:ring-black/5 transition-all outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <input
                    type="email"
                    defaultValue={session?.user?.email || ""}
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:border-black focus:ring-black/5 transition-all outline-none"
                    disabled
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-900 transition-all">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab !== "profile" && (
            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
              <Monitor className="w-12 h-12 mb-4" />
              <p className="font-bold">Module under construction</p>
              <p className="text-sm">This setting will be available in the next release.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
