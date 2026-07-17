import { ProjectShell } from "@/components/workspace/project-shell";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectShell projectId={id} />;
}
