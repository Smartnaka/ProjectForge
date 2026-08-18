import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional().default("BACKLOG"),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const tasks = await getPrisma().task.findMany({
      where: { projectId: id },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load tasks" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = createTaskSchema.parse(json);
    const count = await getPrisma().task.count({ where: { projectId: id, status: data.status as WorkStatus } });

    const task = await getPrisma().task.create({
      data: {
        projectId: id,
        title: data.title,
        status: data.status as WorkStatus,
        position: count,
      },
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to create task" }, { status: 500 });
  }
}
