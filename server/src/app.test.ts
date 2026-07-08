import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { db, ensureSchema } from "./db/client.js";
import { courses, enrollments, posts, savedPosts, users } from "./db/schema.js";
import { app } from "./app.js";

function seedTestData() {
  ensureSchema();
  db.delete(savedPosts).run();
  db.delete(posts).run();
  db.delete(enrollments).run();
  db.delete(courses).run();
  db.delete(users).run();

  db.insert(users).values([
    { id: "student-1", name: "Ava", role: "student" },
    { id: "student-2", name: "Maya", role: "student" },
    { id: "moderator-1", name: "Noah", role: "moderator" }
  ]).run();

  db.insert(courses).values([
    { id: "course-a", title: "Course A" },
    { id: "course-b", title: "Course B" }
  ]).run();

  db.insert(enrollments).values([{ id: "enrollment-1", userId: "student-1", courseId: "course-a" }]).run();

  db.insert(posts).values([
    {
      id: "post-1",
      courseId: "course-a",
      authorId: "student-1",
      title: "Allowed post",
      body: "Visible to student-1",
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: new Date(),
      deletedAt: null
    },
    {
      id: "post-2",
      courseId: "course-b",
      authorId: "student-2",
      title: "Forbidden post",
      body: "Not visible to student-1",
      likesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      createdAt: new Date(),
      deletedAt: null
    }
  ]).run();
}

beforeEach(() => {
  seedTestData();
});

describe("API authorization and save flow", () => {
  it("returns 401 without auth headers", async () => {
    const response = await app.handle(new Request("http://localhost/posts/course/course-a"));
    expect(response.status).toBe(401);
  });

  it("returns 403 when a student reads a course they are not enrolled in", async () => {
    const response = await app.handle(
      new Request("http://localhost/posts/course/course-b", {
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    expect(response.status).toBe(403);
  });

  it("allows saving a visible post and returns it with hydrated flags", async () => {
    const saveResponse = await app.handle(
      new Request("http://localhost/saved-posts/post-1", {
        method: "POST",
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    expect(saveResponse.status).toBe(201);

    const feedResponse = await app.handle(
      new Request("http://localhost/posts/course/course-a", {
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    const body = await feedResponse.json();
    expect(feedResponse.status).toBe(200);
    expect(body.items[0].hasSaved).toBe(true);
    expect(body.items[0].savesCount).toBe(1);
  });

  it("forbids saving a post in a course the student cannot read", async () => {
    const response = await app.handle(
      new Request("http://localhost/saved-posts/post-2", {
        method: "POST",
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    expect(response.status).toBe(403);
  });

  it("reactivates a soft-deleted save instead of duplicating it", async () => {
    await app.handle(
      new Request("http://localhost/saved-posts/post-1", {
        method: "POST",
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    await app.handle(
      new Request("http://localhost/saved-posts/post-1", {
        method: "DELETE",
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    const secondSaveResponse = await app.handle(
      new Request("http://localhost/saved-posts/post-1", {
        method: "POST",
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    expect(secondSaveResponse.status).toBe(200);

    const saveRows = db.select().from(savedPosts).where(eq(savedPosts.userId, "student-1")).all();
    expect(saveRows).toHaveLength(1);
    expect(saveRows[0]?.deletedAt).toBeNull();
  });

  it("does not let one student read another student's saved list", async () => {
    const response = await app.handle(
      new Request("http://localhost/saved-posts/student-2", {
        headers: {
          "x-user-id": "student-1",
          "x-role": "student"
        }
      })
    );

    expect(response.status).toBe(403);
  });

  it("allows a moderator to remove a post", async () => {
    const response = await app.handle(
      new Request("http://localhost/posts/post-2", {
        method: "DELETE",
        headers: {
          "x-user-id": "moderator-1",
          "x-role": "moderator"
        }
      })
    );

    expect(response.status).toBe(200);

    const feedResponse = await app.handle(
      new Request("http://localhost/posts/course/course-b", {
        headers: {
          "x-user-id": "moderator-1",
          "x-role": "moderator"
        }
      })
    );

    const body = await feedResponse.json();
    expect(body.items).toHaveLength(0);
  });
});
