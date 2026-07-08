import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const filename = process.env.DATABASE_URL ?? "./community-forum.db";

export const sqlite = new Database(filename);
export const db = drizzle(sqlite, { schema });

export function ensureSchema() {
  sqlite.exec(`
    create table if not exists users (
      id text primary key,
      name text not null,
      role text not null check(role in ('student', 'moderator'))
    );

    create table if not exists courses (
      id text primary key,
      title text not null
    );

    create table if not exists enrollments (
      id text primary key,
      user_id text not null references users(id),
      course_id text not null references courses(id)
    );
    create unique index if not exists enrollments_user_course_unique on enrollments(user_id, course_id);

    create table if not exists posts (
      id text primary key,
      course_id text not null references courses(id),
      author_id text not null references users(id),
      title text not null,
      body text not null,
      likes_count integer not null default 0,
      comments_count integer not null default 0,
      views_count integer not null default 0,
      created_at integer not null,
      deleted_at integer
    );
    create index if not exists posts_course_created_at_idx on posts(course_id, created_at);

    create table if not exists saved_posts (
      id text primary key,
      user_id text not null references users(id),
      post_id text not null references posts(id),
      created_at integer not null,
      updated_at integer not null,
      deleted_at integer
    );
    create unique index if not exists saved_posts_user_post_unique on saved_posts(user_id, post_id);
    create index if not exists saved_posts_user_deleted_updated_idx on saved_posts(user_id, deleted_at, updated_at);
    create index if not exists saved_posts_post_deleted_idx on saved_posts(post_id, deleted_at);
  `);
}
