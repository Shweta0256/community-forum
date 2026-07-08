import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role", { enum: ["student", "moderator"] }).notNull()
});

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  title: text("title").notNull()
});

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id)
  },
  (table) => ({
    userCourseUnique: uniqueIndex("enrollments_user_course_unique").on(table.userId, table.courseId)
  })
);

export const posts = sqliteTable(
  "posts",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    body: text("body").notNull(),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    viewsCount: integer("views_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" })
  },
  (table) => ({
    courseCreatedAtIdx: index("posts_course_created_at_idx").on(table.courseId, table.createdAt)
  })
);

export const savedPosts = sqliteTable(
  "saved_posts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "timestamp_ms" })
  },
  (table) => ({
    userPostUnique: uniqueIndex("saved_posts_user_post_unique").on(table.userId, table.postId),
    userDeletedUpdatedIdx: index("saved_posts_user_deleted_updated_idx").on(
      table.userId,
      table.deletedAt,
      table.updatedAt
    ),
    activeSaveCountIdx: index("saved_posts_post_deleted_idx").on(table.postId, table.deletedAt)
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  posts: many(posts),
  saves: many(savedPosts)
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  enrollments: many(enrollments),
  posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  course: one(courses, {
    fields: [posts.courseId],
    references: [courses.id]
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  }),
  saves: many(savedPosts)
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(users, {
    fields: [savedPosts.userId],
    references: [users.id]
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id]
  })
}));

export const activeSaveCount = sql<number>`sum(case when ${savedPosts.deletedAt} is null then 1 else 0 end)`;
