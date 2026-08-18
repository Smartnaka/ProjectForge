import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const columnInputSchema = z.object({
  name: z.string().trim().min(1, "Column name is required"),
  type: z.string().trim().min(1, "Type is required"),
  primaryKey: z.boolean().optional().default(false),
  foreignKey: z.string().optional(),
  nullable: z.boolean().optional().default(false),
});

const createTableSchema = z.object({
  name: z.string().trim().min(2, "Table name must be at least 2 characters").max(60),
  columns: z.array(columnInputSchema).optional().default([]),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const tables = await getPrisma().dbTable.findMany({
      where: { projectId: id },
      include: { columns: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(tables);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load database tables" }, { status: 500 });
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
    const data = createTableSchema.parse(json);

    const defaultColumns = data.columns.length > 0 ? data.columns : [
      { name: "id", type: "UUID", primaryKey: true, nullable: false },
      { name: "createdAt", type: "TIMESTAMP", primaryKey: false, nullable: false },
    ];

    const table = await getPrisma().dbTable.create({
      data: {
        projectId: id,
        name: data.name,
        columns: {
          create: defaultColumns.map((col) => ({
            name: col.name,
            type: col.type,
            primaryKey: col.primaryKey ?? false,
            foreignKey: col.foreignKey ?? null,
            nullable: col.nullable ?? false,
          })),
        },
      },
      include: { columns: true },
    });
    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A table with this name already exists in the project." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create table" }, { status: 500 });
  }
}
