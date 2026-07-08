# NOTES

## Key decisions

- I consolidated the project into a single repo-style workspace with `server/` and `web/` folders so the full stack is reviewed in one place while keeping the layers separate.
- The `saved_posts` table uses one row per `userId + postId` with `deletedAt` soft delete. That preserves history and allows reactivation instead of duplicate rows.
- Authorization is stubbed through request headers, but access rules are enforced in the API layer:
  - unauthenticated requests return `401`
  - students outside a course return `403`
  - missing posts return `404`
  - saved list ownership is limited to the current user
- Save / un-save behavior lives in pure domain functions so idempotency and soft-delete reactivation are easy to test without the database.
- Hydrated `hasSaved` and `savesCount` are computed in API queries so the UI can stay presentation-focused.
- The frontend exposes demo controls for actor, role, course, and locale so the walkthrough can show authorization behavior without changing code.

## Trade-offs

- I used SQLite instead of PostgreSQL to keep setup lightweight for a take-home.
- I added a lightweight schema bootstrap in code so the project can come up without waiting on a migration flow first.
- The frontend uses a fixed stubbed student identity in the API client for now. In a follow-up pass, I would surface a small identity switcher to demo different roles and enrollments.
- I focused testing on the most important correctness path: save/un-save domain logic plus an API-level auth and hydration flow.
- I kept the auth stub header-based, per the brief, and made it explicit in the route layer for predictable behavior in this local Node runtime.

## With another day

- Add a moderator UI state to remove posts and browse across courses.
- Add stronger integration tests around re-save after soft delete and ownership boundaries on saved lists.
- Add a proper shared package for request / response types.
- Improve the visual polish of pagination controls and add a more robust toast/error system.
