import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="min-h-screen p-6"><div className="mx-auto grid max-w-7xl gap-4"><Skeleton className="h-16" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div></main>;
}
