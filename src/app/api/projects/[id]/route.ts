import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { toApiProject } from "@/lib/project-presenter";
import { NextResponse } from "next/server";

const projectInclude = {
  tags: true,
  discoveries: true,
  requirements: { orderBy: { position: "asc" as const } },
  stories: true,
  features: true,
  endpoints: true,
  tables: true,
  tasks: { orderBy: { position: "asc" as const } },
  docs: true,
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const project = await getPrisma().project.findFirst({
      where: { id, ownerId: user.id, archivedAt: null },
      include: projectInclude,
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(toApiProject(project));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load project" }, { status: 401 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    await getPrisma().project.updateMany({ where: { id, ownerId: user.id, archivedAt: null }, data: { archivedAt: new Date(), status: "ARCHIVED" } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to archive project" }, { status: 401 });
  }
}
