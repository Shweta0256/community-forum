export type Locale = "en" | "es";
export type Role = "student" | "moderator";

export type Actor = {
  userId: string;
  role: Role;
};

export type PostItem = {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  body: string;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string | number | Date;
  hasSaved: boolean;
  savesCount: number;
  savedAt?: string | number | Date;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
