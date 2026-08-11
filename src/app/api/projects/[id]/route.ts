import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    const project = await getPrisma().project.findFirst({ where: { id, ownerId: user.id, archivedAt: null }, include: { tags: true, discoveries: true, requirements: { orderBy: { position: "asc" } }, stories: true, features: true, endpoints: true, tables: { include: { columns: true } }, tasks: { orderBy: { position: "asc" } }, docs: true, notes: true } });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json({ ...project, tags: project.tags.map((tag) => tag.name) });
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
