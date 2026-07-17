"use client";

import { ConfirmDialog } from "@/components/feedback/confirm-dialog";
import { useToast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { brand, dashboardCopy, routes } from "@/data/content";
import { projectKeys, projectMutations, projectQueries } from "@/features/projects/queries";
import type { Project, ProjectFilters, ProjectSort, ProjectStatus } from "@/features/projects/types";
import { Archive, Bell, Copy, Heart, Plus, RefreshCw, Search, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

const pageSize = 6;
const statuses: Array<ProjectFilters["status"]> = ["All", "Discovery", "Planning", "Architecture", "Ready"];
const sorts: Array<{ label: string; value: ProjectSort }> = [
  { label: "Recently updated", value: "updatedAt" },
  { label: "Name", value: "name" },
  { label: "Readiness", value: "score" },
  { label: "Priority", value: "priority" },
];

export function Dashboard() {
  const [filters, setFilters] = useState<ProjectFilters>({ search: "", status: "All", sort: "updatedAt", page: 1, pageSize });
  const [pendingArchive, setPendingArchive] = useState<Project | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notify } = useToast();
  const projectsQuery = useQuery(projectQueries.list(filters));

  const archiveMutation = useMutation({
    mutationFn: projectMutations.archiveProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: projectKeys.all });
      notify({ tone: "success", title: "Project archived", description: "The project was removed from the active workspace." });
      setPendingArchive(null);
    },
    onError: () => notify({ tone: "error", title: "Archive failed", description: "Please retry. If the issue continues, contact support." }),
  });

  const result = projectsQuery.data;
  const projects = useMemo(() => result?.projects ?? [], [result?.projects]);
  const totalPages = Math.max(1, Math.ceil((result?.total ?? 0) / pageSize));
  const chart = useMemo(() => projects.map((project) => ({ name: project.name, score: project.score })), [projects]);
  const stats = useMemo(() => buildStats(projects, result?.total ?? 0), [projects, result?.total]);

  function updateFilters(next: Partial<ProjectFilters>) {
    setFilters((current) => ({ ...current, ...next, page: next.page ?? 1 }));
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <b>{brand.name}</b>
          <label className="hidden min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)] md:flex">
            <Search size={16} aria-hidden="true" />
            <Input aria-label="Search projects" className="border-0 bg-transparent p-0 focus:ring-0" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder={dashboardCopy.searchPlaceholder} />
          </label>
          <div className="flex gap-3 text-[var(--muted)]" aria-label="Workspace actions"><Bell size={20} /><Settings size={20} /></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div><h1 className="text-3xl font-bold">{dashboardCopy.title}</h1><p className="text-[var(--muted)]">{dashboardCopy.subtitle}</p></div>
          <Button onClick={() => router.push(routes.demoProject)}><Plus size={16} /> {dashboardCopy.createProject}</Button>
        </div>

        <section className="mb-6 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 p-4 md:grid-cols-3" aria-label="Project filters">
          <label className="text-sm font-medium">Status<select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2" value={filters.status} onChange={(event) => updateFilters({ status: event.target.value as ProjectStatus | "All" })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="text-sm font-medium">Sort by<select className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2" value={filters.sort} onChange={(event) => updateFilters({ sort: event.target.value as ProjectSort })}>{sorts.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}</select></label>
          <label className="text-sm font-medium md:hidden">Search<Input className="mt-2" value={filters.search} onChange={(event) => updateFilters({ search: event.target.value })} placeholder={dashboardCopy.searchPlaceholder} /></label>
        </section>

        {projectsQuery.isLoading ? <DashboardSkeleton /> : projectsQuery.isError ? <ErrorState onRetry={() => projectsQuery.refetch()} /> : (
          <>
            <div className="grid gap-4 lg:grid-cols-4">{stats.map((stat) => <Stat key={stat.label} label={stat.label} value={stat.value} />)}</div>
            {projects.length === 0 ? <div className="mt-6"><EmptyState title="No active projects found" description="Adjust filters or start a new project to populate this workspace." action={<Button onClick={() => router.push(routes.demoProject)}><Plus size={16} /> Start project</Button>} /></div> : (
              <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
                <Card><h2 className="mb-4 font-semibold">{dashboardCopy.recentProjects}</h2><div className="space-y-3">{projects.map((project) => <ProjectRow key={project.id} project={project} onArchive={() => setPendingArchive(project)} />)}</div><Pagination page={filters.page} totalPages={totalPages} onPageChange={(page) => updateFilters({ page })} /></Card>
                <Card><h2 className="mb-4 font-semibold">{dashboardCopy.planningProgress}</h2><div className="h-48"><ResponsiveContainer><BarChart data={chart}><Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} /><Bar dataKey="score" fill="#8b7cff" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div><p className="mt-4 text-sm text-[var(--muted)]">Readiness is calculated from completed planning sections and should be reviewed before engineering kickoff.</p></Card>
              </div>
            )}
          </>
        )}
      </div>
      <ConfirmDialog open={Boolean(pendingArchive)} title="Archive project?" description="Archiving hides this project from active dashboards. You can restore it later from the database or admin tools." confirmLabel="Archive" busy={archiveMutation.isPending} onCancel={() => setPendingArchive(null)} onConfirm={() => pendingArchive && archiveMutation.mutate(pendingArchive.id)} />
    </main>
  );
}

function buildStats(projects: Project[], total: number) {
  const average = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / projects.length) : 0;
  const urgent = projects.filter((project) => project.priority === "Urgent").length;
  return [{ label: "Active projects", value: String(total) }, { label: "Avg readiness", value: `${average}%` }, { label: "Urgent projects", value: String(urgent) }, { label: "Visible results", value: String(projects.length) }];
}

function ProjectRow({ project, onArchive }: { project: Project; onArchive: () => void }) {
  return <a href={`/projects/${project.id}`} className="block rounded-xl border border-[var(--border)] p-4 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:hover:bg-white/5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{project.name}</h3><p className="text-sm text-[var(--muted)]">{project.status} · {project.priority} priority · {project.tags.join(", ")}</p><p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{project.description}</p></div><span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-700 dark:text-violet-300">{project.score}%</span></div><div className="mt-3 flex gap-2 text-[var(--muted)]"><Heart size={15} /><Copy size={15} /><Archive size={15} /><button type="button" aria-label={`Archive ${project.name}`} className="rounded p-0.5 hover:bg-red-500/10 hover:text-red-600" onClick={(event) => { event.preventDefault(); onArchive(); }}><Trash2 size={15} /></button></div></a>;
}

function Stat({ label, value }: { label: string; value: string }) { return <Card><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></Card>; }
function DashboardSkeleton() { return <div className="grid gap-4"><div className="grid gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)}</div><Skeleton className="h-96" /></div>; }
function ErrorState({ onRetry }: { onRetry: () => void }) { return <EmptyState title="Projects could not be loaded" description="We could not read the project workspace. Retry the request or contact support if it keeps failing." action={<Button onClick={onRetry}><RefreshCw size={16} /> Retry</Button>} />; }
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) { return <div className="mt-4 flex items-center justify-between text-sm"><Button className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button><span className="text-[var(--muted)]">Page {page} of {totalPages}</span><Button className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button></div>; }
