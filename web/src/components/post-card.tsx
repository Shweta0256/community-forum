"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMessage, formatSaveCount } from "@/lib/i18n";
import { queryKeys } from "@/lib/query-keys";
import type { Actor, Locale, PaginatedResponse, PostItem } from "@/lib/types";

type PostCardProps = {
  post: PostItem;
  locale: Locale;
  actor: Actor;
  page: number;
};

function updateLists(
  previous: PaginatedResponse<PostItem> | undefined,
  postId: string,
  nextSaved: boolean
) {
  if (!previous) {
    return previous;
  }

  return {
    ...previous,
    items: previous.items.map((item) =>
      item.id === postId
        ? {
            ...item,
            hasSaved: nextSaved,
            savesCount: Math.max(0, item.savesCount + (nextSaved ? 1 : -1))
          }
        : item
    )
  };
}

export function PostCard({ post, locale, actor, page }: PostCardProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (actor.role === "moderator") {
        return api.removePost(post.id, actor, locale);
      }

      if (post.hasSaved) {
        return api.unsavePost(post.id, actor, locale);
      }

      return api.savePost(post.id, actor, locale);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page) });
      await queryClient.cancelQueries({ queryKey: queryKeys.savedPosts(locale, actor.userId, actor.role, page) });

      const previousFeed = queryClient.getQueryData<PaginatedResponse<PostItem>>(
        queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page)
      );
      const previousSaved = queryClient.getQueryData<PaginatedResponse<PostItem>>(
        queryKeys.savedPosts(locale, actor.userId, actor.role, page)
      );

      if (actor.role === "moderator") {
        queryClient.setQueryData(queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page), {
          ...previousFeed,
          items: previousFeed?.items.filter((item) => item.id !== post.id) ?? []
        });

        return { previousFeed, previousSaved };
      }

      const nextSaved = !post.hasSaved;

      queryClient.setQueryData(
        queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page),
        updateLists(previousFeed, post.id, nextSaved)
      );

      if (previousSaved) {
        if (nextSaved) {
          queryClient.setQueryData(queryKeys.savedPosts(locale, actor.userId, actor.role, page), {
            ...previousSaved,
            items: [{ ...post, hasSaved: true, savesCount: post.savesCount + 1 }, ...previousSaved.items]
          });
        } else {
          queryClient.setQueryData(queryKeys.savedPosts(locale, actor.userId, actor.role, page), {
            ...previousSaved,
            items: previousSaved.items.filter((item) => item.id !== post.id)
          });
        }
      }

      return { previousFeed, previousSaved };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page), context.previousFeed);
      }

      if (context?.previousSaved) {
        queryClient.setQueryData(queryKeys.savedPosts(locale, actor.userId, actor.role, page), context.previousSaved);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courseFeed(post.courseId, locale, actor.userId, actor.role, page) });
      queryClient.invalidateQueries({ queryKey: queryKeys.savedPosts(locale, actor.userId, actor.role, page) });
    }
  });

  return (
    <article className="postCard">
      <div className="postCardHeader">
        <div>
          <p className="eyebrow">{formatMessage(locale, "course.label")}: {post.courseId}</p>
          <h3>{post.title}</h3>
          <p className="muted">{formatMessage(locale, "post.byline", { authorId: post.authorId })}</p>
        </div>

        <button className={post.hasSaved ? "saveButton active" : "saveButton"} onClick={() => mutation.mutate()}>
          {actor.role === "moderator"
            ? formatMessage(locale, "moderator.remove")
            : post.hasSaved
              ? formatMessage(locale, "post.unsave")
              : formatMessage(locale, "post.save")}
        </button>
      </div>

      <p>{post.body}</p>

      <div className="postCardFooter">
        <span>
          {formatMessage(locale, "post.meta", {
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            viewsCount: post.viewsCount
          })}
        </span>
        <span>{formatSaveCount(locale, post.savesCount)}</span>
      </div>
    </article>
  );
}
