"use client";

import { useState } from "react";
import { useTasksList, useDeleteTask } from "@/hooks/use-data";
import { Plus, Search, Filter, Calendar, MessageSquare, Trash2, Edit } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { format } from "date-fns";

export default function TasksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const { data, isLoading } = useTasksList({
    page,
    limit: 10,
    search,
    status,
    sortBy: "dueDate",
    sortOrder: "asc",
  });

  const deleteTask = useDeleteTask();

  const handleEdit = (task: any) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask.mutateAsync(id);
    }
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Manage and track operational tasks</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900/10"
            >
              <option value="">All Statuses</option>
              <option value="TODO">To Do</option>
              <option value="DOING">Doing</option>
              <option value="BLOCKED">Blocked</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Assignee</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading tasks...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                data?.items.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{task.title}</div>
                        {task.description && (
                          <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                        {task.relatedType && (
                          <div className="mt-1">
                            <span className="text-[10px] bg-gray-100 text-black px-1.5 py-0.5 rounded font-bold uppercase">
                              {task.relatedType} #{task.relatedRecordId}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={task.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold uppercase">
                          {task.assignee ? task.assignee.firstName[0] + task.assignee.lastName[0] : "?"}
                        </div>
                        <span className="text-sm text-gray-700">
                          {task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "Unassigned"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <div className={`flex items-center gap-2 text-sm ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                          <Calendar className="w-4 h-4 opacity-70" />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button className="hover:text-black p-1" title="Comments">
                          <MessageSquare className="w-4 h-4" />
                          {task._count.comments > 0 && <span className="ml-1 text-xs">{task._count.comments}</span>}
                        </button>
                        <button 
                          onClick={() => handleEdit(task)}
                          className="hover:text-black p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.pagination.total)} of {data.pagination.total} tasks
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page === data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <TaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        task={selectedTask}
      />
    </div>
  );
}
