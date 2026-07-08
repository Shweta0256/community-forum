"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMessage } from "@/lib/i18n";
import { queryKeys } from "@/lib/query-keys";
import type { Actor, Locale } from "@/lib/types";
import { PostCard } from "./post-card";

export function PostFeed({ courseId, locale, actor, page }: { courseId: string; locale: Locale; actor: Actor; page: number }) {
  const query = useQuery({
    queryKey: queryKeys.courseFeed(courseId, locale, actor.userId, actor.role, page),
    queryFn: () => api.getCourseFeed(courseId, actor, locale, page)
  });

  if (query.isLoading) {
    return <p>{formatMessage(locale, "loading")}</p>;
  }

  if (query.isError) {
    return <p>{formatMessage(locale, "error.generic")}</p>;
  }

  const items = query.data?.items ?? [];

  return (
    <div className="stack">
      {items.map((post) => (
        <PostCard key={post.id} post={post} locale={locale} actor={actor} page={page} />
      ))}
    </div>
  );
}
