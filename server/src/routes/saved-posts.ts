import { and, count, desc, eq, isNull, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { HttpError, requireSession } from "../auth/session.js";
import { db } from "../db/client.js";
import { posts, savedPosts } from "../db/schema.js";
import { savePost, type SaveRecord, unsavePost } from "../domain/saved-posts.js";
import { normalizePagination } from "../lib/pagination.js";
import { assertPostsReadable } from "./posts.js";

function mapSaveRecord(row: typeof savedPosts.$inferSelect): SaveRecord {
  return {
    id: row.id,
    userId: row.userId,
    postId: row.postId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt
  };
}

function createId() {
  return `save-${Math.random().toString(36).slice(2, 10)}`;
}

function listSavedPostsForUser(userId: string, page: number, pageSize: number, offset: number) {
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
      savedAt: savedPosts.updatedAt,
      savesCount: sql<number>`(
        select count(*) from saved_posts sp2
        where sp2.post_id = ${posts.id} and sp2.deleted_at is null
      )`,
      hasSaved: sql<number>`1`
    })
    .from(savedPosts)
    .innerJoin(posts, eq(posts.id, savedPosts.postId))
    .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt), isNull(posts.deletedAt)))
    .orderBy(desc(savedPosts.updatedAt))
    .limit(pageSize)
    .offset(offset)
    .all();

  const [{ total }] = db
    .select({ total: count() })
    .from(savedPosts)
    .innerJoin(posts, eq(posts.id, savedPosts.postId))
    .where(and(eq(savedPosts.userId, userId), isNull(savedPosts.deletedAt), isNull(posts.deletedAt)))
    .all();

  return {
    items: rows.map((row) => ({
      ...row,
      createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
      savedAt: row.savedAt instanceof Date ? row.savedAt.toISOString() : row.savedAt,
      hasSaved: true,
      savesCount: Number(row.savesCount ?? 0)
    })),
    page,
    pageSize,
    total: Number(total)
  };
}

export const savedPostsRoutes = new Elysia({ prefix: "/saved-posts" })
  .get(
    "/me",
    async ({ query, request }) => {
      const session = requireSession(request);
      const pagination = normalizePagination(query);

      return listSavedPostsForUser(session.userId, pagination.page, pagination.pageSize, pagination.offset);
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric()),
        pageSize: t.Optional(t.Numeric())
      })
    }
  )
  .post(
    "/:postId",
    async ({ params, request, set }) => {
      const session = requireSession(request);
      const post = db.select().from(posts).where(and(eq(posts.id, params.postId), isNull(posts.deletedAt))).get();

      if (!post) {
        throw new HttpError(404, "Post not found");
      }

      await assertPostsReadable(session, [post.id]);

      const existing = db
        .select()
        .from(savedPosts)
        .where(and(eq(savedPosts.userId, session.userId), eq(savedPosts.postId, params.postId)))
        .get();

      const decision = savePost({
        existingRecord: existing ? mapSaveRecord(existing) : null,
        userId: session.userId,
        postId: params.postId,
        now: new Date(),
        createId
      });

      if (decision.action === "created") {
        db.insert(savedPosts).values(decision.record).run();
        set.status = 201;
      } else if (decision.action === "reactivated") {
        db.update(savedPosts)
          .set({
            updatedAt: decision.record.updatedAt,
            deletedAt: null
          })
          .where(eq(savedPosts.id, decision.record.id))
          .run();
      } else {
        db.update(savedPosts)
          .set({
            updatedAt: decision.record.updatedAt
          })
          .where(eq(savedPosts.id, decision.record.id))
          .run();
      }

      return { ok: true, action: decision.action };
    }
  )
  .delete("/:postId", async ({ params, request }) => {
    const session = requireSession(request);
    const existing = db
      .select()
      .from(savedPosts)
      .where(and(eq(savedPosts.userId, session.userId), eq(savedPosts.postId, params.postId)))
      .get();

    const decision = unsavePost({
      existingRecord: existing ? mapSaveRecord(existing) : null,
      now: new Date()
    });

    if (decision.action === "soft-deleted") {
      db.update(savedPosts)
        .set({
          updatedAt: decision.record.updatedAt,
          deletedAt: decision.record.deletedAt
        })
        .where(eq(savedPosts.id, decision.record.id))
        .run();
    }

    return { ok: true, action: decision.action };
  })
  .get("/:userId", async ({ params, request }) => {
    const session = requireSession(request);
    if (params.userId !== session.userId) {
      throw new HttpError(403, "Forbidden");
    }

    const pagination = normalizePagination({});
    return listSavedPostsForUser(session.userId, pagination.page, pagination.pageSize, pagination.offset);
  }, {
    query: t.Object({
      page: t.Optional(t.Numeric()),
      pageSize: t.Optional(t.Numeric())
    })
  });
