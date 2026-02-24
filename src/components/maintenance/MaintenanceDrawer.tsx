"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createMaintenanceLogSchema, type CreateMaintenanceLogInput } from "@/lib/validations";
import { useCreateMaintenanceLog, useUpdateMaintenanceLog, useMachinesList } from "@/hooks/use-data";
import { X } from "lucide-react";
import { useEffect } from "react";

interface MaintenanceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  log?: any;
  machineId?: number; // Pre-select if opened from machine details
}

export function MaintenanceDrawer({ isOpen, onClose, log, machineId }: MaintenanceDrawerProps) {
  const { data: machines } = useMachinesList();
  const createLog = useCreateMaintenanceLog();
  const updateLog = useUpdateMaintenanceLog(log?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMaintenanceLogInput>({
    resolver: zodResolver(createMaintenanceLogSchema) as any,
    defaultValues: {
      status: "OPERATIONAL",
      cost: 0,
    },
  });

  useEffect(() => {
    if (log) {
      reset({
        machineId: log.machineId,
        action: log.action,
        cost: log.cost,
        status: log.status as any,
      });
    } else if (machineId) {
      reset({
        machineId,
        status: "OPERATIONAL",
        cost: 0,
      });
    } else {
      reset({
        status: "OPERATIONAL",
        cost: 0,
      });
    }
  }, [log, machineId, reset]);

  const onSubmit = async (data: CreateMaintenanceLogInput) => {
    try {
      if (log) {
        await updateLog.mutateAsync(data);
      } else {
        await createLog.mutateAsync(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error("Failed to save maintenance log:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white shadow-xl">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {log ? "Edit Maintenance Record" : "New Maintenance Record"}
          </h2>
          <button onClick={onClose} className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form id="maintenance-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Machine</label>
              <select
                {...register("machineId", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
              >
                <option value="">Select Machine</option>
                {machines?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.model || "No model"})
                  </option>
                ))}
              </select>
              {errors.machineId && <p className="mt-1 text-sm text-red-600">{errors.machineId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maintenance Action</label>
              <textarea
                {...register("action")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                placeholder="e.g., Replaced printer belt, scheduled oil change..."
              />
              {errors.action && <p className="mt-1 text-sm text-red-600">{errors.action.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cost (XAF)</label>
                <input
                  type="number"
                  {...register("cost", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Machine Status Post-Repair</label>
                <select
                  {...register("status")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black/10 sm:text-sm"
                >
                  <option value="OPERATIONAL">Operational</option>
                  <option value="NEEDS_PARTS">Needs Parts</option>
                  <option value="DOWN">Down</option>
                </select>
              </div>
            </div>

            <div className="rounded-md bg-gray-100 p-4 border border-brand-100">
              <p className="text-xs text-brand-800 leading-relaxed font-medium capitalize">
                💡 Saving this record will automatically update the machine's status and last maintenance date in the inventory.
              </p>
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
              form="maintenance-form"
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
