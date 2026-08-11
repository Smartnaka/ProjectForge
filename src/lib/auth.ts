import { getPrisma } from "@/lib/prisma";
import { isDevAuthEnabled } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export type AuthenticatedUser = { id: string; email: string; name?: string | null };

function bearerToken(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim();
}

export async function requireUser(request: Request): Promise<AuthenticatedUser> {
  const token = bearerToken(request);

  if (token) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Authentication service is not configured.");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email) throw new Error("Invalid or expired authentication token.");

    return getPrisma().user.upsert({
      where: { email: data.user.email },
      create: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name ?? null },
      update: { name: data.user.user_metadata?.name ?? null },
      select: { id: true, email: true, name: true },
    });
  }

  if (isDevAuthEnabled()) {
    const email = request.headers.get("x-projectforge-dev-user") ?? "dev@projectforge.local";
    return getPrisma().user.upsert({
      where: { email },
      create: { email, name: "Development User" },
      update: {},
      select: { id: true, email: true, name: true },
    });
  }

  throw new Error("Authentication is required.");
}
