import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Priority, WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateStorySchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  description: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  acceptanceCriteria: z.string().nullable().optional(),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; storyId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, storyId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateStorySchema.parse(json);
    const updated = await getPrisma().userStory.updateMany({
      where: { id: storyId, projectId: id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.priority ? { priority: data.priority as Priority } : {}),
        ...(data.acceptanceCriteria !== undefined ? { acceptanceCriteria: data.acceptanceCriteria } : {}),
        ...(data.status ? { status: data.status as WorkStatus } : {}),
      },
    });
    if (updated.count === 0) return NextResponse.json({ error: "User story not found" }, { status: 404 });
    const story = await getPrisma().userStory.findUnique({ where: { id: storyId } });
    return NextResponse.json(story);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update user story" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; storyId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, storyId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().userStory.deleteMany({
      where: { id: storyId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "User story not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete user story" }, { status: 500 });
  }
}
