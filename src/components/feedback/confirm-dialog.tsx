"use client";

import { Button } from "@/components/ui/button";

export function ConfirmDialog({ open, title, description, confirmLabel, onCancel, onConfirm, busy = false }: { open: boolean; title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void; busy?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/60 p-4" role="presentation" onMouseDown={onCancel}>
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" onMouseDown={(event) => event.stopPropagation()}>
        <h2 id="confirm-title" className="text-xl font-bold">{title}</h2>
        <p id="confirm-description" className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" className="border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800" onClick={onCancel} disabled={busy}>Cancel</Button>
          <Button type="button" className="bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400" onClick={onConfirm} disabled={busy}>{busy ? "Working..." : confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
