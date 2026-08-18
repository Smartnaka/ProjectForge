import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { createProjectSchema } from "@/lib/schemas";
import type { Project, ProjectFilters, ProjectListResult } from "./types";
import type { z } from "zod";

async function authHeaders() {
  const headers = new Headers({ "content-type": "application/json" });
  const supabase = createBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  if (data.session?.access_token) headers.set("authorization", `Bearer ${data.session.access_token}`);
  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Request failed");
  return body as T;
}

const statusMap = { Discovery: "DISCOVERY", Planning: "PLANNING", Architecture: "ACTIVE", Ready: "COMPLETED", Archived: "ARCHIVED" } as const;
const reverseStatusMap = { DISCOVERY: "Discovery", PLANNING: "Planning", ACTIVE: "Architecture", COMPLETED: "Ready", ARCHIVED: "Archived" } as const;
const reversePriorityMap = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" } as const;

type ApiProject = Omit<Project, "status" | "priority"> & { status: keyof typeof reverseStatusMap; priority: keyof typeof reversePriorityMap };

function normalize(project: ApiProject): Project {
  return { ...project, status: reverseStatusMap[project.status], priority: reversePriorityMap[project.priority] };
}

export async function listProjects(filters: ProjectFilters): Promise<ProjectListResult> {
  const params = new URLSearchParams({ search: filters.search, page: String(filters.page), pageSize: String(filters.pageSize) });
  if (filters.status !== "All") params.set("status", statusMap[filters.status]);
  params.set("sort", filters.sort);
  const result = await fetch(`/api/projects?${params.toString()}`, { headers: await authHeaders() }).then((response) => parseJson<{ projects: ApiProject[]; total: number; page: number; pageSize: number }>(response));
  return { ...result, projects: result.projects.map(normalize) };
}

export async function getProject(id: string): Promise<Project> {
  const project = await fetch(`/api/projects/${encodeURIComponent(id)}`, { headers: await authHeaders() }).then((response) => parseJson<ApiProject>(response));
  return normalize(project);
}

export async function createProject(input: z.infer<typeof createProjectSchema>): Promise<Project> {
  const data = createProjectSchema.parse(input);
  const project = await fetch("/api/projects", { method: "POST", headers: await authHeaders(), body: JSON.stringify(data) }).then((response) => parseJson<ApiProject>(response));
  return normalize(project);
}

export async function archiveProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { method: "DELETE", headers: await authHeaders() });
  if (!response.ok) throw new Error("Unable to archive project");
}

export async function fetchSubmodule<T>(projectId: string, subPath: string): Promise<T> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/${subPath}`, { headers: await authHeaders() });
  return parseJson<T>(response);
}

export async function createSubmoduleItem<T>(projectId: string, subPath: string, payload: any): Promise<T> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/${subPath}`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<T>(response);
}

export async function updateSubmoduleItem<T>(projectId: string, subPath: string, itemId: string, payload: any): Promise<T> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/${subPath}/${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<T>(response);
}

export async function deleteSubmoduleItem(projectId: string, subPath: string, itemId: string): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/${subPath}/${encodeURIComponent(itemId)}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!response.ok) throw new Error("Unable to delete item");
}

