"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";
type Toast = { id: string; title: string; description?: string; tone: ToastTone };
type ToastInput = Omit<Toast, "id">;

type ToastContextValue = { notify: (toast: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const notify = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { ...toast, id }]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl shadow-black/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={toast.tone === "error" ? "font-semibold text-red-600 dark:text-red-300" : toast.tone === "success" ? "font-semibold text-emerald-700 dark:text-emerald-300" : "font-semibold"}>{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-[var(--muted)]">{toast.description}</p> : null}
              </div>
              <button className="rounded-lg px-2 text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
