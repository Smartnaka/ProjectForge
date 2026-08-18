import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createDocSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(100),
  markdown: z.string().optional().default(""),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const docs = await getPrisma().document.findMany({
      where: { projectId: id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(docs);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load documents" }, { status: 500 });
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
    const data = createDocSchema.parse(json);

    const doc = await getPrisma().document.create({
      data: {
        projectId: id,
        title: data.title,
        markdown: data.markdown ?? "",
      },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A document with this title already exists in the project." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create document" }, { status: 500 });
  }
}
