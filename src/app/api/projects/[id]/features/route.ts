import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Priority, WorkStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createFeatureSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  estimatedTime: z.string().optional(),
  difficulty: z.string().optional(),
  dependencies: z.string().optional(),
  status: z.enum(["BACKLOG", "TODO", "DOING", "TESTING", "DONE"]).optional().default("BACKLOG"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const features = await getPrisma().feature.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(features);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load features" }, { status: 500 });
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
    const data = createFeatureSchema.parse(json);
    const feature = await getPrisma().feature.create({
      data: {
        projectId: id,
        title: data.title,
        estimatedTime: data.estimatedTime ?? null,
        difficulty: data.difficulty ?? null,
        dependencies: data.dependencies ?? null,
        status: data.status as WorkStatus,
        priority: data.priority as Priority,
      },
    });
    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to create feature" }, { status: 500 });
  }
}
