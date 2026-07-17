import { Card } from "@/components/ui/card";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <Card className="grid place-items-center py-12 text-center"><div className="max-w-md"><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>{action ? <div className="mt-5 flex justify-center">{action}</div> : null}</div></Card>;
}
