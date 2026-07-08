export const queryKeys = {
  courseFeed: (courseId: string, locale: string, userId: string, role: string, page: number) =>
    ["course-feed", courseId, locale, userId, role, page] as const,
  savedPosts: (locale: string, userId: string, role: string, page: number) =>
    ["saved-posts", locale, userId, role, page] as const
};
