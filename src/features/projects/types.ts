export type ProjectStatus = "Discovery" | "Planning" | "Architecture" | "Ready" | "Archived";
export type ProjectPriority = "Low" | "Medium" | "High" | "Urgent";
export type ProjectSort = "updatedAt" | "name" | "score" | "priority";

export type Project = {
  id: string;
  name: string;
  description: string;
  platform: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  score: number;
  activity: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectFilters = {
  search: string;
  status: "All" | ProjectStatus;
  sort: ProjectSort;
  page: number;
  pageSize: number;
};

export type ProjectListResult = {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
};
