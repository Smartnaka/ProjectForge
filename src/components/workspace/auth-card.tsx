"use client";

import { useToast } from "@/components/feedback/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authCopy, routes } from "@/data/content";
import { authSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type AuthForm = z.infer<typeof authSchema>;

const authDelayMs = 500;

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const { notify } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setError, formState: { errors } } = useForm<AuthForm>({ defaultValues: { email: "", password: "" } });

  async function handleAuthSubmit(values: AuthForm) {
    const parsed = authSchema.safeParse(mode === "forgot" ? { ...values, password: "temporary-password" } : values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email" || field === "password") setError(field, { message: issue.message });
      }
      return;
    }
    setIsSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, authDelayMs));
    setIsSubmitting(false);
    if (mode === "forgot") {
      notify({ tone: "success", title: "Recovery email queued", description: "If an account exists, password reset instructions will be sent." });
      router.push(routes.login);
      return;
    }
    notify({ tone: "success", title: mode === "login" ? "Signed in" : "Workspace created", description: "Authentication is ready to connect to Supabase in production." });
    router.push(routes.dashboard);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">{authCopy.title[mode]}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{authCopy.subtitle}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(handleAuthSubmit)} noValidate>
          <div>
            <Input aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} placeholder={authCopy.emailPlaceholder} disabled={isSubmitting} {...register("email")} />
            {errors.email && <p id="email-error" className="mt-2 text-sm font-medium text-red-600 dark:text-red-300">{errors.email.message}</p>}
          </div>
          {mode !== "forgot" && <div><Input aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "password-error" : undefined} placeholder={authCopy.passwordPlaceholder} type="password" disabled={isSubmitting} {...register("password")} />{errors.password && <p id="password-error" className="mt-2 text-sm font-medium text-red-600 dark:text-red-300">{errors.password.message}</p>}</div>}
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : authCopy.continue}</Button>
        </form>
        <nav className="mt-4 flex justify-between text-sm font-medium text-[var(--muted)]" aria-label="Authentication links">
          <a className="hover:text-[var(--foreground)]" href={routes.login}>{authCopy.login}</a>
          <a className="hover:text-[var(--foreground)]" href={routes.register}>{authCopy.register}</a>
          <a className="hover:text-[var(--foreground)]" href={routes.forgotPassword}>{authCopy.forgot}</a>
        </nav>
      </Card>
    </main>
  );
}
