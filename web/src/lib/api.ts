import type { Actor, Locale, PaginatedResponse, PostItem } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, actor: Actor, options: RequestInit = {}, locale: Locale): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      "x-locale": locale,
      "x-user-id": actor.userId,
      "x-role": actor.role,
      ...(options.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(body.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  getCourseFeed(courseId: string, actor: Actor, locale: Locale, page = 1) {
    return request<PaginatedResponse<PostItem>>(`/posts/course/${courseId}?page=${page}&pageSize=10`, actor, {}, locale);
  },
  getSavedPosts(actor: Actor, locale: Locale, page = 1) {
    return request<PaginatedResponse<PostItem>>(`/saved-posts/me?page=${page}&pageSize=10`, actor, {}, locale);
  },
  savePost(postId: string, actor: Actor, locale: Locale) {
    return request<{ ok: true; action: string }>(`/saved-posts/${postId}`, actor, { method: "POST" }, locale);
  },
  unsavePost(postId: string, actor: Actor, locale: Locale) {
    return request<{ ok: true; action: string }>(`/saved-posts/${postId}`, actor, { method: "DELETE" }, locale);
  },
  removePost(postId: string, actor: Actor, locale: Locale) {
    return request<{ ok: true }>(`/posts/${postId}`, actor, { method: "DELETE" }, locale);
  }
};
