"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTaskSchema, type CreateTaskInput } from "@/lib/validations";
import {
  useCreateTask,
  useUpdateTask,
  useStaffLookup,
  useTaskDetail,
  useCreateTaskComment,
} from "@/hooks/use-data";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import { MessageSquare, Send } from "lucide-react";
import { useEffect } from "react";
import { format } from "date-fns";

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
  initialData?: Partial<CreateTaskInput>;
}

export function TaskDrawer({
  isOpen,
  onClose,
  task,
  initialData,
}: TaskDrawerProps) {
  const { data: staff } = useStaffLookup();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id);
  const { data: taskDetail } = useTaskDetail(task?.id);
  const createComment = useCreateTaskComment(task?.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: "",
      status: "TODO",
      priority: "MEDIUM",
      ...initialData,
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo || undefined,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split("T")[0]
          : undefined,
        relatedRecordId: task.relatedRecordId,
        relatedType: task.relatedType as any,
      });
    } else {
      reset({
        title: "",
        status: "TODO",
        priority: "MEDIUM",
        ...initialData,
      });
    }
  }, [task, reset, initialData]);

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      if (task) {
        await updateTask.mutateAsync(data);
      } else {
        await createTask.mutateAsync(data);
      }
      onClose();
      reset();
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const inputClass =
    "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/10";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <SlideDrawer
      open={isOpen}
      onClose={onClose}
      title={task ? "Edit Task" : "New Task"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full -mx-5 -my-4">
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Title */}
          <div>
            <label className={labelClass}>Title</label>
            <input
              {...register("title")}
              className={inputClass}
              placeholder="e.g., Call client regarding service request"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className={inputClass}
              placeholder="Any additional details..."
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Priority</label>
              <select {...register("priority")} className={inputClass}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select {...register("status")} className={inputClass}>
                <option value="TODO">To Do</option>
                <option value="DOING">Doing</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Assign To */}
          <div>
            <label className={labelClass}>Assign To</label>
            <select
              {...register("assignedTo", { valueAsNumber: true })}
              className={inputClass}
            >
              <option value="">Unassigned</option>
              {staff?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className={labelClass}>Due Date</label>
            <input type="date" {...register("dueDate")} className={inputClass} />
          </div>

          {/* Related Record */}
          {(initialData?.relatedRecordId || task?.relatedRecordId) && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Related to {task?.relatedType || initialData?.relatedType}
              </p>
              <p className="mt-1 text-sm text-gray-900 font-medium">
                ID: {task?.relatedRecordId || initialData?.relatedRecordId}
              </p>
            </div>
          )}

          {/* Comments Section (only when editing) */}
          {task && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                Comments
              </h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {(!taskDetail?.comments || taskDetail.comments.length === 0) && (
                  <p className="text-xs text-gray-400">No comments yet.</p>
                )}
                {taskDetail?.comments?.map((comment: any) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-3"
                  >
                    <p className="text-sm text-gray-800">{comment.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className={`${inputClass} mt-0 flex-1`}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      await createComment.mutateAsync({
                        content: e.currentTarget.value,
                      });
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <button
                  type="button"
                  className="shrink-0 h-[38px] w-[38px] flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors"
                  onClick={async (e) => {
                    const input = (e.currentTarget as HTMLElement)
                      .previousElementSibling as HTMLInputElement;
                    if (input?.value.trim()) {
                      await createComment.mutateAsync({
                        content: input.value,
                      });
                      input.value = "";
                    }
                  }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-5 py-4 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors disabled:opacity-50"
          >
            {isSubmitting
              ? "Saving..."
              : task
                ? "Update Task"
                : "Create Task"}
          </button>
        </div>
      </form>
    </SlideDrawer>
  );
}
