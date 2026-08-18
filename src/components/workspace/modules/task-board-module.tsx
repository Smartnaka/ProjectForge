"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule, updateSubmoduleItem } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Clock, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type TaskItem = {
  id: string;
  title: string;
  status: "BACKLOG" | "TODO" | "DOING" | "TESTING" | "DONE";
  position: number;
};

const columns: { key: TaskItem["status"]; label: string; icon: any }[] = [
  { key: "BACKLOG", label: "Backlog", icon: Circle },
  { key: "TODO", label: "To Do", icon: Circle },
  { key: "DOING", label: "In Progress", icon: Clock },
  { key: "TESTING", label: "Testing", icon: Clock },
  { key: "DONE", label: "Done", icon: CheckCircle2 },
];

export function TaskBoardModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskItem["status"]>("TODO");

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["projects", projectId, "tasks"],
    queryFn: () => fetchSubmodule<TaskItem[]>(projectId, "tasks"),
  });

  const createMutation = useMutation({
    mutationFn: (newTask: any) => createSubmoduleItem<TaskItem>(projectId, "tasks", newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Task created", tone: "success" });
      setTaskTitle("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskItem["status"] }) =>
      updateSubmoduleItem<TaskItem>(projectId, "tasks", taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "tasks", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Task deleted", tone: "success" });
    },
  });

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    createMutation.mutate({ title: taskTitle.trim(), status: taskStatus });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">Add Task</h2>
        <form onSubmit={handleCreateTask} className="mt-4 flex gap-3 sm:flex-row flex-col">
          <input
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="Task title (e.g. Implement authentication JWT middleware)"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
          />
          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value as any)}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 outline-none focus:border-violet-500"
          >
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="DOING">In Progress</option>
            <option value="TESTING">Testing</option>
            <option value="DONE">Done</option>
          </select>
          <Button disabled={createMutation.isPending || !taskTitle.trim()}>
            <Plus size={16} /> Add Task
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">Loading task board...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-5">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 p-3 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <span className="font-bold text-xs uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                    {col.label}
                  </span>
                  <span className="rounded-full bg-slate-200 dark:bg-white/10 px-2 py-0.5 text-xs font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 flex-1">
                  {colTasks.map((t) => (
                    <div key={t.id} className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 shadow-sm hover:border-violet-500/50 transition">
                      <p className="text-sm font-semibold">{t.title}</p>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[var(--border)]">
                        <select
                          value={t.status}
                          onChange={(e) => updateMutation.mutate({ taskId: t.id, status: e.target.value as any })}
                          className="bg-transparent text-xs text-[var(--muted)] outline-none cursor-pointer hover:text-[var(--foreground)]"
                        >
                          <option value="BACKLOG">Backlog</option>
                          <option value="TODO">To Do</option>
                          <option value="DOING">In Progress</option>
                          <option value="TESTING">Testing</option>
                          <option value="DONE">Done</option>
                        </select>
                        <button
                          onClick={() => deleteMutation.mutate(t.id)}
                          className="text-[var(--muted)] hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-[var(--muted)] border border-dashed border-[var(--border)] rounded-xl">
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
