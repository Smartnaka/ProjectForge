import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

const createEndpointSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  route: z.string().trim().min(1, "Route path is required"),
  description: z.string().optional(),
  authRequired: z.boolean().optional().default(true),
  request: z.any().optional(),
  response: z.any().optional(),
});

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser(request);
    const { id } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const endpoints = await getPrisma().apiEndpoint.findMany({
      where: { projectId: id },
      orderBy: { route: "asc" },
    });
    return NextResponse.json(endpoints);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to load API endpoints" }, { status: 500 });
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
    const data = createEndpointSchema.parse(json);

    const formattedRoute = data.route.startsWith("/") ? data.route : `/${data.route}`;

    const endpoint = await getPrisma().apiEndpoint.create({
      data: {
        projectId: id,
        method: data.method,
        route: formattedRoute,
        description: data.description ?? null,
        authRequired: data.authRequired ?? true,
        request: data.request ?? null,
        response: data.response ?? null,
      },
    });
    return NextResponse.json(endpoint, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An endpoint with this HTTP method and route already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create API endpoint" }, { status: 500 });
  }
}
