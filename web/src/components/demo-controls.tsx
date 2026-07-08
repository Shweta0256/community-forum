import Link from "next/link";
import { formatMessage } from "@/lib/i18n";
import type { Actor, Locale } from "@/lib/types";

const actors: Array<{ actor: Actor; label: string }> = [
  { actor: { userId: "student-1", role: "student" }, label: "Student Ava" },
  { actor: { userId: "student-2", role: "student" }, label: "Student Maya" },
  { actor: { userId: "moderator-1", role: "moderator" }, label: "Moderator Noah" }
];

const courses = [
  { id: "course-react", label: "React Foundations" },
  { id: "course-sql", label: "SQL for Product Engineers" }
];

type DemoControlsProps = {
  locale: Locale;
  actor: Actor;
  courseId: string;
  page: number;
  currentPath: "/" | "/saved";
};

function buildHref(path: string, locale: Locale, actor: Actor, courseId: string, page: number) {
  return `${path}?locale=${locale}&userId=${actor.userId}&role=${actor.role}&courseId=${courseId}&page=${page}`;
}

export function DemoControls({ locale, actor, courseId, page, currentPath }: DemoControlsProps) {
  return (
    <section className="demoPanel">
      <div>
        <p className="eyebrow">{formatMessage(locale, "demo.heading")}</p>
        <h3>{formatMessage(locale, "demo.subheading")}</h3>
      </div>

      <div className="filters">
        <div className="filterGroup">
          <span className="filterLabel">{formatMessage(locale, "demo.actor")}</span>
          <div className="chipRow">
            {actors.map(({ actor: option, label }) => {
              const active = option.userId === actor.userId && option.role === actor.role;
              return (
                <Link
                  key={`${option.userId}-${option.role}`}
                  href={buildHref(currentPath, locale, option, courseId, 1) as any}
                  className={active ? "chip activeChip" : "chip"}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="filterGroup">
          <span className="filterLabel">{formatMessage(locale, "demo.course")}</span>
          <div className="chipRow">
            {courses.map((course) => {
              const active = course.id === courseId;
              return (
                <Link
                  key={course.id}
                  href={buildHref(currentPath, locale, actor, course.id, 1) as any}
                  className={active ? "chip activeChip" : "chip"}
                >
                  {course.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="filterGroup">
          <span className="filterLabel">{formatMessage(locale, "demo.locale")}</span>
          <div className="chipRow">
            <Link
              href={buildHref(currentPath, locale === "en" ? "es" : "en", actor, courseId, page) as any}
              className="chip"
            >
              {formatMessage(locale, "locale.switch")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
