# Community Forum

Full-stack take-home project for the Saved Posts forum feature.

## Structure

- `server/` - Elysia API, Drizzle schema, SQLite seed data, Vitest tests
- `web/` - Next.js app, React Query client layer, i18n-enabled UI

## Demo notes

- The web app includes demo controls for switching:
  - active user
  - active role
  - course
  - locale
- Use the moderator user to exercise post removal.
- Use different students and courses to demonstrate authorization boundaries.

## Suggested setup

### Backend

```bash
cd server
npm install
npm run db:seed
npm run dev
```

### Frontend

```bash
cd web
npm install
npm run dev
```

Backend defaults to `http://localhost:4000`.

If needed, set:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```
