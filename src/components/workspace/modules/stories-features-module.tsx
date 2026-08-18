"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/feedback/toast";
import { createSubmoduleItem, deleteSubmoduleItem, fetchSubmodule } from "@/features/projects/project-repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type UserStoryItem = {
  id: string;
  title: string;
  description?: string | null;
  priority: string;
  acceptanceCriteria?: string | null;
  status: string;
};

type FeatureItem = {
  id: string;
  title: string;
  estimatedTime?: string | null;
  difficulty?: string | null;
  dependencies?: string | null;
  priority: string;
  status: string;
};

export function StoriesFeaturesModule({ projectId }: { projectId: string }) {
  const { notify } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"stories" | "features">("stories");

  // Story Form State
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDesc, setStoryDesc] = useState("");
  const [storyPriority, setStoryPriority] = useState("MEDIUM");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState("");

  // Feature Form State
  const [featTitle, setFeatTitle] = useState("");
  const [featTime, setFeatTime] = useState("");
  const [featDiff, setFeatDiff] = useState("Medium");
  const [featPriority, setFeatPriority] = useState("MEDIUM");

  const { data: stories = [], isLoading: loadingStories } = useQuery({
    queryKey: ["projects", projectId, "stories"],
    queryFn: () => fetchSubmodule<UserStoryItem[]>(projectId, "stories"),
  });

  const { data: features = [], isLoading: loadingFeatures } = useQuery({
    queryKey: ["projects", projectId, "features"],
    queryFn: () => fetchSubmodule<FeatureItem[]>(projectId, "features"),
  });

  const createStoryMutation = useMutation({
    mutationFn: (newStory: any) => createSubmoduleItem<UserStoryItem>(projectId, "stories", newStory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "stories"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "User story created", tone: "success" });
      setStoryTitle("");
      setStoryDesc("");
      setAcceptanceCriteria("");
    },
  });

  const deleteStoryMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "stories", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "stories"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "User story deleted", tone: "success" });
    },
  });

  const createFeatMutation = useMutation({
    mutationFn: (newFeat: any) => createSubmoduleItem<FeatureItem>(projectId, "features", newFeat),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "features"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Feature created", tone: "success" });
      setFeatTitle("");
      setFeatTime("");
    },
  });

  const deleteFeatMutation = useMutation({
    mutationFn: (id: string) => deleteSubmoduleItem(projectId, "features", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "features"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      notify({ title: "Feature deleted", tone: "success" });
    },
  });

  function handleCreateStory(e: React.FormEvent) {
    e.preventDefault();
    if (!storyTitle.trim()) return;
    createStoryMutation.mutate({
      title: storyTitle.trim(),
      description: storyDesc.trim() || undefined,
      priority: storyPriority,
      acceptanceCriteria: acceptanceCriteria.trim() || undefined,
    });
  }

  function handleCreateFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!featTitle.trim()) return;
    createFeatMutation.mutate({
      title: featTitle.trim(),
      estimatedTime: featTime.trim() || undefined,
      difficulty: featDiff,
      priority: featPriority,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-[var(--border)] pb-2">
        <button
          onClick={() => setActiveTab("stories")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "stories" ? "bg-violet-600 text-white" : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          User Stories ({stories.length})
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "features" ? "bg-violet-600 text-white" : "text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          Features & Scope ({features.length})
        </button>
      </div>

      {activeTab === "stories" ? (
        <>
          <Card>
            <h2 className="text-xl font-bold">Add User Story</h2>
            <form onSubmit={handleCreateStory} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                <input
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Story title (e.g. As a user, I want to filter projects by priority)"
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
                />
                <select
                  value={storyPriority}
                  onChange={(e) => setStoryPriority(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 outline-none focus:border-violet-500"
                >
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent Priority</option>
                </select>
              </div>
              <textarea
                value={storyDesc}
                onChange={(e) => setStoryDesc(e.target.value)}
                placeholder="Story narrative description"
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:border-violet-500"
              />
              <textarea
                value={acceptanceCriteria}
                onChange={(e) => setAcceptanceCriteria(e.target.value)}
                placeholder="Acceptance criteria (e.g. Given X, when Y, then Z)"
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 outline-none focus:border-violet-500"
              />
              <Button disabled={createStoryMutation.isPending || !storyTitle.trim()}>
                <Plus size={16} /> Add User Story
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-bold">User Stories</h2>
            {loadingStories ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Loading user stories...</p>
            ) : stories.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No user stories defined yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {stories.map((story) => (
                  <div key={story.id} className="rounded-xl border border-[var(--border)] p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                            {story.priority}
                          </span>
                          <h3 className="font-semibold">{story.title}</h3>
                        </div>
                        {story.description && <p className="mt-2 text-sm text-[var(--muted)]">{story.description}</p>}
                        {story.acceptanceCriteria && (
                          <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-2.5 text-xs text-[var(--muted)]">
                            <b>Acceptance Criteria:</b> {story.acceptanceCriteria}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteStoryMutation.mutate(story.id)}
                        disabled={deleteStoryMutation.isPending}
                        className="text-[var(--muted)] hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <Card>
            <h2 className="text-xl font-bold">Add Planned Feature</h2>
            <form onSubmit={handleCreateFeature} className="mt-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_150px_150px]">
                <input
                  value={featTitle}
                  onChange={(e) => setFeatTitle(e.target.value)}
                  placeholder="Feature name (e.g. OAuth Single Sign-On)"
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 outline-none focus:border-violet-500"
                />
                <input
                  value={featTime}
                  onChange={(e) => setFeatTime(e.target.value)}
                  placeholder="Est. time (e.g. 3 days)"
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 outline-none focus:border-violet-500"
                />
                <select
                  value={featDiff}
                  onChange={(e) => setFeatDiff(e.target.value)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2.5 outline-none focus:border-violet-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Complex">Complex</option>
                </select>
              </div>
              <Button disabled={createFeatMutation.isPending || !featTitle.trim()}>
                <Plus size={16} /> Add Feature
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-xl font-bold">Features</h2>
            {loadingFeatures ? (
              <p className="mt-4 text-sm text-[var(--muted)]">Loading features...</p>
            ) : features.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted)]">No features planned yet.</p>
            ) : (
              <div className="mt-4 divide-y divide-[var(--border)]">
                {features.map((feat) => (
                  <div key={feat.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <h3 className="font-semibold">{feat.title}</h3>
                      <p className="text-xs text-[var(--muted)]">
                        Est: {feat.estimatedTime || "N/A"} · Difficulty: {feat.difficulty || "Medium"} · Priority: {feat.priority}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteFeatMutation.mutate(feat.id)}
                      disabled={deleteFeatMutation.isPending}
                      className="text-[var(--muted)] hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
