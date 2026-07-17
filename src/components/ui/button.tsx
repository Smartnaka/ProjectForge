import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";
export function Button({className, ...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:bg-slate-100",className)} {...props}/>}
