import { and, count, desc, eq, inArray, isNull, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError, requireSession, type Session } from "../auth/session";
import { db } from "../db/client";
import { enrollments, posts, savedPosts } from "../db/schema";
import { normalizePagination } from "../lib/pagination";

async function assertCanReadCourse(session: Session, courseId: string) {
  if (session.role === "moderator") {
    return;
  }

  const membership = db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.userId, session.userId)))
    .get();

  if (!membership) {
    throw new HttpError(403, "Forbidden");
  }
}

export const postsRoutes = new Elysia({ prefix: "/posts" }).get(
  "/course/:courseId",
  async ({ params, query, request }) => {
    const session = requireSession(request);
    await assertCanReadCourse(session, params.courseId);

    const pagination = normalizePagination(query);

    const rows = db
      .select({
        id: posts.id,
        courseId: posts.courseId,
        authorId: posts.authorId,
        title: posts.title,
        body: posts.body,
        likesCount: posts.likesCount,
        commentsCount: posts.commentsCount,
        viewsCount: posts.viewsCount,
        createdAt: posts.createdAt,
        savesCount: sql<number>`sum(case when ${savedPosts.deletedAt} is null then 1 else 0 end)`,
        hasSaved: sql<number>`max(case when ${savedPosts.userId} = ${session.userId} and ${savedPosts.deletedAt} is null then 1 else 0 end)`
      })
      .from(posts)
      .leftJoin(savedPosts, eq(savedPosts.postId, posts.id))
      .where(and(eq(posts.courseId, params.courseId), isNull(posts.deletedAt)))
      .groupBy(posts.id)
      .orderBy(desc(posts.createdAt))
      .limit(pagination.pageSize)
      .offset(pagination.offset)
      .all();

    const [{ total }] = db
      .select({ total: count() })
      .from(posts)
      .where(and(eq(posts.courseId, params.courseId), isNull(posts.deletedAt)))
      .all();

    return {
      items: rows.map((row) => ({
        ...row,
        createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
        hasSaved: Boolean(row.hasSaved),
        savesCount: Number(row.savesCount ?? 0)
      })),
      page: pagination.page,
      pageSize: pagination.pageSize,
      total: Number(total)
    };
  },
  {
    query: t.Object({
      page: t.Optional(t.Numeric()),
      pageSize: t.Optional(t.Numeric())
    })
  }
).delete("/:postId", async ({ params, request }) => {
  const session = requireSession(request);

  if (session.role !== "moderator") {
    throw new HttpError(403, "Forbidden");
  }

  const post = db.select().from(posts).where(eq(posts.id, params.postId)).get();

  if (!post || post.deletedAt) {
    throw new HttpError(404, "Post not found");
  }

  db.update(posts)
    .set({
      deletedAt: new Date()
    })
    .where(eq(posts.id, params.postId))
    .run();

  return { ok: true };
});

export async function assertPostsReadable(session: Session, postIds: string[]) {
  if (postIds.length === 0 || session.role === "moderator") {
    return;
  }

  const allowedPosts = db
    .select({
      postId: posts.id
    })
    .from(posts)
    .innerJoin(enrollments, and(eq(enrollments.courseId, posts.courseId), eq(enrollments.userId, session.userId)))
    .where(inArray(posts.id, postIds))
    .all();

  if (allowedPosts.length !== postIds.length) {
    throw new HttpError(403, "Forbidden");
  }
}
