"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardCopy, brand, routes } from "@/data/content";
import { projectMutations, projectQueries } from "@/features/projects/queries";
import { createProjectSchema } from "@/lib/schemas";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Bell, Heart, LogOut, Plus, Search, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

export function Dashboard() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryClient = useQueryClient();
  const filters = { search: debouncedSearch, status: "All" as const, sort: "updatedAt" as const, page: 1, pageSize: 12 };
  const { data, isLoading, error } = useQuery(projectQueries.list(filters));

  const createMutation = useMutation({ mutationFn: projectMutations.createProject, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }) });
  const archiveMutation = useMutation({ mutationFn: projectMutations.archiveProject, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }) });
  const projects = data?.projects ?? [];
  const chart = projects.map((project) => ({ name: project.name, score: project.score }));
  const openTasks = projects.reduce((sum, project) => sum + (project.counts?.tasks ?? 0), 0);
  const avgScore = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / projects.length) : 0;

  function createBlankProject() {
    createMutation.mutate(createProjectSchema.parse({ name: `Untitled project ${new Date().toLocaleDateString()}`, description: "New production planning workspace ready for real project data.", platform: "Web", priority: "Medium", deadline: null }));
  }

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push(routes.login);
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4"><b>{brand.name}</b><label className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)] md:flex"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={dashboardCopy.searchPlaceholder} className="bg-transparent outline-none" /></label><div className="flex gap-3 text-[var(--muted)] items-center" aria-label="Workspace actions"><Bell size={20} /><Settings size={20} /><button onClick={handleSignOut} aria-label="Sign out" title="Sign out" className="hover:text-[var(--foreground)] transition"><LogOut size={20} /></button></div></div></header>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-3xl font-bold">{dashboardCopy.title}</h1><p className="text-[var(--muted)]">{dashboardCopy.subtitle}</p></div><Button onClick={createBlankProject} disabled={createMutation.isPending}><Plus size={16} /> {createMutation.isPending ? "Creating..." : dashboardCopy.createProject}</Button></div>
        <div className="grid gap-4 lg:grid-cols-4"><Stat label="Projects" value={String(data?.total ?? 0)} /><Stat label="Avg readiness" value={`${avgScore}%`} /><Stat label="Open tasks" value={String(openTasks)} /><Stat label="Search results" value={String(projects.length)} /></div>
        {isLoading ? <div className="mt-6 grid gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div> : error ? <EmptyState title="Unable to load projects" description={error.message} /> : projects.length === 0 ? <EmptyState title="No projects yet" description="Create your first production-backed planning workspace." action={<Button onClick={createBlankProject}><Plus size={16} /> Create project</Button>} /> : <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><Card><h2 className="mb-4 font-semibold">{dashboardCopy.recentProjects}</h2><div className="space-y-3">{projects.map((project) => <div key={project.id} className="rounded-xl border border-[var(--border)] p-4 transition hover:bg-slate-100 dark:hover:bg-white/5"><div className="flex items-start justify-between gap-4"><div><Link href={`/projects/${project.id}`} className="font-semibold hover:text-violet-600">{project.name}</Link><p className="text-sm text-[var(--muted)]">{project.status} · {project.priority} priority · {dashboardCopy.tagsLabel} {project.tags.join(", ") || "none"}</p></div><span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-700 dark:text-violet-300">{project.score}%</span></div><div className="mt-3 flex gap-2 text-[var(--muted)]"><Heart size={15} /><button aria-label={`Archive ${project.name}`} onClick={() => archiveMutation.mutate(project.id)} disabled={archiveMutation.isPending}><Archive size={15} /></button></div></div>)}</div></Card><Card><h2 className="mb-4 font-semibold">{dashboardCopy.planningProgress}</h2><div className="h-48"><ResponsiveContainer><BarChart data={chart}><Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} /><Bar dataKey="score" fill="#8b7cff" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card></div>}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <Card><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></Card>; }
