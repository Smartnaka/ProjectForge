"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";
import { Archive, Bell, Copy, Heart, Plus, Search, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createProject, loadProjects, saveProjects, type Project } from "@/lib/project-store";

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);

  function persist(next: Project[]) {
    setProjects(next);
    saveProjects(next);
  }

  const visibleProjects = useMemo(() => {
    const q = query.toLowerCase();
    return projects.filter((project) => !project.archived && [project.name, project.description, project.platform, project.tags.join(" ")].join(" ").toLowerCase().includes(q));
  }, [projects, query]);

  const chart = visibleProjects.map((project) => ({ name: project.name, score: project.score }));
  const averageReadiness = Math.round(visibleProjects.reduce((total, project) => total + project.score, 0) / Math.max(visibleProjects.length, 1));

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="font-bold">ProjectForge</a>
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] md:max-w-md">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects, APIs, stories..." className="w-full bg-transparent outline-none" />
          </label>
          <div className="flex gap-2"><Bell size={20} /><Settings size={20} /></div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Planning dashboard</h1>
            <p className="text-[var(--muted)]">Create, search, favorite, duplicate, archive, and delete software planning workspaces.</p>
          </div>
          <Button className="bg-violet-500 text-white" onClick={() => setShowForm((value) => !value)}><Plus size={16} /> Create project</Button>
        </div>

        {showForm ? <ProjectForm onCreate={(project) => persist([project, ...projects])} /> : null}

        <div className="grid gap-4 lg:grid-cols-4">
          <Stat label="Active projects" value={String(visibleProjects.length)} />
          <Stat label="Avg readiness" value={`${averageReadiness}%`} />
          <Stat label="Archived" value={String(projects.filter((project) => project.archived).length)} />
          <Stat label="Favorites" value={String(projects.filter((project) => project.favorite).length)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
          <Card>
            <h2 className="mb-4 font-semibold">Recent projects</h2>
            <div className="space-y-3">
              {visibleProjects.map((project) => (
                <ProjectRow key={project.id} project={project} onChange={(updated) => persist(projects.map((item) => item.id === updated.id ? updated : item))} onDuplicate={() => persist([{ ...project, id: `${project.id}-copy-${Date.now()}`, name: `${project.name} Copy`, favorite: false, createdAt: new Date().toISOString().slice(0, 10) }, ...projects])} onDelete={() => persist(projects.filter((item) => item.id !== project.id))} />
              ))}
              {visibleProjects.length === 0 ? <p className="rounded-xl border border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">No matching active projects. Create one or clear search.</p> : null}
            </div>
          </Card>
          <Card>
            <h2 className="mb-4 font-semibold">Planning progress</h2>
            <div className="h-48"><ResponsiveContainer><BarChart data={chart}><Tooltip /><Bar dataKey="score" fill="#8b7cff" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
            {visibleProjects.slice(0, 4).map((project) => <div key={project.id} className="mt-3 flex justify-between text-sm"><span>{project.name}</span><span className="text-violet-300">{project.score}%</span></div>)}
          </Card>
        </div>

        <Card className="mt-6">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-2 grid gap-2 text-sm text-[var(--muted)] md:grid-cols-3">
            {projects.flatMap((project) => project.activity.map((activity) => `${project.name}: ${activity}`)).slice(0, 6).map((activity) => <li key={activity} className="rounded-lg bg-white/[.03] p-3">{activity}</li>)}
          </ul>
        </Card>
      </div>
    </main>
  );
}

function ProjectForm({ onCreate }: { onCreate: (project: Project) => void }) {
  const [form, setForm] = useState({ name: "", description: "", platform: "Web", priority: "Medium" as Project["priority"], deadline: "" });
  return (
    <Card className="mb-6">
      <div className="grid gap-3 md:grid-cols-5">
        <input required placeholder="Project name" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input required placeholder="Description" className="rounded-xl border border-[var(--border)] bg-transparent px-3 py-2 md:col-span-2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <select className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2" value={form.platform} onChange={(event) => setForm({ ...form, platform: event.target.value })}><option>Web</option><option>Mobile</option><option>API</option><option>SaaS</option></select>
        <Button onClick={() => form.name && onCreate(createProject(form))}>Save project</Button>
      </div>
    </Card>
  );
}

function ProjectRow({ project, onChange, onDuplicate, onDelete }: { project: Project; onChange: (project: Project) => void; onDuplicate: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-4 transition hover:bg-white/5">
      <a href={`/projects/${project.id}`} className="block">
        <div className="flex items-start justify-between gap-4">
          <div><h3 className="font-semibold">{project.name}</h3><p className="text-sm text-[var(--muted)]">{project.status} · {project.priority} priority · {project.platform} · {project.tags.join(", ")}</p></div>
          <span className="rounded-full bg-violet-500/15 px-3 py-1 text-sm text-violet-300">{project.score}%</span>
        </div>
      </a>
      <div className="mt-3 flex gap-2 text-[var(--muted)]">
        <button aria-label="Favorite" onClick={() => onChange({ ...project, favorite: !project.favorite })}><Heart size={16} fill={project.favorite ? "currentColor" : "none"} /></button>
        <button aria-label="Duplicate" onClick={onDuplicate}><Copy size={16} /></button>
        <button aria-label="Archive" onClick={() => onChange({ ...project, archived: true, status: "Archived" })}><Archive size={16} /></button>
        <button aria-label="Delete" onClick={onDelete}><Trash2 size={16} /></button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></Card>;
}
