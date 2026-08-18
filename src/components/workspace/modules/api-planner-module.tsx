"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type ApiEndpointItem = {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  route: string;
  description?: string | null;
  authRequired: boolean;
};

const methodColors = {
  GET: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  POST: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  PATCH: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  DELETE: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
};

export function ApiPlannerModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<"GET" | "POST" | "PUT" | "PATCH" | "DELETE">("GET");
  const [route, setRoute] = useState("");
  const [description, setDescription] = useState("");
  const [authRequired, setAuthRequired] = useState(true);

  const { data: endpoints = [], isLoading } = useQuery({
    queryKey: ["projects", projectId, "endpoints"],
    queryFn: () => fetchSubmodule<ApiEndpointItem[]>(projectId, "endpoints"),
  });

  const createMutation = useMutation({
    mutationFn: (newEp: any) => createSubmoduleItem<ApiEndpointItem>(projectId, "endpoints", newEp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "API Endpoint added", tone: "success" });
      setRoute("");
      setDescription("");
    },
    onError: (err: Error) => notify({ title: "Failed to add endpoint", description: err.message, tone: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "endpoints", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "endpoints"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "API Endpoint deleted", tone: "success" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!route.trim()) return;
    createMutation.mutate({
      method,
      route: route.trim(),
      description: description.trim() || undefined,
      authRequired,
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">API Contract Planner</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 font-mono font-bold outline-none focus:border-violet-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              placeholder="Endpoint route path (e.g. /api/v1/users/:id)"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 font-mono outline-none focus:border-violet-500"
            />
          </div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Endpoint description & response payload notes"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={authRequired}
                onChange={(e) => setAuthRequired(e.target.checked)}
              />
              Requires Authentication (Bearer JWT)
            </label>
            <Button disabled={createMutation.isPending || !route.trim()}>
              <Plus size={16} /> Add Endpoint
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Planned API Endpoints ({endpoints.length})</h2>
        {isLoading ? (
          <p className="mt-4 text-sm text-[var(--muted)]">Loading API endpoints...</p>
        ) : endpoints.length === 0 ? (
          <div className="mt-4 text-center py-8">
            <Globe size={36} className="mx-auto text-[var(--muted)]" />
            <p className="mt-2 text-sm text-[var(--muted)]">No API contracts defined yet. Use the builder above to specify your REST endpoints.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {endpoints.map((ep) => (
              <div key={ep.id} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--border)] p-3">
                <div className="flex items-center gap-3">
                  <span className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold ${methodColors[ep.method]}`}>
                    {ep.method}
                  </span>
                  <div>
                    <code className="font-mono text-sm font-semibold">{ep.route}</code>
                    {ep.description && <p className="text-xs text-[var(--muted)] mt-0.5">{ep.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {ep.authRequired && (
                    <span className="rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-0.5 text-xs text-[var(--muted)]">
                      Auth Required
                    </span>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate(ep.id)}
                    disabled={deleteMutation.isPending}
                    className="text-[var(--muted)] hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
