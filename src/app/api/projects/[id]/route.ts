import { AuthError, requireUser } from "@/lib/auth";
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
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to load project" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const result = await getPrisma().project.updateMany({
      where: { id, ownerId: user.id, archivedAt: null },
      data: { archivedAt: new Date(), status: "ARCHIVED" },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to archive project" }, { status: 500 });
  }
}

