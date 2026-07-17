"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { projectCopy } from "@/data/content";
import { projectQueries } from "@/features/projects/queries";
import { aiActions, perfItems, projectNav, securityItems, stack } from "@/data/mock";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export function ProjectShell({ projectId }: { projectId: string }) {
  const projectQuery = useQuery(projectQueries.detail(projectId));

  if (projectQuery.isLoading) return <ProjectLoading />;
  if (projectQuery.isError || !projectQuery.data) return <main className="grid min-h-screen place-items-center p-6"><EmptyState title="Project not found" description="This project may have been archived, deleted, or you may not have access." action={<Button onClick={() => projectQuery.refetch()}><RefreshCw size={16} /> Retry</Button>} /></main>;

  const project = projectQuery.data;

  return (
    <main className="flex min-h-screen bg-[var(--background)]">
      <aside className="hidden w-72 border-r border-[var(--border)] bg-[var(--card)]/50 p-5 lg:block">
        <b>{project.name}</b>
        <nav className="mt-6 space-y-1" aria-label="Project sections">
          {projectNav.map((item, index) => <a key={item} className={`block rounded-lg px-3 py-2 text-sm font-medium ${index === 0 ? "bg-violet-500/15 text-violet-700 dark:text-violet-200" : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"}`}>{item}</a>)}
        </nav>
      </aside>
      <section className="flex-1 p-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div><p className="text-sm font-semibold text-violet-700 dark:text-violet-300">{projectCopy.eyebrow}</p><h1 className="text-4xl font-bold">{project.name}</h1><p className="mt-2 text-[var(--muted)]">{project.description}</p></div>
            <span className="w-fit rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-700 dark:text-violet-300">{project.score}% ready</span>
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <Card><h2 className="font-semibold">{projectCopy.sections.discovery}</h2>{projectCopy.discoveryFields.map((field) => <Field key={field} label={field} />)}</Card>
            <Card><h2 className="font-semibold">{projectCopy.sections.architecture}</h2>{stack.map((item) => <Field key={item} label={item} value={item === "Frontend" ? "Next.js 16" : item === "Database" ? "PostgreSQL" : projectCopy.recommended} />)}</Card>
            <Card><h2 className="font-semibold">{projectCopy.sections.assistant}</h2><div className="mt-3 flex flex-wrap gap-2">{aiActions.map((action) => <span key={action} className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs text-[var(--foreground)]">{action}</span>)}</div></Card>
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-2"><Planner title={projectCopy.plannerTitles.api} rows={projectCopy.apiRows} /><Planner title={projectCopy.plannerTitles.database} rows={projectCopy.databaseRows} /><Planner title={projectCopy.plannerTitles.tasks} rows={projectCopy.taskRows} /><Planner title={projectCopy.plannerTitles.securityPerformance} rows={[...securityItems, ...perfItems]} /></div>
          <Card className="mt-4"><h2 className="font-semibold">{projectCopy.sections.documentation}</h2><div className="mt-3 whitespace-pre-line rounded-xl border border-[var(--border)] bg-slate-100 p-4 font-mono text-sm text-slate-700 dark:bg-black/30 dark:text-slate-300">{projectCopy.documentationBody}</div></Card>
        </motion.div>
      </section>
    </main>
  );
}

function ProjectLoading() { return <main className="min-h-screen p-6"><div className="mx-auto max-w-7xl"><Skeleton className="h-24" /><div className="mt-4 grid gap-4 xl:grid-cols-3"><Skeleton className="h-96" /><Skeleton className="h-96" /><Skeleton className="h-96" /></div></div></main>; }
function Field({ label, value = projectCopy.drafted }: { label: string; value?: string }) { return <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="text-sm font-medium">{value}</p></div>; }
function Planner({ title, rows }: { title: string; rows: string[] }) { return <Card><h2 className="font-semibold">{title}</h2><div className="mt-3 grid gap-2">{rows.map((row) => <div key={row} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 dark:bg-white/[.04] dark:text-slate-300">{row}</div>)}</div></Card>; }
