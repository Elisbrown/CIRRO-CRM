"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { SlideDrawer } from "@/components/ui/SlideDrawer";
import {
  useCreateTask, useUpdateTask, useTaskDetail,
  useCreateTaskComment, useStaffLookup,
  useCreateSubTask, useUpdateSubTask, useDeleteSubTask,
  useUploadTaskAttachment, useDeleteTaskAttachment,
} from "@/hooks/use-data";
import { createTaskSchema } from "@/lib/validations";
import type { CreateTaskInput } from "@/lib/validations";
import { FilePreviewer } from "@/components/ui/FilePreviewer";
import {
  Plus, Send, Trash2, Paperclip, FileText, X, Check,
  MessageSquare, ListChecks, Activity, Clock, RefreshCw,
  ChevronDown, Eye, Download, ImageIcon,
} from "lucide-react";

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
  initialData?: Partial<CreateTaskInput>;
}

type TabId = "details" | "subtasks" | "attachments" | "comments" | "logs";

const STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "DOING", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PENDING_APPROVAL", label: "Submit for Approval" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

export function TaskDrawer({ isOpen, onClose, task, initialData }: TaskDrawerProps) {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || "STAFF";
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [comment, setComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [previewFile, setPreviewFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load full task detail when editing
  const { data: taskDetail } = useTaskDetail(task?.id || null);
  const activeTask = taskDetail || task;

  const { data: staffList } = useStaffLookup();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id || 0);
  const createComment = useCreateTaskComment(task?.id || 0);
  const createSubTask = useCreateSubTask(task?.id || 0);
  const updateSubTask = useUpdateSubTask(task?.id || 0);
  const deleteSubTask = useDeleteSubTask(task?.id || 0);
  const uploadAttachment = useUploadTaskAttachment(task?.id || 0);
  const deleteAttachment = useDeleteTaskAttachment(task?.id || 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: task?.title || initialData?.title || "",
      description: task?.description || initialData?.description || "",
      assignedTo: task?.assignedTo || initialData?.assignedTo || undefined,
      priority: task?.priority || initialData?.priority || "MEDIUM",
      status: task?.status || initialData?.status || "TODO",
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
      relatedRecordId: task?.relatedRecordId || initialData?.relatedRecordId || undefined,
      relatedType: task?.relatedType || initialData?.relatedType || undefined,
      isGeneral: task?.isGeneral || false,
      isRecurring: task?.isRecurring || false,
      recurringInterval: task?.recurringInterval || undefined,
      recurringDays: task?.recurringDays || undefined,
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (isOpen) {
      reset({
        title: task?.title || initialData?.title || "",
        description: task?.description || initialData?.description || "",
        assignedTo: task?.assignedToId || task?.assignedTo || initialData?.assignedTo || undefined,
        priority: task?.priority || initialData?.priority || "MEDIUM",
        status: task?.status || initialData?.status || "TODO",
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
        relatedRecordId: task?.relatedRecordId || initialData?.relatedRecordId || undefined,
        relatedType: task?.relatedType || initialData?.relatedType || undefined,
        isRecurring: task?.isRecurring || false,
        recurringInterval: task?.recurringInterval || undefined,
        recurringDays: task?.recurringDays || undefined,
      });
      setActiveTab("details");
    }
  }, [task, isOpen, reset, initialData]);

  // Auto-scroll messaging
  useEffect(() => {
    if (activeTab === "comments") {
      const anchor = document.getElementById("scroll-anchor");
      anchor?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTask?.comments, activeTab]);

  const isRecurring = watch("isRecurring");

  // Filter status options for staff
  const availableStatuses = (session?.user?.role as string) === "STAFF"
    ? STATUS_OPTIONS.filter((s) => s.value !== "DONE")
    : STATUS_OPTIONS;

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      if (task?.id) {
        await updateTask.mutateAsync(data);
      } else {
        await createTask.mutateAsync(data);
      }
      reset();
      onClose();
    } catch (err) {
      console.error("Task save error:", err);
    }
  };

  const handleApproveTask = async () => {
    if (!task || userRole !== "MANAGER") return;
    await updateTask.mutateAsync({ status: "DONE" });
    onClose();
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task) return;
    await createComment.mutateAsync({ content: comment });
    setComment("");
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !task) return;
    await createSubTask.mutateAsync({ title: newSubtask, isCompleted: false, sortOrder: 0 });
    setNewSubtask("");
  };

  const handleToggleSubtask = async (subtaskId: number, isCompleted: boolean) => {
    await updateSubTask.mutateAsync({ subtaskId, isCompleted: !isCompleted });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !task) return;

    for (const file of Array.from(files)) {
      try {
        await uploadAttachment.mutateAsync(file);
      } catch (err: any) {
        console.error("Upload failed:", err);
        // The error is already handled by the queryClient/Toast system in Providers.tsx
        // but we catch it here to prevent the loop from breaking or unexpected behavior.
      }
    }
    e.target.value = "";
  };

  const TABS: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: "details", label: "Details", icon: FileText },
    ...(task
      ? [
        { id: "subtasks" as TabId, label: "Checklist", icon: ListChecks, count: activeTask?.subTasks?.length || 0 },
        { id: "attachments" as TabId, label: "Files", icon: Paperclip, count: activeTask?.attachments?.length || 0 },
        { id: "comments" as TabId, label: "Comments", icon: MessageSquare, count: activeTask?.comments?.length || 0 },
        { id: "logs" as TabId, label: "Activity", icon: Activity, count: activeTask?.logs?.length || 0 },
      ]
      : []),
  ];

  return (
    <SlideDrawer open={isOpen} onClose={onClose} title={task ? "Edit Task" : "New Task"} width="max-w-xl">
      {/* Tab bar */}
      {task && (
        <div className="flex gap-1 border-b border-gray-200 -mx-5 px-5 mb-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.count ? (
                  <span className="bg-gray-100 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}

      {/* Approval banner */}
      {task && activeTask?.status === "PENDING_APPROVAL" && userRole === "MANAGER" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
            <p className="text-xs text-yellow-600">Staff marked this task as complete.</p>
          </div>
          <button
            onClick={handleApproveTask}
            className="bg-green-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-green-700 flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Approve
          </button>
        </div>
      )}

      {/* DETAILS TAB */}
      {activeTab === "details" && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                {...register("title")}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Task title"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{String(errors.title.message)}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black resize-none"
                placeholder="Task description..."
              />
            </div>

            {/* General Task (Assign to all) */}
            {!task && (
              <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 p-3 rounded-lg mb-4">
                <input
                  type="checkbox"
                  id="isGeneral"
                  {...register("isGeneral")}
                  className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="isGeneral" className="text-xs font-bold text-blue-900 flex items-center gap-1.5 cursor-pointer">
                  <RefreshCw className="w-3 h-3" />
                  General Task (Auto-assign to all staff)
                </label>
              </div>
            )}

            {/* Row: Assignee + Priority */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-medium text-gray-600 mb-1 ${watch("isGeneral") ? "opacity-40" : ""}`}>
                  Assign To
                </label>
                <select
                  disabled={watch("isGeneral")}
                  {...register("assignedTo", { setValueAs: (v) => (v ? parseInt(v) : null) })}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black transition-opacity ${watch("isGeneral") ? "opacity-40" : ""
                    }`}
                >
                  <option value="">Unassigned</option>
                  {staffList?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  {...register("priority")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row: Status + Due Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  {...register("status")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                >
                  {availableStatuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  {...register("dueDate")}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            {/* Recurring */}
            <div className="border border-gray-200 rounded-lg p-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isRecurring")}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Recurring Task</span>
              </label>
              {isRecurring && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Interval</label>
                    <select
                      {...register("recurringInterval")}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select...</option>
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                      <option value="CUSTOM">Custom (Days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Custom Days</label>
                    <input
                      type="number"
                      {...register("recurringDays", { setValueAs: (v) => (v ? parseInt(v) : null) })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="e.g. 14"
                      min={1}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save/Cancel buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-4">
            <button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
              className="flex-1 bg-black text-white font-medium py-2 px-4 rounded-md text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              {task ? "Update Task" : "Create Task"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* SUBTASKS TAB */}
      {activeTab === "subtasks" && task && (
        <div className="space-y-3">
          {/* Add new subtask */}
          <div className="flex gap-2">
            <input
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSubtask())}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black"
              placeholder="Add sub-task..."
            />
            <button
              onClick={handleAddSubtask}
              disabled={!newSubtask.trim()}
              className="bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Subtask list */}
          <div className="space-y-1.5">
            {activeTask?.subTasks?.map((st: any) => (
              <div key={st.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => handleToggleSubtask(st.id, st.isCompleted)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${st.isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-gray-400"
                    }`}
                >
                  {st.isCompleted && <Check className="w-3 h-3" />}
                </button>
                <span className={`flex-1 text-sm ${st.isCompleted ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {st.title}
                </span>
                <button
                  onClick={() => deleteSubTask.mutate(st.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {(!activeTask?.subTasks || activeTask.subTasks.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">No sub-tasks yet</p>
            )}
          </div>

          {/* Progress bar */}
          {activeTask?.subTasks?.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>
                  {activeTask.subTasks.filter((s: any) => s.isCompleted).length}/{activeTask.subTasks.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${(activeTask.subTasks.filter((s: any) => s.isCompleted).length / activeTask.subTasks.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ATTACHMENTS TAB */}
      {activeTab === "attachments" && task && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors"
          >
            <Paperclip className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-500">Click to upload files</p>
            <p className="text-xs text-gray-400">Max 50MB per file</p>
          </button>

          {uploadAttachment.isPending && (
            <p className="text-xs text-blue-500 text-center">Uploading...</p>
          )}

          <div className="space-y-2">
            {activeTask?.attachments?.map((att: any) => {
              const isImage = /\.(png|jpg|jpeg|svg|gif|webp|avif|heif|heic)$/i.test(att.fileName);
              const isPDF = att.fileName.toLowerCase().endsWith(".pdf");
              const isWord = /\.(docx?|doc)$/i.test(att.fileName);

              return (
                <div key={att.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
                  <div
                    className="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    onClick={() => setPreviewFile(att)}
                  >
                    {isImage ? (
                      <ImageIcon className="w-4 h-4 text-blue-500" />
                    ) : isPDF ? (
                      <FileText className="w-4 h-4 text-red-500" />
                    ) : isWord ? (
                      <FileText className="w-4 h-4 text-blue-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPreviewFile(att)}>
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {att.fileName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {(att.fileSize / 1024).toFixed(1)} KB
                      {att.uploadedBy && ` · ${att.uploadedBy.firstName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setPreviewFile(att)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-white rounded"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = att.fileUrl;
                        link.download = att.fileName;
                        link.click();
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-white rounded"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteAttachment.mutate(att.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {(!activeTask?.attachments || activeTask.attachments.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">No attachments yet</p>
            )}
          </div>
        </div>
      )}

      {/* MESSAGING INTERFACE */}
      {activeTab === "comments" && task && (
        <div className="flex flex-col h-[600px] -mx-5 px-5">
          <div className="flex-1 overflow-y-auto space-y-4 py-4 scroll-smooth min-h-0" id="message-container">
            {activeTask?.comments?.map((c: any) => {
              const isMe = c.authorId === (session?.user?.id ? parseInt(session.user.id) : null);
              return (
                <div key={c.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] flex gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-gray-600">
                        {c.author ? `${c.author.firstName[0]}${c.author.lastName[0]}` : "?"}
                      </div>
                    )}
                    <div>
                      <div className={`rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-black text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                        }`}>
                        {!isMe && (
                          <p className="text-[10px] font-bold mb-1 opacity-70">
                            {c.author ? `${c.author.firstName} ${c.author.lastName}` : `User #${c.authorId}`}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{c.content}</p>
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(c.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {(!activeTask?.comments || activeTask.comments.length === 0) && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                <MessageSquare className="w-8 h-8 opacity-20" />
                <p className="text-xs">No messages yet. Start the conversation!</p>
              </div>
            )}
            <div id="scroll-anchor" />
          </div>
          <div className="pt-4 border-t border-gray-100 pb-2">
            <div className="flex gap-2 bg-gray-50 rounded-full pl-4 pr-1 py-1 border border-gray-200 focus-within:border-black transition-colors">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAddComment())}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 placeholder:text-gray-400"
                placeholder="Type a message..."
              />
              <button
                onClick={handleAddComment}
                disabled={!comment.trim() || createComment.isPending}
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === "logs" && task && (
        <div className="space-y-2">
          {activeTask?.logs?.map((log: any) => (
            <div key={log.id} className="flex gap-3 py-2 border-b border-gray-50">
              <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{log.action.replace(/_/g, " ")}</span>
                  {log.details && <span className="text-gray-500"> — {log.details}</span>}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {log.performedBy && `${log.performedBy.firstName} ${log.performedBy.lastName} · `}
                  {new Date(log.createdAt).toLocaleDateString("en-US", {
                    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          {(!activeTask?.logs || activeTask.logs.length === 0) && (
            <p className="text-xs text-gray-400 text-center py-4">No activity recorded</p>
          )}
        </div>
      )}

      <FilePreviewer
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        fileUrl={previewFile?.fileUrl || ""}
        fileName={previewFile?.fileName || ""}
        mimeType={previewFile?.mimeType || ""}
      />
    </SlideDrawer>
  );
}
