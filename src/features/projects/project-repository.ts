import { createProjectSchema } from "@/lib/schemas";
import type { Project, ProjectFilters, ProjectListResult, ProjectPriority } from "./types";
import type { z } from "zod";

const storageKey = "projectforge.projects.v2";
const networkDelayMs = 250;

const seedProjects: Project[] = [
  {
    id: "atlas-crm",
    name: "Atlas CRM",
    description: "A B2B customer relationship platform with team workflows, audit trails, and reporting.",
    platform: "SaaS",
    status: "Planning",
    priority: "High",
    deadline: "2026-09-15",
    tags: ["SaaS", "B2B", "Postgres"],
    favorite: true,
    archived: false,
    score: 82,
    activity: ["Generated REST API draft", "Added OAuth security checklist", "Completed database schema"],
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-15T14:30:00.000Z",
  },
  {
    id: "pulse-mobile",
    name: "Pulse Mobile",
    description: "Realtime habit and health tracking application for iOS and Android teams.",
    platform: "Mobile",
    status: "Discovery",
    priority: "Medium",
    deadline: "2026-10-01",
    tags: ["Mobile", "Realtime"],
    favorite: false,
    archived: false,
    score: 54,
    activity: ["Captured target users", "Drafted first user stories"],
    createdAt: "2026-07-08T09:00:00.000Z",
    updatedAt: "2026-07-12T11:00:00.000Z",
  },
  {
    id: "forge-api",
    name: "Forge API",
    description: "Internal API governance workspace for authentication, billing, and usage analytics.",
    platform: "API",
    status: "Architecture",
    priority: "Urgent",
    deadline: "2026-08-20",
    tags: ["API", "Auth", "Billing"],
    favorite: false,
    archived: false,
    score: 71,
    activity: ["Reviewed endpoint contracts", "Added rate-limit requirements"],
    createdAt: "2026-07-10T12:00:00.000Z",
    updatedAt: "2026-07-16T16:45:00.000Z",
  },
];

function assertBrowserStorage() {
  if (typeof window === "undefined") throw new Error("Project repository is only available in the browser until the API layer is connected.");
}

function delay() {
  return new Promise((resolve) => window.setTimeout(resolve, networkDelayMs));
}

function readProjects(): Project[] {
  assertBrowserStorage();
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return seedProjects;
  const parsed = JSON.parse(raw) as Project[];
  return Array.isArray(parsed) ? parsed : seedProjects;
}

function writeProjects(projects: Project[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(projects));
}

function priorityRank(priority: ProjectPriority) {
  return { Urgent: 4, High: 3, Medium: 2, Low: 1 }[priority];
}

export async function listProjects(filters: ProjectFilters): Promise<ProjectListResult> {
  await delay();
  const query = filters.search.trim().toLowerCase();
  const filtered = readProjects()
    .filter((project) => !project.archived)
    .filter((project) => filters.status === "All" || project.status === filters.status)
    .filter((project) => !query || [project.name, project.description, project.platform, project.priority, project.status, ...project.tags].join(" ").toLowerCase().includes(query));

  filtered.sort((a, b) => {
    if (filters.sort === "name") return a.name.localeCompare(b.name);
    if (filters.sort === "score") return b.score - a.score;
    if (filters.sort === "priority") return priorityRank(b.priority) - priorityRank(a.priority);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const start = (filters.page - 1) * filters.pageSize;
  return { projects: filtered.slice(start, start + filters.pageSize), total: filtered.length, page: filters.page, pageSize: filters.pageSize };
}

export async function getProject(id: string): Promise<Project> {
  await delay();
  const project = readProjects().find((item) => item.id === id && !item.archived);
  if (!project) throw new Error("Project not found");
  return project;
}

export async function createProject(input: z.infer<typeof createProjectSchema>): Promise<Project> {
  await delay();
  const data = createProjectSchema.parse(input);
  const now = new Date().toISOString();
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const project: Project = { id: `${slug || "project"}-${Date.now()}`, ...data, status: "Discovery", tags: [data.platform, data.priority], favorite: false, archived: false, score: 10, activity: ["Project created", "Discovery workspace initialized"], createdAt: now, updatedAt: now };
  writeProjects([project, ...readProjects()]);
  return project;
}

export async function archiveProject(id: string): Promise<void> {
  await delay();
  const projects = readProjects();
  writeProjects(projects.map((project) => project.id === id ? { ...project, archived: true, status: "Archived", updatedAt: new Date().toISOString() } : project));
}
