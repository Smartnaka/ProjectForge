import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Priority, WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createStorySchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  acceptanceCriteria: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional().default("BACKLOG"),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const stories = await getPrisma().userStory.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(stories);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load user stories" }, { status: 500 });
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
    const data = createStorySchema.parse(json);
    const story = await getPrisma().userStory.create({
      data: {
        projectId: id,
        title: data.title,
        description: data.description ?? null,
        priority: data.priority as Priority,
        acceptanceCriteria: data.acceptanceCriteria ?? null,
        status: data.status as WorkStatus,
      },
    });
    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to create user story" }, { status: 500 });
  }
}
