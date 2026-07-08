import { describe, expect, it } from "vitest";
import { savePost, unsavePost } from "./saved-posts.js";

describe("saved posts domain logic", () => {
  it("creates a record when saving for the first time", () => {
    const now = new Date("2026-07-08T10:00:00.000Z");
    const result = savePost({
      existingRecord: null,
      userId: "student-1",
      postId: "post-1",
      now,
      createId: () => "save-1"
    });

    expect(result.action).toBe("created");
    expect(result.record.deletedAt).toBeNull();
    expect(result.record.id).toBe("save-1");
  });

  it("is idempotent when saving an already active record", () => {
    const existing = {
      id: "save-1",
      userId: "student-1",
      postId: "post-1",
      createdAt: new Date("2026-07-08T09:00:00.000Z"),
      updatedAt: new Date("2026-07-08T09:00:00.000Z"),
      deletedAt: null
    };

    const result = savePost({
      existingRecord: existing,
      userId: "student-1",
      postId: "post-1",
      now: new Date("2026-07-08T10:00:00.000Z"),
      createId: () => "unused"
    });

    expect(result.action).toBe("noop");
    expect(result.record.id).toBe(existing.id);
  });

  it("reactivates a soft-deleted record instead of creating a duplicate", () => {
    const existing = {
      id: "save-1",
      userId: "student-1",
      postId: "post-1",
      createdAt: new Date("2026-07-08T09:00:00.000Z"),
      updatedAt: new Date("2026-07-08T09:10:00.000Z"),
      deletedAt: new Date("2026-07-08T09:10:00.000Z")
    };

    const result = savePost({
      existingRecord: existing,
      userId: "student-1",
      postId: "post-1",
      now: new Date("2026-07-08T10:00:00.000Z"),
      createId: () => "unused"
    });

    expect(result.action).toBe("reactivated");
    expect(result.record.id).toBe(existing.id);
    expect(result.record.deletedAt).toBeNull();
  });

  it("soft deletes an active save", () => {
    const existing = {
      id: "save-1",
      userId: "student-1",
      postId: "post-1",
      createdAt: new Date("2026-07-08T09:00:00.000Z"),
      updatedAt: new Date("2026-07-08T09:00:00.000Z"),
      deletedAt: null
    };

    const result = unsavePost({
      existingRecord: existing,
      now: new Date("2026-07-08T10:00:00.000Z")
    });

    expect(result.action).toBe("soft-deleted");
    expect(result.record?.deletedAt?.toISOString()).toBe("2026-07-08T10:00:00.000Z");
  });
});
