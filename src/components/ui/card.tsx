import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)]/90 p-5 shadow-sm backdrop-blur", className)} {...props} />;
}
