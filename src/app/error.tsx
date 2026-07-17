"use client";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { RefreshCw } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center p-6"><EmptyState title="Something went wrong" description="We hit an unexpected application error. Retry the view or contact support if it persists." action={<Button onClick={reset}><RefreshCw size={16} /> Retry</Button>} /></main>;
}
