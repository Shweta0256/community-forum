import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { Actor, Locale, Role } from "./types";

const catalogs = { en, es } as const;

export function getLocale(searchParams?: Record<string, string | string[] | undefined>): Locale {
  const candidate = searchParams?.locale;
  return candidate === "es" ? "es" : "en";
}

export function getActor(searchParams?: Record<string, string | string[] | undefined>): Actor {
  const userId = typeof searchParams?.userId === "string" ? searchParams.userId : "student-1";
  const roleCandidate = typeof searchParams?.role === "string" ? searchParams.role : "student";
  const role: Role = roleCandidate === "moderator" ? "moderator" : "student";

  return { userId, role };
}

export function getCourseId(searchParams?: Record<string, string | string[] | undefined>) {
  return typeof searchParams?.courseId === "string" ? searchParams.courseId : "course-react";
}

export function getPage(searchParams?: Record<string, string | string[] | undefined>) {
  const page = typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function getMessages(locale: Locale) {
  return catalogs[locale];
}

export function formatMessage(
  locale: Locale,
  key: keyof typeof en,
  values: Record<string, string | number> = {}
) {
  const template = catalogs[locale][key] ?? catalogs.en[key];

  return Object.entries(values).reduce(
    (message, [token, value]) => message.replaceAll(`{${token}}`, String(value)),
    template
  );
}

export function formatSaveCount(locale: Locale, count: number) {
  const key = count === 1 ? "post.saves_one" : "post.saves_other";
  return formatMessage(locale, key, { count });
}
