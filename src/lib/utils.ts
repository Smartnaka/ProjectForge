import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function readinessScore(sections: {complete:boolean}[]) { return Math.round((sections.filter(s=>s.complete).length / Math.max(sections.length,1))*100); }
