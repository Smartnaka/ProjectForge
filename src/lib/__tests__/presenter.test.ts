import { describe, expect, it } from "vitest";
import { toApiProject } from "../project-presenter";

describe("toApiProject presenter", () => {
  it("correctly calculates score and formats project DTO with _count aggregation", () => {
    const fakeProject: any = {
      id: "proj-123",
      name: "Test Planning Workspace",
      description: "Sample project description",
      platform: "Web",
      status: "PLANNING",
      priority: "HIGH",
      deadline: new Date("2026-12-31"),
      favorite: true,
      archivedAt: null,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-02"),
      tags: [{ name: "Web" }, { name: "High" }],
      _count: {
        requirements: 3,
        stories: 5,
        features: 2,
        endpoints: 4,
        tables: 2,
        tasks: 10,
        docs: 1,
        discoveries: 1,
      },
    };

    const dto = toApiProject(fakeProject);

    expect(dto.id).toBe("proj-123");
    expect(dto.name).toBe("Test Planning Workspace");
    expect(dto.score).toBe(100);
    expect(dto.counts.requirements).toBe(3);
    expect(dto.counts.stories).toBe(5);
    expect(dto.counts.endpoints).toBe(4);
    expect(dto.tags).toEqual(["Web", "High"]);
  });

  it("calculates partial score when some sections are zero", () => {
    const fakeProject: any = {
      id: "proj-456",
      name: "Empty Project",
      description: null,
      platform: "Mobile",
      status: "DISCOVERY",
      priority: "MEDIUM",
      deadline: null,
      favorite: false,
      archivedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      _count: {
        requirements: 0,
        stories: 0,
        features: 0,
        endpoints: 0,
        tables: 0,
        tasks: 2,
        docs: 0,
        discoveries: 0,
      },
    };

    const dto = toApiProject(fakeProject);
    expect(dto.score).toBe(13); // 1 out of 8 sections complete
    expect(dto.counts.tasks).toBe(2);
    expect(dto.counts.requirements).toBe(0);
  });
});
