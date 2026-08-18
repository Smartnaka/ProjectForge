import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/schemas";
import { Prisma, Priority, ProjectStatus } from "@prisma/client";
import { toApiProject } from "@/lib/project-presenter";
import { NextResponse } from "next/server";
import { z } from "zod";

const pageSizeMax = 50;

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.trim() ?? "";
    const rawStatus = url.searchParams.get("status");
    const status = rawStatus && Object.values(ProjectStatus).includes(rawStatus as ProjectStatus) ? (rawStatus as ProjectStatus) : null;
    const sort = url.searchParams.get("sort") ?? "updatedAt";
    const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
    const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") ?? 12), 1), pageSizeMax);
    const where: Prisma.ProjectWhereInput = {
      ownerId: user.id,
      archivedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { platform: { contains: search, mode: "insensitive" } },
              { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    };
    const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
      sort === "name"
        ? [{ name: "asc" }]
        : sort === "priority"
        ? [{ priority: "desc" }, { updatedAt: "desc" }]
        : [{ favorite: "desc" }, { updatedAt: "desc" }];

    const [projects, total] = await getPrisma().$transaction([
      getPrisma().project.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          tags: true,
          discoveries: { select: { id: true } },
          _count: { select: { tasks: true, requirements: true, stories: true, features: true, endpoints: true, tables: true, docs: true } },
        },
      }),
      getPrisma().project.count({ where }),
    ]);

    return NextResponse.json({ projects: projects.map(toApiProject), total, page, pageSize });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to list projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const json = await request.json().catch(() => ({}));
    const data = createProjectSchema.parse(json);

    const project = await getPrisma().project.create({
      data: {
        ownerId: user.id,
        name: data.name,
        description: data.description,
        platform: data.platform,
        priority: data.priority.toUpperCase() as Priority,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: "DISCOVERY",
        tags: { create: [{ name: data.platform }, { name: data.priority }] },
        tasks: { create: [{ title: "Complete product discovery", position: 0 }, { title: "Define launch checklist", position: 1 }] },
      },
      include: {
        tags: true,
        discoveries: { select: { id: true } },
        _count: { select: { tasks: true, requirements: true, stories: true, features: true, endpoints: true, tables: true, docs: true } },
      },
    });

    return NextResponse.json(toApiProject(project), { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "A project with this name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create project" }, { status: 500 });
  }
}

