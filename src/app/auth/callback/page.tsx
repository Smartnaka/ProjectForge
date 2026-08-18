"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/feedback/toast";
import { createBrowserSupabaseClient } from "@/lib/supabase-client";
import { routes } from "@/data/content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { notify } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createBrowserSupabaseClient();

    async function handleCallback() {
      const urlParams = new URLSearchParams(window.location.search);
      const err = urlParams.get("error_description") || urlParams.get("error");
      if (err) {
        if (mounted) {
          setErrorMsg(err);
          notify({ title: "Authentication canceled", description: err, tone: "error" });
          setTimeout(() => router.push(routes.login), 2000);
        }
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        // Wait for hash token exchange if PKCE/implicit flow
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && mounted) {
            notify({ title: "Signed in with GitHub", tone: "success" });
            router.push(routes.dashboard);
          }
        });

        // Fallback timeout if no session established
        setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData.session && mounted) {
            router.push(routes.dashboard);
          } else if (mounted) {
            setErrorMsg("Could not verify session. Please try logging in again.");
            setTimeout(() => router.push(routes.login), 2500);
          }
          authListener.subscription.unsubscribe();
        }, 3000);
        return;
      }

      if (mounted) {
        notify({ title: "Signed in with GitHub", tone: "success" });
        router.push(routes.dashboard);
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router, notify]);

  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] p-6">
      <Card className="w-full max-w-md text-center p-8">
        <h1 className="text-xl font-bold">{errorMsg ? "Authentication Error" : "Authenticating with GitHub"}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {errorMsg ? errorMsg : "Completing your secure sign-in. Please wait a moment..."}
        </p>
        <div className="mt-6 flex justify-center">
          <Skeleton className="h-2 w-32 rounded-full animate-pulse" />
        </div>
      </Card>
    </main>
  );
}
