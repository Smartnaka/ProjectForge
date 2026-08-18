import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateRequirementSchema = z.object({
  type: z.string().optional(),
  title: z.string().trim().min(2).max(120).optional(),
  body: z.string().nullable().optional(),
  position: z.number().int().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; reqId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, reqId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateRequirementSchema.parse(json);
    const updated = await getPrisma().requirement.updateMany({
      where: { id: reqId, projectId: id },
      data,
    });
    if (updated.count === 0) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    const requirement = await getPrisma().requirement.findUnique({ where: { id: reqId } });
    return NextResponse.json(requirement);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update requirement" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; reqId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, reqId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().requirement.deleteMany({
      where: { id: reqId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Requirement not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete requirement" }, { status: 500 });
  }
}
