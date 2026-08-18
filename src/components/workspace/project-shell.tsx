"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { projectQueries } from "@/features/projects/queries";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Database, FileText, Globe, Layers, ListTodo, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { RequirementsModule } from "./modules/requirements-module";
import { StoriesFeaturesModule } from "./modules/stories-features-module";
import { DatabasePlannerModule } from "./modules/database-planner-module";
import { ApiPlannerModule } from "./modules/api-planner-module";
import { TaskBoardModule } from "./modules/task-board-module";
import { DocumentsModule } from "./modules/documents-module";

type TabKey = "Overview" | "Requirements" | "Stories & Features" | "API Planner" | "Database Designer" | "Task Board" | "Documents";

const navItems: { key: TabKey; label: string; icon: any }[] = [
  { key: "Overview", label: "Overview", icon: Sparkles },
  { key: "Requirements", label: "Requirements", icon: Layers },
  { key: "Stories & Features", label: "Stories & Scope", icon: ListTodo },
  { key: "API Planner", label: "API Planner", icon: Globe },
  { key: "Database Designer", label: "DB Designer", icon: Database },
  { key: "Task Board", label: "Task Board", icon: CheckCircle2 },
  { key: "Documents", label: "Documents", icon: FileText },
];

export function ProjectShell({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const { data: project, isLoading, error } = useQuery(projectQueries.detail(id));

  if (isLoading)
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto grid max-w-7xl gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </main>
    );

  if (error)
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <EmptyState
          title="Unable to load project"
          description={error.message}
          action={
            <Link className="font-semibold text-violet-600" href="/dashboard">
              Back to dashboard
            </Link>
          }
        />
      </main>
    );

  if (!project) return null;

  const overview = [
    ["Platform", project.platform],
    ["Status", project.status],
    ["Priority", project.priority],
    ["Deadline", project.deadline ? new Date(project.deadline).toLocaleDateString() : "Not set"],
    ["Readiness Score", `${project.score}%`],
    ["Tags", project.tags.join(", ") || "None"],
  ];

  const planners = [
    ["Requirements", project.counts?.requirements ?? 0],
    ["User stories", project.counts?.stories ?? 0],
    ["Features", project.counts?.features ?? 0],
    ["API endpoints", project.counts?.endpoints ?? 0],
    ["Database tables", project.counts?.tables ?? 0],
    ["Tasks", project.counts?.tasks ?? 0],
    ["Documents", project.counts?.docs ?? 0],
  ];

  return (
    <main className="flex min-h-screen bg-[var(--background)]">
      <aside className="hidden w-72 border-r border-[var(--border)] bg-[var(--card)]/50 p-5 lg:block flex-col">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)]">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>
        <h2 className="font-bold text-lg truncate">{project.name}</h2>
        <p className="text-xs text-[var(--muted)]">{project.platform} · {project.status}</p>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-sm shadow-violet-950/20"
                    : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5 hover:text-[var(--foreground)]"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="flex-1 p-6 overflow-x-hidden">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="lg:hidden text-xs text-violet-600 font-semibold flex items-center gap-1">
                <ArrowLeft size={12} /> Dashboard
              </Link>
              <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{activeTab}</span>
            </div>
            <h1 className="text-3xl font-bold mt-1">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-1.5 text-sm font-bold text-violet-700 dark:text-violet-300">
            Readiness: {project.score}%
          </div>
        </div>

        {/* Mobile Sub-Navigation Pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
                activeTab === item.key ? "bg-violet-600 text-white" : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-6">
            <Card>
              <h2 className="font-semibold text-lg">Project Summary</h2>
              <p className="mt-2 text-[var(--muted)]">{project.description || "No project description provided."}</p>
            </Card>
            <div className="grid gap-4 xl:grid-cols-3">
              <Card>
                <h2 className="font-semibold">Project Facts</h2>
                {overview.map(([label, value]) => (
                  <Field key={label} label={label} value={value} />
                ))}
              </Card>

              <Card>
                <h2 className="font-semibold">Planning Artifacts</h2>
                {planners.map(([label, value]) => (
                  <Field key={label} label={label.toString()} value={`${value}`} />
                ))}
              </Card>

              <Card>
                <h2 className="font-semibold">Production Checklist</h2>
                {[
                  ["Requirements Defined", (project.counts?.requirements ?? 0) > 0 ? "Complete" : "Open"],
                  ["User Stories Captured", (project.counts?.stories ?? 0) > 0 ? "Complete" : "Open"],
                  ["API Contracts Specified", (project.counts?.endpoints ?? 0) > 0 ? "Complete" : "Open"],
                  ["Database Model Designed", (project.counts?.tables ?? 0) > 0 ? "Complete" : "Open"],
                  ["Delivery Tasks Board", (project.counts?.tasks ?? 0) > 0 ? "Complete" : "Open"],
                  ["Docs & SRS Written", (project.counts?.docs ?? 0) > 0 ? "Complete" : "Open"],
                ].map(([label, status]) => (
                  <div key={label} className="mt-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 text-sm">
                    <span>{label}</span>
                    <span className={`font-semibold text-xs rounded-full px-2.5 py-0.5 ${status === "Complete" ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}

        {activeTab === "Requirements" && <RequirementsModule projectId={project.id} />}
        {activeTab === "Stories & Features" && <StoriesFeaturesModule projectId={project.id} />}
        {activeTab === "Database Designer" && <DatabasePlannerModule projectId={project.id} />}
        {activeTab === "API Planner" && <ApiPlannerModule projectId={project.id} />}
        {activeTab === "Task Board" && <TaskBoardModule projectId={project.id} />}
        {activeTab === "Documents" && <DocumentsModule projectId={project.id} />}
      </section>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

