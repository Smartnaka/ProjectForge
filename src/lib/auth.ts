import { getPrisma } from "@/lib/prisma";
import { isDevAuthEnabled } from "@/lib/env";
import { createClient } from "@supabase/supabase-js";

export type AuthenticatedUser = { id: string; email: string; name?: string | null };

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

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
    if (!supabaseUrl || !supabaseAnonKey) throw new AuthError("Authentication service is not configured.");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user?.email || !data.user?.id) throw new AuthError("Invalid or expired authentication token.");

    const name =
      data.user.user_metadata?.full_name ??
      data.user.user_metadata?.name ??
      data.user.user_metadata?.preferred_username ??
      data.user.user_metadata?.user_name ??
      data.user.email.split("@")[0];

    return getPrisma().user.upsert({
      where: { id: data.user.id },
      create: { id: data.user.id, email: data.user.email, name },
      update: { email: data.user.email, name },
      select: { id: true, email: true, name: true },
    });
  }

  if (isDevAuthEnabled()) {
    const email = request.headers.get("x-projectforge-dev-user") ?? "dev@projectforge.local";
    const devUserId = "dev-user-00000000-0000-0000-0000-000000000000";
    return getPrisma().user.upsert({
      where: { id: devUserId },
      create: { id: devUserId, email, name: "Development User" },
      update: { email },
      select: { id: true, email: true, name: true },
    });
  }

  throw new AuthError("Authentication is required.");
}

