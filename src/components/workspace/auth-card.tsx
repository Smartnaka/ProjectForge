"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authCopy, routes } from "@/data/content";
import { authSchema } from "@/lib/schemas";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type AuthForm = z.infer<typeof authSchema>;

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }) {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<AuthForm>();

  function handleAuthSubmit() {
    if (mode === "forgot") {
      router.push(routes.login);
      return;
    }
    router.push(routes.dashboard);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">{authCopy.title[mode]}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{authCopy.subtitle}</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(handleAuthSubmit)}>
          <input
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
            placeholder={authCopy.emailPlaceholder}
            {...register("email", {
              required: authCopy.emailRequired,
              validate: (value) => authSchema.shape.email.safeParse(value).success || authCopy.emailInvalid,
            })}
          />
          {errors.email && <p className="text-sm font-medium text-red-600 dark:text-red-300">{errors.email.message}</p>}
          {mode !== "forgot" && (
            <>
              <input
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30"
                placeholder={authCopy.passwordPlaceholder}
                type="password"
                {...register("password", {
                  required: authCopy.passwordRequired,
                  validate: (value) => authSchema.shape.password.safeParse(value).success || authCopy.passwordInvalid,
                })}
              />
              {errors.password && <p className="text-sm font-medium text-red-600 dark:text-red-300">{errors.password.message}</p>}
            </>
          )}
          <Button className="w-full">{authCopy.continue}</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm font-medium text-[var(--muted)]">
          <a className="hover:text-[var(--foreground)]" href={routes.login}>{authCopy.login}</a>
          <a className="hover:text-[var(--foreground)]" href={routes.register}>{authCopy.register}</a>
          <a className="hover:text-[var(--foreground)]" href={routes.forgotPassword}>{authCopy.forgot}</a>
        </div>
      </Card>
    </main>
  );
}
