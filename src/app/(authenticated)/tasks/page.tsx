"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTasksList, useDeleteTask } from "@/hooks/use-data";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { TaskKanbanBoard } from "@/components/tasks/TaskKanbanBoard";
import {
  Plus, Search, Kanban, List, Trash2, Clock, Filter,
} from "lucide-react";

const STATUS_FILTER = [
  { value: "", label: "All Status" },
  { value: "TODO", label: "To Do" },
  { value: "DOING", label: "In Progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "DONE", label: "Done" },
];

const PRIORITY_FILTER = [
  { value: "", label: "All Priority" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-700",
  DOING: "bg-blue-100 text-blue-700",
  BLOCKED: "bg-red-100 text-red-700",
  PENDING_APPROVAL: "bg-yellow-100 text-yellow-700",
  DONE: "bg-green-100 text-green-700",
};

const PRIORITY_DOTS: Record<string, string> = {
  LOW: "bg-gray-400",
  MEDIUM: "bg-blue-500",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

export default function TasksPage() {
  const { data: session } = useSession();
  const userRole = (session?.user?.role as string) || "STAFF";

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data, isLoading } = useTasksList({
    search,
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const deleteTask = useDeleteTask();

  const tasks = data?.items || [];

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleNewTask = () => {
    setSelectedTask(null);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Delete this task?")) {
      await deleteTask.mutateAsync(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5">
            <button
              onClick={() => setView("kanban")}
              className={`p-1.5 rounded text-sm ${view === "kanban" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
              title="Kanban View"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded text-sm ${view === "list" ? "bg-white shadow-sm text-black" : "text-gray-500"}`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleNewTask}
            className="flex items-center gap-1.5 bg-black text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Search tasks..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black"
        >
          {STATUS_FILTER.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black"
        >
          {PRIORITY_FILTER.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-black" />
        </div>
      )}

      {/* Kanban View */}
      {!isLoading && view === "kanban" && (
        <TaskKanbanBoard
          tasks={tasks}
          onTaskClick={handleTaskClick}
          userRole={userRole}
        />
      )}

      {/* List View */}
      {!isLoading && view === "list" && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Assignee</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider">Due Date</th>
                <th className="px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map((task: any) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";
                return (
                  <tr
                    key={task.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{task.title}</span>
                        {task.isRecurring && <span className="text-purple-500 text-xs">↻</span>}
                        {task._count?.subTasks > 0 && (
                          <span className="text-gray-400 text-xs">[{task._count.subTasks}]</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[task.status] || ""}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[task.priority]}`} />
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {task.dueDate ? (
                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-medium" : "text-gray-600"}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {userRole === "MANAGER" && (
                        <button
                          onClick={(e) => handleDelete(e, task.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No tasks found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Drawer */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />
    </div>
  );
}
