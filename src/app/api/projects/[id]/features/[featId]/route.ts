import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Priority, WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateFeatureSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  estimatedTime: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(),
  dependencies: z.string().nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; featId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, featId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateFeatureSchema.parse(json);
    const updated = await getPrisma().feature.updateMany({
      where: { id: featId, projectId: id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.estimatedTime !== undefined ? { estimatedTime: data.estimatedTime } : {}),
        ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
        ...(data.dependencies !== undefined ? { dependencies: data.dependencies } : {}),
        ...(data.status ? { status: data.status as WorkStatus } : {}),
        ...(data.priority ? { priority: data.priority as Priority } : {}),
      },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    const feature = await getPrisma().feature.findUnique({ where: { id: featId } });
    return NextResponse.json(feature);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update feature" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; featId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, featId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().feature.deleteMany({
      where: { id: featId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Feature not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete feature" }, { status: 500 });
  }
}
