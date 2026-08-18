import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional(),
  position: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, taskId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateTaskSchema.parse(json);

    const updated = await getPrisma().task.updateMany({
      where: { id: taskId, projectId: id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.status ? { status: data.status as WorkStatus } : {}),
        ...(data.position !== undefined ? { position: data.position } : {}),
      },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    const task = await getPrisma().task.findUnique({ where: { id: taskId } });
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, taskId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().task.deleteMany({
      where: { id: taskId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete task" }, { status: 500 });
  }
}
