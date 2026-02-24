"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCleaningLogSchema, type CreateCleaningLogInput } from "@/lib/validations";
import { useCreateCleaningLog, useUpdateCleaningLog, useStaffLookup } from "@/hooks/use-data";
import { X } from "lucide-react";
import { useEffect } from "react";

interface CleaningDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log?: any;
}

export function CleaningDrawer({ isOpen, onClose, log }: CleaningDrawerProps) {
  const { data: staff } = useStaffLookup();
  const createLog = useCreateCleaningLog();
  const updateLog = useUpdateCleaningLog(log?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCleaningLogInput>({
    resolver: zodResolver(createCleaningLogSchema) as any,
    defaultValues: {
      result: "PASS",
      grade: 3,
      deduction: 0,
    },
  });

  useEffect(() => {
    if (log) {
      reset({
        staffId: log.staffId,
        zone: log.zone as any,
        result: log.result as any,
        grade: log.grade,
        deduction: log.deduction,
        inspectorNotes: log.inspectorNotes,
      });
    } else {
      reset({
        result: "PASS",
        grade: 3,
        deduction: 0,
      });
    }
  }, [log, reset]);

  const onSubmit = async (data: CreateCleaningLogInput) => {
    try {
      if (log) {
        await updateLog.mutateAsync(data);
      } else {
        await createLog.mutateAsync(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error("Failed to save cleaning log:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white shadow-xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {log ? "Edit Cleaning Record" : "New Cleaning Record"}
          </h2>
          <button onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="cleaning-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Zone</label>
              <select
                {...register("zone")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
              >
                <option value="JOYSUN_FLOOR">Joysun Production Floor</option>
                <option value="OFFIZONE_MAIN">Offizone Main Office</option>
                <option value="BATHROOMS">Bathrooms / Shared Areas</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Cleaner / Staff</label>
              <select
                {...register("staffId", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
              >
                <option value="">Select Staff</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
              {errors.staffId && <p className="mt-1 text-sm text-red-600">{errors.staffId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Result</label>
                <select
                  {...register("result")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                >
                  <option value="PASS">Pass</option>
                  <option value="FAIL">Fail</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade (1-5)</label>
                <input
                  type="number"
                  {...register("grade", { valueAsNumber: true, min: 1, max: 5 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Deduction (XAF)</label>
              <input
                type="number"
                {...register("deduction", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                placeholder="0"
              />
              <p className="mt-1 text-[10px] text-gray-400 italic">Deduction applied if grade is low or fail.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Inspector Notes</label>
              <textarea
                {...register("inspectorNotes")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                placeholder="Specific areas missed, praise for detail, etc."
              />
            </div>
          </div>
        </form>

        <div className="border-t px-6 py-4">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cleaning-form"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-black px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : log ? "Update Record" : "Post Record"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
