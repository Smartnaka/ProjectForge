import { AuthError, requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { verifyProjectOwner } from "@/lib/project-access";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateEndpointSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional(),
  route: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  authRequired: z.boolean().optional(),
  request: z.any().optional(),
  response: z.any().optional(),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; endpointId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, endpointId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const json = await request.json().catch(() => ({}));
    const data = updateEndpointSchema.parse(json);

    const formattedRoute = data.route ? (data.route.startsWith("/") ? data.route : `/${data.route}`) : undefined;

    const updated = await getPrisma().apiEndpoint.updateMany({
      where: { id: endpointId, projectId: id },
      data: {
        ...(data.method ? { method: data.method } : {}),
        ...(formattedRoute ? { route: formattedRoute } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.authRequired !== undefined ? { authRequired: data.authRequired } : {}),
        ...(data.request !== undefined ? { request: data.request } : {}),
        ...(data.response !== undefined ? { response: data.response } : {}),
      },
    });
    if (updated.count === 0) return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    const endpoint = await getPrisma().apiEndpoint.findUnique({ where: { id: endpointId } });
    return NextResponse.json(endpoint);
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to update API endpoint" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; endpointId: string }> }) {
  try {
    const user = await requireUser(request);
    const { id, endpointId } = await params;
    if (!(await verifyProjectOwner(id, user.id))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    const deleted = await getPrisma().apiEndpoint.deleteMany({
      where: { id: endpointId, projectId: id },
    });
    if (deleted.count === 0) return NextResponse.json({ error: "Endpoint not found" }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: 401 });
    return NextResponse.json({ error: "Unable to delete API endpoint" }, { status: 500 });
  }
}
