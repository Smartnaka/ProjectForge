import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { NextResponse } from "next/server";
import { z } from "zod";

const columnInputSchema = z.object({
  name: z.string().trim().min(1),
  type: z.string().trim().min(1),
  primaryKey: z.boolean().optional().default(false),
  foreignKey: z.string().optional(),
  nullable: z.boolean().optional().default(false),
});

const updateTableSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  columns: z.array(columnInputSchema).optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; tableId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, tableId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateTableSchema.parse(json);

    const existing = await getPrisma().dbTable.findFirst({ where: { id: tableId, projectId: id } });
    if (!existing) return NextResponse.json({ error: "Table not found" }, { status: 404 });

    if (data.name) {
      await getPrisma().dbTable.update({ where: { id: tableId }, data: { name: data.name } });
    }

    if (data.columns) {
      await getPrisma().dbColumn.deleteMany({ where: { tableId } });
      await getPrisma().dbColumn.createMany({
        data: data.columns.map((col) => ({
          tableId,
          name: col.name,
          type: col.type,
          primaryKey: col.primaryKey ?? false,
          foreignKey: col.foreignKey ?? null,
          nullable: col.nullable ?? false,
        })),
      });
    }

    const table = await getPrisma().dbTable.findUnique({ where: { id: tableId }, include: { columns: true } });
    return NextResponse.json(table);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update table" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; tableId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, tableId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().dbTable.deleteMany({
      where: { id: tableId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Table not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete table" }, { status: 500 });
  }
}
