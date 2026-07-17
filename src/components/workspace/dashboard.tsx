"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardCopy, brand, routes } from "@/data/content";
import { checklist, sampleProjects } from "@/data/mock";
import { Archive, Bell, Copy, Heart, Plus, Search, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

export function Dashboard() {
  const chart = sampleProjects.map((project) => ({ name: project.name, score: project.score }));
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <b>{brand.name}</b>
          <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--muted)] md:flex">
            <Search size={16} /> {dashboardCopy.searchPlaceholder}
          </div>
          <div className="flex gap-3 text-[var(--muted)]" aria-label="Workspace actions">
            <Bell size={20} />
            <Settings size={20} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{dashboardCopy.title}</h1>
            <p className="text-[var(--muted)]">{dashboardCopy.subtitle}</p>
          </div>
          <Button onClick={() => router.push(routes.demoProject)}>
            <Plus size={16} /> {dashboardCopy.createProject}
          </Button>
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {dashboardCopy.stats.map((stat) => <Stat key={stat.label} label={stat.label} value={stat.value} />)}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <Card>
            <h2 className="mb-4 font-semibold">{dashboardCopy.recentProjects}</h2>
            <div className="space-y-3">
              {sampleProjects.map((project) => (
                <a href={routes.demoProject} key={project.name} className="block rounded-xl border border-[var(--border)] p-4 transition hover:bg-slate-100 dark:hover:bg-white/5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-[var(--muted)]">
                        {project.status} · {project.priority} priority · {dashboardCopy.tagsLabel} {project.tags.join(", ")}
                      </p>
                    </div>
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm font-semibold text-violet-700 dark:text-violet-300">{project.score}%</span>
                  </div>
                  <div className="mt-3 flex gap-2 text-[var(--muted)]">
                    <Heart size={15} /><Copy size={15} /><Archive size={15} /><Trash2 size={15} />
                  </div>
                </a>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 font-semibold">{dashboardCopy.planningProgress}</h2>
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={chart}>
                  <Tooltip contentStyle={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }} />
                  <Bar dataKey="score" fill="#8b7cff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {checklist.map((item) => (
              <div key={item.name} className="mt-3 flex justify-between text-sm">
                <span>{item.name}</span>
                <span className={item.complete ? "font-medium text-emerald-700 dark:text-emerald-300" : "font-medium text-amber-700 dark:text-amber-300"}>
                  {item.complete ? dashboardCopy.completed : dashboardCopy.missing}
                </span>
              </div>
            ))}
          </Card>
        </div>
        <Card className="mt-6">
          <h2 className="font-semibold">{dashboardCopy.recentActivity}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{dashboardCopy.activitySummary}</p>
        </Card>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Card>
  );
}
