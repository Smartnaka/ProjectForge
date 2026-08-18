import { getPrisma } from "@/lib/prisma";

export async function verifyProjectOwner(projectId: string, userId: string) {
  const project = await getPrisma().project.findFirst({
    where: { id: projectId, ownerId: userId, archivedAt: null },
    select: { id: true },
  });
  return Boolean(project);
}
