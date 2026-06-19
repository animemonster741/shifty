# Shifty — Infrastructure & Deployment Notes

This document answers two related questions about Shifty's infrastructure:

1. Why does this project use a database (and file storage) instead of plain JSON files?
2. What needs to happen to run Shifty on an isolated / closed (air-gapped) network?

---

## 1. Why a database instead of JSON files?

JSON files work fine for a single-user script or static config. Shifty needs more because of how it's actually used in practice:

| Need | JSON files | Database (Postgres/Supabase) |
|---|---|---|
| **Multiple people editing at once** (shift handovers, alerts) | File gets overwritten/corrupted on concurrent writes — no locking | Handles concurrent writes safely (transactions) |
| **Real-time updates** (alert appears for everyone immediately) | Need to poll and re-read the whole file | Built-in (Supabase Realtime pushes changes to all clients) |
| **Permissions** (admin vs user vs access-only) | You'd have to enforce this yourself in code, easy to mess up | Row Level Security (RLS) enforces it at the database level, even if someone bypasses the UI |
| **Querying/filtering** (alerts by team, date range, status) | Load the entire file into memory and filter in JS every time | Indexed queries, fast even with 100k+ rows |
| **Audit logs / history** (who changed what alert, when) | You'd build your own append-only log file structure | Just another table with timestamps, easy to query and join |
| **Login & sessions** | You'd be rolling your own auth from scratch (very risky) | Supabase Auth handles passwords, sessions, tokens for you |
| **Data integrity** (e.g. a token activity must reference a real person) | Nothing stops bad/duplicate data | Foreign keys, constraints, enums (like the `app_role` enum) enforce it |

**Short version:** JSON files are fine for one reader/writer with no real concurrency. The moment multiple people are hitting "save" around the same time, or permissions need to be enforced server-side rather than just in the UI, you need a real database.

## Why do you need "storage" at all?

There are two distinct kinds, and Shifty uses both:

1. **Database (structured data)** — alerts, users, tokens, room access records, messages. Covered above.
2. **File storage** (object/blob storage, e.g. Supabase Storage / S3-style buckets) — for the Knowledge Base feature, which lets people upload actual *files* (PDFs, docs), not just links. Databases aren't built to hold large binary files efficiently — that's what dedicated file/object storage is for.

If a deployment doesn't need file uploads (links only), the file-storage component (#2) can be skipped — only the database (#1) is strictly required.

## What does the project actually need to run?

1. **A Supabase project** (or equivalent Postgres + Auth + Realtime backend)
2. **The database schema applied** — run the SQL files in `supabase/migrations` in order
3. **Edge Functions deployed** — `auth-with-employee-id`, `admin-create-user`, `admin-reset-password`, `admin-update-team`
4. **Environment variables** set in `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_PUBLISHABLE_KEY=...
   ```
5. **File storage bucket(s)** configured in Supabase — only needed for the Knowledge Base file-upload feature
6. **Node.js/npm or Bun** to install dependencies and run the dev server / build

Without the database and Edge Functions deployed and reachable, the app will load in a browser but nothing will actually work — no login, no alerts, nothing persists.

---

## 2. Running Shifty on a closed / air-gapped network

Copying the project files alone is **not** enough — the app currently depends on Supabase's cloud service plus a couple of internet resources at build/runtime. Below is what's actually needed.

### a) Self-host the backend (the big one)

`VITE_SUPABASE_URL` currently points at Supabase's cloud. On a closed network that's unreachable, so login, alerts, everything fails. You need an equivalent backend running *inside* the closed network:

- **Self-hosted Supabase** — Supabase publishes a docker-compose stack with Postgres, Auth (GoTrue), Realtime, Storage, and a Functions/Deno runtime. This is the closest match to the cloud version and needs minimal code changes.
- **Custom backend** replicating Postgres + Auth + Realtime + file storage — far more work, only worth it if self-hosted Supabase itself is disallowed.

Steps either way:
1. Pull/transfer the required Docker images into the closed network (build/pull on a connected machine, move via approved media).
2. Apply everything in `supabase/migrations/` in order against the new Postgres instance.
3. Deploy the four Edge Functions (`auth-with-employee-id`, `admin-create-user`, `admin-reset-password`, `admin-update-team`) to the self-hosted Functions runtime.
4. Point `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` at the internal instance's URL and anon key.
5. Set up internal DNS (and TLS certs from an internal CA, if HTTPS is required) for whatever hostname the Supabase stack runs on.

### b) Knowledge Base file storage

If the Knowledge Base feature's file uploads are used, the self-hosted Storage component needs its own backend (typically S3-compatible, e.g. MinIO) — the self-hosted Supabase stack includes this.

### c) Fonts — currently pulled from Google Fonts CDN

`index.html` currently loads fonts externally:

```html
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

This will silently fail offline (the UI falls back to default system fonts — not broken, just not the intended look). To fix properly: download the Heebo, IBM Plex Mono, and IBM Plex Sans font files, self-host them (e.g. under `public/fonts`), and replace the Google Fonts `<link>` with local `@font-face` declarations.

### d) Build process — `npm install` needs internet

`npm run build` needs `node_modules`, which means pulling 250+ packages from the npm registry. On a closed network there are two practical approaches:

- **Build outside, ship the artifact**: run `npm install && npm run build` on a machine with internet access, then copy the resulting `dist/` folder (static HTML/JS/CSS) into the closed network and serve it with any web server (nginx, etc.). Simplest if rebuilds inside the closed network aren't frequent.
- **Internal npm mirror/registry** (e.g. Verdaccio, Artifactory) if people need to `npm install` and rebuild from inside the closed network itself.

### e) Auth emails (minor, but worth checking)

Supabase Auth can send confirmation/password-reset emails by default. Since Shifty creates users via the admin (`admin-create-user` Edge Function) rather than self-signup, outbound email usually isn't required — but confirm email confirmation is disabled in the Auth settings, or configure an internal SMTP relay if password-reset emails are wanted.

### f) Things that don't need changes

- The React/Vite frontend has no other internet dependencies at runtime — Lucide icons, Radix UI, Tiptap, etc. are all bundled via npm, not loaded from a CDN.
- `lovable-tagger` only runs during dev builds and makes no runtime network calls; safe to leave in or strip out.

### Summary checklist

| Item | Needed for closed network? |
|---|---|
| Self-hosted Supabase (Postgres + Auth + Realtime + Storage + Functions) | Required |
| Apply `supabase/migrations` to the new instance | Required |
| Deploy the 4 Edge Functions | Required |
| Update `.env` to point at the internal Supabase URL/key | Required |
| Internal DNS / certs | Required |
| Self-host fonts instead of Google Fonts CDN | Recommended (cosmetic only) |
| Build `dist/` outside and copy in — or set up an internal npm mirror | Required (pick one approach) |
| SMTP for auth emails | Only if password-reset emails are needed |
