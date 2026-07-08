import Link from "next/link";
import { DemoControls } from "@/components/demo-controls";
import { Pagination } from "@/components/pagination";
import { SavedPostsList } from "@/components/saved-posts-list";
import { api } from "@/lib/api";
import { formatMessage, getActor, getCourseId, getLocale, getPage } from "@/lib/i18n";

export default async function SavedPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = getLocale(resolvedSearchParams);
  const actor = getActor(resolvedSearchParams);
  const courseId = getCourseId(resolvedSearchParams);
  const page = getPage(resolvedSearchParams);
  const preview = await api.getSavedPosts(actor, locale, page).catch(() => null);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">{formatMessage(locale, "app.title")}</p>
          <h2>{formatMessage(locale, "saved.heading")}</h2>
          <p>{formatMessage(locale, "saved.subheading")}</p>
        </div>

        <div className="heroActions">
          <Link href={`/saved?locale=${locale === "en" ? "es" : "en"}`} className="secondaryLink">
            {formatMessage(locale, "locale.switch")}
          </Link>
          <Link href={`/?locale=${locale}`} className="primaryLink">
            {formatMessage(locale, "nav.feed")}
          </Link>
        </div>
      </section>

      <DemoControls locale={locale} actor={actor} courseId={courseId} page={page} currentPath="/saved" />
      <SavedPostsList locale={locale} actor={actor} page={page} />
      {preview ? (
        <Pagination
          locale={locale}
          actor={actor}
          courseId={courseId}
          currentPath="/saved"
          page={page}
          total={preview.total}
          pageSize={preview.pageSize}
        />
      ) : null}
    </main>
  );
}
