import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection URL"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be configured"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured"),
  ENABLE_DEV_AUTH: z.enum(["true", "false"]).optional(),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

export function isDevAuthEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_AUTH === "true";
}
