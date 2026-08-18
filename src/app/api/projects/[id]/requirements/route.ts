import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { NextResponse } from "next/server";
import { z } from "zod";

const createRequirementSchema = z.object({
  type: z.string().min(1, "Type is required"),
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  body: z.string().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const requirements = await getPrisma().requirement.findMany({
      where: { projectId: id },
      orderBy: { position: "asc" },
    });
    return NextResponse.json(requirements);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load requirements" }, { status: 500 });
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
    const data = createRequirementSchema.parse(json);
    const count = await getPrisma().requirement.count({ where: { projectId: id } });
    const requirement = await getPrisma().requirement.create({
      data: {
        projectId: id,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        position: count,
      },
    });
    return NextResponse.json(requirement, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to create requirement" }, { status: 500 });
  }
}
