import Link from "next/link";
import { DemoControls } from "@/components/demo-controls";
import { Pagination } from "@/components/pagination";
import { PostFeed } from "@/components/post-feed";
import { api } from "@/lib/api";
import { formatMessage, getActor, getCourseId, getLocale, getPage } from "@/lib/i18n";

export default async function FeedPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const locale = getLocale(resolvedSearchParams);
  const actor = getActor(resolvedSearchParams);
  const courseId = getCourseId(resolvedSearchParams);
  const page = getPage(resolvedSearchParams);
  const preview = await api.getCourseFeed(courseId, actor, locale, page).catch(() => null);

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">{formatMessage(locale, "app.title")}</p>
          <h2>{formatMessage(locale, "feed.heading")}</h2>
          <p>{formatMessage(locale, "feed.subheading")}</p>
        </div>

        <div className="heroActions">
          <Link href={`/?locale=${locale === "en" ? "es" : "en"}`} className="secondaryLink">
            {formatMessage(locale, "locale.switch")}
          </Link>
          <Link href={`/saved?locale=${locale}`} className="primaryLink">
            {formatMessage(locale, "nav.saved")}
          </Link>
        </div>
      </section>

      <DemoControls locale={locale} actor={actor} courseId={courseId} page={page} currentPath="/" />
      <PostFeed courseId={courseId} locale={locale} actor={actor} page={page} />
      {preview ? (
        <Pagination
          locale={locale}
          actor={actor}
          courseId={courseId}
          currentPath="/"
          page={page}
          total={preview.total}
          pageSize={preview.pageSize}
        />
      ) : null}
    </main>
  );
}
