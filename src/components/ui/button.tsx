import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };

export function Button({ className, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-transparent bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-950/10 transition hover:-translate-y-0.5 hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 dark:bg-violet-500 dark:text-white dark:hover:bg-violet-400",
        className,
      )}
      {...props}
    />
  );
}
