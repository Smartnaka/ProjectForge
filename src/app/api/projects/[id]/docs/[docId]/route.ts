import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateDocSchema = z.object({
  title: z.string().trim().min(2).max(100).optional(),
  markdown: z.string().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, docId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateDocSchema.parse(json);

    const updated = await getPrisma().document.updateMany({
      where: { id: docId, projectId: id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.markdown !== undefined ? { markdown: data.markdown } : {}),
      },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    const doc = await getPrisma().document.findUnique({ where: { id: docId } });
    return NextResponse.json(doc);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update document" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; docId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, docId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().document.deleteMany({
      where: { id: docId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete document" }, { status: 500 });
  }
}
