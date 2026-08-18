"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { authCopy } from "@/data/content";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { useState } from "react";

export function AuthCard({ mode = "login" }: { mode?: "login" | "register" | "forgot" }) {
  const { notify } = useToast();
  const [busy, setBusy] = useState(false);

  async function handleGithubSignIn() {
    setBusy(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setBusy(false);
      notify({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : "Unable to connect to GitHub. Please try again.",
        tone: "error",
      });
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6">
      <Card className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md">
          <GithubIcon size={24} />
        </div>
        <h1 className="text-2xl font-bold">{authCopy.title[mode] || "Sign in to ProjectForge"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{authCopy.subtitle}</p>

        <div className="mt-8 space-y-4">
          <Button
            className="w-full py-3 text-base flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition shadow-md"
            onClick={handleGithubSignIn}
            disabled={busy}
          >
            <GithubIcon size={20} />
            {busy ? "Connecting to GitHub..." : authCopy.githubCta}
          </Button>
        </div>

        <p className="mt-6 text-xs text-[var(--muted)] leading-5">
          By continuing, you agree to connect your GitHub account to access your production planning workspace.
        </p>
      </Card>
    </main>
  );
}

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

