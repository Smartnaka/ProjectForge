"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule, updateSubmoduleItem } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";

type DocumentItem = {
  id: string;
  title: string;
  markdown: string;
  updatedAt: string;
};

export function DocumentsModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [docTitle, setDocTitle] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [activeMarkdown, setActiveMarkdown] = useState("");

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ["projects", projectId, "docs"],
    queryFn: () => fetchSubmodule<DocumentItem[]>(projectId, "docs"),
  });

  const createMutation = useMutation({
    mutationFn: (title: string) => createSubmoduleItem<DocumentItem>(projectId, "docs", { title, markdown: "# " + title + "\n\nStart writing documentation here..." }),
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "docs"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Document created", tone: "success" });
      setDocTitle("");
      setSelectedDoc(newDoc);
      setActiveMarkdown(newDoc.markdown);
    },
    onError: (err: Error) => notify({ title: "Failed to create document", description: err.message, tone: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ docId, markdown }: { docId: string; markdown: string }) =>
      updateSubmoduleItem<DocumentItem>(projectId, "docs", docId, { markdown }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "docs"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Document saved", tone: "success" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "docs", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "docs"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Document deleted", tone: "success" });
      if (selectedDoc?.id) setSelectedDoc(null);
    },
  });

  function handleCreateDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!docTitle.trim()) return;
    createMutation.mutate(docTitle.trim());
  }

  function handleSaveDoc() {
    if (!selectedDoc) return;
    updateMutation.mutate({ docId: selectedDoc.id, markdown: activeMarkdown });
  }

  const activeDoc = docs.find((d) => d.id === selectedDoc?.id) || selectedDoc || docs[0] || null;

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-bold">Project Documentation</h2>
        <form onSubmit={handleCreateDoc} className="mt-4 flex gap-3">
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="Document title (e.g. System Architecture Specification, README)"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
          />
          <Button disabled={createMutation.isPending || !docTitle.trim()}>
            <Plus size={16} /> Create Doc
          </Button>
        </form>
      </Card>

      {isLoading ? (
        <p className="text-sm text-[var(--muted)]">Loading documents...</p>
      ) : docs.length === 0 ? (
        <Card className="py-10 text-center">
          <FileText size={40} className="mx-auto text-[var(--muted)]" />
          <h3 className="mt-2 font-semibold text-lg">No Documents Created</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">Create your first markdown documentation file above.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Card className="p-3">
            <h3 className="px-3 py-1 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">Documents</h3>
            <div className="mt-2 space-y-1">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDoc(d);
                    setActiveMarkdown(d.markdown);
                  }}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                    activeDoc?.id === d.id
                      ? "bg-violet-500/15 text-violet-700 dark:text-violet-200"
                      : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="truncate">{d.title}</span>
                </button>
              ))}
            </div>
          </Card>

          {activeDoc && (
            <Card>
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div>
                  <h2 className="text-xl font-bold">{activeDoc.title}</h2>
                  <p className="text-xs text-[var(--muted)]">Markdown Document</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveDoc} disabled={updateMutation.isPending}>
                    <Save size={16} /> {updateMutation.isPending ? "Saving..." : "Save Doc"}
                  </Button>
                  <button
                    onClick={() => deleteMutation.mutate(activeDoc.id)}
                    className="p-2 text-[var(--muted)] hover:text-red-500 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  value={activeMarkdown}
                  onChange={(e) => setActiveMarkdown(e.target.value)}
                  rows={16}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm outline-none focus:border-violet-500"
                />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
