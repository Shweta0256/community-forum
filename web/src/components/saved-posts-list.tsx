"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatMessage } from "@/lib/i18n";
import { queryKeys } from "@/lib/query-keys";
import type { Actor, Locale } from "@/lib/types";
import { PostCard } from "./post-card";

export function SavedPostsList({ locale, actor, page }: { locale: Locale; actor: Actor; page: number }) {
  const query = useQuery({
    queryKey: queryKeys.savedPosts(locale, actor.userId, actor.role, page),
    queryFn: () => api.getSavedPosts(actor, locale, page)
  });

  if (query.isLoading) {
    return <p>{formatMessage(locale, "loading")}</p>;
  }

  if (query.isError) {
    return <p>{formatMessage(locale, "error.generic")}</p>;
  }

  const items = query.data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="emptyState">
        <h3>{formatMessage(locale, "saved.empty.title")}</h3>
        <p>{formatMessage(locale, "saved.empty.body")}</p>
      </div>
    );
  }

  return (
    <div className="stack">
      {items.map((post) => (
        <PostCard key={post.id} post={post} locale={locale} actor={actor} page={page} />
      ))}
    </div>
  );
}
