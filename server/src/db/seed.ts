import { db, ensureSchema } from "./client";
import { courses, enrollments, posts, savedPosts, users } from "./schema";

const now = Date.now();

async function seed() {
  ensureSchema();
  db.delete(savedPosts).run();
  db.delete(posts).run();
  db.delete(enrollments).run();
  db.delete(courses).run();
  db.delete(users).run();

  db.insert(users).values([
    { id: "student-1", name: "Ava", role: "student" },
    { id: "student-2", name: "Maya", role: "student" },
    { id: "student-3", name: "Leo", role: "student" },
    { id: "moderator-1", name: "Noah", role: "moderator" }
  ]).run();

  db.insert(courses).values([
    { id: "course-react", title: "React Foundations" },
    { id: "course-sql", title: "SQL for Product Engineers" }
  ]).run();

  db.insert(enrollments).values([
    { id: "enrollment-1", userId: "student-1", courseId: "course-react" },
    { id: "enrollment-2", userId: "student-1", courseId: "course-sql" },
    { id: "enrollment-3", userId: "student-2", courseId: "course-react" },
    { id: "enrollment-4", userId: "student-3", courseId: "course-sql" }
  ]).run();

  db.insert(posts).values([
    {
      id: "post-1",
      courseId: "course-react",
      authorId: "student-2",
      title: "How do you structure server state?",
      body: "I keep mixing local UI state with fetched data. Curious how others separate concerns.",
      likesCount: 5,
      commentsCount: 2,
      viewsCount: 18,
      createdAt: new Date(now - 1000 * 60 * 60 * 2),
      deletedAt: null
    },
    {
      id: "post-2",
      courseId: "course-react",
      authorId: "student-1",
      title: "React Query optimistic updates",
      body: "When do you prefer invalidation over direct cache writes for toggles like bookmarks?",
      likesCount: 9,
      commentsCount: 4,
      viewsCount: 31,
      createdAt: new Date(now - 1000 * 60 * 60),
      deletedAt: null
    },
    {
      id: "post-3",
      courseId: "course-sql",
      authorId: "student-3",
      title: "Partial indexes in SQLite",
      body: "I know Postgres supports them well. What is the cleanest fallback story in SQLite?",
      likesCount: 3,
      commentsCount: 1,
      viewsCount: 12,
      createdAt: new Date(now - 1000 * 60 * 30),
      deletedAt: null
    }
  ]).run();

  db.insert(savedPosts).values([
    {
      id: "save-1",
      userId: "student-1",
      postId: "post-1",
      createdAt: new Date(now - 1000 * 60 * 20),
      updatedAt: new Date(now - 1000 * 60 * 20),
      deletedAt: null
    },
    {
      id: "save-2",
      userId: "student-2",
      postId: "post-2",
      createdAt: new Date(now - 1000 * 60 * 10),
      updatedAt: new Date(now - 1000 * 60 * 10),
      deletedAt: null
    }
  ]).run();

  console.log("Seed complete");
}

seed();
