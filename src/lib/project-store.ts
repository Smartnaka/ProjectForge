export type ProjectStatus = "Discovery" | "Planning" | "Architecture" | "Ready" | "Archived";
export type ProjectPriority = "Low" | "Medium" | "High" | "Urgent";

export type Project = {
  id: string;
  name: string;
  description: string;
  platform: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string;
  tags: string[];
  favorite: boolean;
  archived: boolean;
  score: number;
  activity: string[];
  createdAt: string;
};

export const defaultProjects: Project[] = [
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
    createdAt: "2026-07-01",
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
    createdAt: "2026-07-08",
  },
];

const storageKey = "projectforge.projects.v1";

export function loadProjects(): Project[] {
  if (typeof window === "undefined") return defaultProjects;
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return defaultProjects;
  try {
    const parsed = JSON.parse(raw) as Project[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

export function saveProjects(projects: Project[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(projects));
}

export function createProject(input: Pick<Project, "name" | "description" | "platform" | "priority" | "deadline">): Project {
  const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `${slug || "project"}-${Date.now()}`,
    ...input,
    status: "Discovery",
    tags: [input.platform, input.priority],
    favorite: false,
    archived: false,
    score: 18,
    activity: ["Project created", "Discovery workspace initialized"],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}
