import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import Link from "next/link";

export default function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6"><EmptyState title="Page not found" description="The page you requested does not exist or has moved." action={<Button asChild><Link href="/">Go home</Link></Button>} /></main>;
}
