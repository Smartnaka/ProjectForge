"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const authFormSchema = z.object({ email: z.string().email(), password: z.string().min(8).optional() });
type AuthForm = z.infer<typeof authFormSchema>;

export function AuthCard({ mode }: { mode: "login" | "register" | "forgot" }) {
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AuthForm>({ resolver: zodResolver(authFormSchema) });

  function onSubmit(values: AuthForm) {
    if (mode !== "forgot" && !values.password) {
      setMessage("Enter a password with at least 8 characters.");
      return;
    }
    setMessage(mode === "forgot" ? "Password reset email queued. Connect Supabase to send it." : mode === "register" ? "Account created locally. Connect Supabase for email verification." : "Signed in locally. Connect Supabase for production sessions.");
  }

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Welcome back" : mode === "register" ? "Create your workspace" : "Reset password"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Functional form validation is in place and ready to wire to Supabase Auth.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3" placeholder="Email" {...register("email")} />
          {errors.email ? <p className="text-sm text-red-300">{errors.email.message}</p> : null}
          {mode !== "forgot" ? <input className="w-full rounded-xl border border-[var(--border)] bg-transparent px-4 py-3" placeholder="Password" type="password" {...register("password")} /> : null}
          {message ? <p className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p> : null}
          <Button className="w-full bg-violet-500 text-white" disabled={isSubmitting}>Continue</Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-[var(--muted)]"><a href="/auth/login">Login</a><a href="/auth/register">Register</a><a href="/auth/forgot-password">Forgot</a></div>
      </Card>
    </main>
  );
}
