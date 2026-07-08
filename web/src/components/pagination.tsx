import Link from "next/link";
import { formatMessage } from "@/lib/i18n";
import type { Actor, Locale } from "@/lib/types";

export function Pagination({
  locale,
  actor,
  courseId,
  currentPath,
  page,
  total,
  pageSize
}: {
  locale: Locale;
  actor: Actor;
  courseId: string;
  currentPath: "/" | "/saved";
  page: number;
  total: number;
  pageSize: number;
}) {
  const hasPrev = page > 1;
  const hasNext = page * pageSize < total;
  const buildHref = (nextPage: number) =>
    `${currentPath}?locale=${locale}&userId=${actor.userId}&role=${actor.role}&courseId=${courseId}&page=${nextPage}`;

  return (
    <div className="paginationBar">
      <Link href={(hasPrev ? buildHref(page - 1) : buildHref(page)) as any} className={hasPrev ? "chip" : "chip disabledChip"}>
        {formatMessage(locale, "pagination.prev")}
      </Link>
      <span className="muted">Page {page}</span>
      <Link href={(hasNext ? buildHref(page + 1) : buildHref(page)) as any} className={hasNext ? "chip" : "chip disabledChip"}>
        {formatMessage(locale, "pagination.next")}
      </Link>
    </div>
  );
}
