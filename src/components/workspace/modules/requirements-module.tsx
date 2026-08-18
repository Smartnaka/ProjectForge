"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type RequirementItem = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  position: number;
};

export function RequirementsModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Functional");
  const [body, setBody] = useState("");

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ["projects", projectId, "requirements"],
    queryFn: () => fetchSubmodule<RequirementItem[]>(projectId, "requirements"),
  });

  const createMutation = useMutation({
    mutationFn: (newReq: { title: string; type: string; body?: string }) =>
      createSubmoduleItem<RequirementItem>(projectId, "requirements", newReq),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Requirement created", tone: "success" });
      setTitle("");
      setBody("");
    },
    onError: (err: Error) => notify({ title: "Failed to create", description: err.message, tone: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (reqId: string) => deleteSubmoduleItem(projectId, "requirements", reqId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "requirements"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Requirement deleted", tone: "success" });
    },
    onError: (err: Error) => notify({ title: "Failed to delete", description: err.message, tone: "error" }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    createMutation.mutate({ title: title.trim(), type, body: body.trim() || undefined });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">Add Requirement</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Requirement title (e.g. Users must be able to export reports as PDF)"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 outline-none focus:border-violet-500"
            >
              <option value="Functional">Functional</option>
              <option value="Non-Functional">Non-Functional</option>
              <option value="Business">Business</option>
              <option value="Compliance">Compliance</option>
              <option value="Security">Security</option>
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Detailed requirement description (optional)"
            rows={2}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:border-violet-500"
          />
          <Button disabled={createMutation.isPending || !title.trim()}>
            <Plus size={16} /> Add Requirement
          </Button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Requirements ({requirements.length})</h2>
        </div>
        {isLoading ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Loading requirements...</p>
        ) : requirements.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--muted)]">No requirements added yet. Use the form above to define your project requirements.</p>
        ) : (
          <div className="mt-4 divide-y divide-[var(--border)]">
            {requirements.map((req) => (
              <div key={req.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                      {req.type}
                    </span>
                    <h3 className="font-semibold">{req.title}</h3>
                  </div>
                  {req.body && <p className="mt-1 text-sm text-[var(--muted)]">{req.body}</p>}
                </div>
                <button
                  onClick={() => deleteMutation.mutate(req.id)}
                  disabled={deleteMutation.isPending}
                  aria-label={`Delete requirement ${req.title}`}
                  className="text-[var(--muted)] hover:text-red-500 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
