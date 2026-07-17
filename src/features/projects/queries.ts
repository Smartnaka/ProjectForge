import { archiveProject, createProject, getProject, listProjects } from "./project-repository";
import type { ProjectFilters } from "./types";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (filters: ProjectFilters) => [...projectKeys.lists(), filters] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
};

export const projectQueries = {
  list: (filters: ProjectFilters) => ({ queryKey: projectKeys.list(filters), queryFn: () => listProjects(filters), retry: 2 }),
  detail: (id: string) => ({ queryKey: projectKeys.detail(id), queryFn: () => getProject(id), retry: 1 }),
};

export const projectMutations = { createProject, archiveProject };
