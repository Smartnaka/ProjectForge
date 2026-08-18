import type { Project, Tag } from "@prisma/client";

type ProjectInput = Project & {
  tags?: Tag[];
  discoveries?: any | null;
  tasks?: any[];
  requirements?: any[];
  stories?: any[];
  features?: any[];
  endpoints?: any[];
  tables?: any[];
  docs?: any[];
  _count?: {
    tasks?: number;
    requirements?: number;
    stories?: number;
    features?: number;
    endpoints?: number;
    tables?: number;
    docs?: number;
  };
};

export function toApiProject(project: ProjectInput) {
  const taskCount = project._count?.tasks ?? project.tasks?.length ?? 0;
  const reqCount = project._count?.requirements ?? project.requirements?.length ?? 0;
  const storyCount = project._count?.stories ?? project.stories?.length ?? 0;
  const featureCount = project._count?.features ?? project.features?.length ?? 0;
  const endpointCount = project._count?.endpoints ?? project.endpoints?.length ?? 0;
  const tableCount = project._count?.tables ?? project.tables?.length ?? 0;
  const docCount = project._count?.docs ?? project.docs?.length ?? 0;
  const hasDiscovery = Boolean(project.discoveries);

  const sections = [
    hasDiscovery,
    reqCount,
    storyCount,
    featureCount,
    endpointCount,
    tableCount,
    taskCount,
    docCount,
  ];
  const complete = sections.filter(Boolean).length;

  return {
    id: project.id,
    name: project.name,
    description: project.description ?? "",
    platform: project.platform,
    status: project.status,
    priority: project.priority,
    deadline: project.deadline?.toISOString() ?? null,
    tags: project.tags ? project.tags.map((tag: Tag) => tag.name) : [],
    favorite: project.favorite,
    archived: Boolean(project.archivedAt),
    score: Math.round((complete / sections.length) * 100),
    counts: {
      tasks: taskCount,
      requirements: reqCount,
      stories: storyCount,
      features: featureCount,
      endpoints: endpointCount,
      tables: tableCount,
      docs: docCount,
    },
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

