import type { Prisma } from "@prisma/client";

type ProjectWithPlanning = Prisma.ProjectGetPayload<{
  include: {
    tags: true;
    tasks: true;
    requirements: true;
    stories: true;
    features: true;
    endpoints: true;
    tables: true;
    docs: true;
    discoveries: true;
  };
}>;

export function toApiProject(project: ProjectWithPlanning) {
  const sections = [
    project.discoveries,
    project.requirements.length,
    project.stories.length,
    project.features.length,
    project.endpoints.length,
    project.tables.length,
    project.tasks.length,
    project.docs.length,
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
    tags: project.tags.map((tag) => tag.name),
    favorite: project.favorite,
    archived: Boolean(project.archivedAt),
    score: Math.round((complete / sections.length) * 100),
    counts: {
      tasks: project.tasks.length,
      requirements: project.requirements.length,
      stories: project.stories.length,
      features: project.features.length,
      endpoints: project.endpoints.length,
      tables: project.tables.length,
      docs: project.docs.length,
    },
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
