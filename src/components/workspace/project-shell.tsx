"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { projectQueries } from "@/features/projects/queries";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function ProjectShell({ id }: { id: string }) {
  const { data: project, isLoading, error } = useQuery(projectQueries.detail(id));

  if (isLoading) return <main className="min-h-screen p-6"><div className="mx-auto grid max-w-7xl gap-4"><Skeleton className="h-20" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div></main>;
  if (error) return <main className="grid min-h-screen place-items-center p-6"><EmptyState title="Unable to load project" description={error.message} action={<Link className="font-semibold text-violet-600" href="/dashboard">Back to dashboard</Link>} /></main>;
  if (!project) return null;

  const overview = [
    ["Platform", project.platform], ["Status", project.status], ["Priority", project.priority], ["Deadline", project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"], ["Readiness", `${project.score}%`], ["Tags", project.tags.join(", ") || "None"],
  ];
  const planners = [
    ["Requirements", project.counts?.requirements ?? 0], ["User stories", project.counts?.stories ?? 0], ["Features", project.counts?.features ?? 0], ["API endpoints", project.counts?.endpoints ?? 0], ["Database tables", project.counts?.tables ?? 0], ["Tasks", project.counts?.tasks ?? 0], ["Documents", project.counts?.docs ?? 0],
  ];

  return (
    <main className="flex min-h-screen bg-[var(--background)]">
      <aside className="hidden w-72 border-r border-[var(--border)] bg-[var(--card)]/50 p-5 lg:block"><b>{project.name}</b><nav className="mt-6 space-y-1">{["Overview", "Discovery", "Requirements", "API", "Database", "Tasks", "Documents", "Settings"].map((item, index) => <a key={item} className={`block rounded-lg px-3 py-2 text-sm font-medium ${index === 0 ? "bg-violet-500/15 text-violet-700 dark:text-violet-200" : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"}`}>{item}</a>)}</nav></aside>
      <section className="flex-1 p-6"><div className="mb-6"><p className="text-sm font-semibold text-violet-700 dark:text-violet-300">Project overview</p><h1 className="text-4xl font-bold">{project.name}</h1><p className="mt-2 max-w-3xl text-[var(--muted)]">{project.description || "No description has been added yet."}</p></div><div className="grid gap-4 xl:grid-cols-3"><Card><h2 className="font-semibold">Project facts</h2>{overview.map(([label, value]) => <Field key={label} label={label} value={value} />)}</Card><Card><h2 className="font-semibold">Planning artifacts</h2>{planners.map(([label, value]) => <Field key={label} label={label.toString()} value={`${value}`} />)}</Card><Card><h2 className="font-semibold">Production next steps</h2>{["Add discovery details", "Define acceptance criteria", "Document API contracts", "Complete database model", "Close launch checklist"].map((item) => <Field key={item} label={item} value="Open" />)}</Card></div></section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) { return <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-sm font-medium">{value}</p></div>; }
