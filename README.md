# Shifty

Shifty is an internal **shift-handover and operations dashboard** built for teams that monitor systems around the clock (e.g. NOC / control-room style operations). It centralizes alerts, room access approvals, security token tracking, shift messages, and a team knowledge base into a single bilingual (Hebrew/English, RTL-aware) web app.

## What it does

Shifty is organized around a tabbed dashboard, with each tab covering a different part of a shift's workflow:

- **Alerts** — Log and track "ignored/suppressed" alerts (active, pending, expired, archived), with filtering by team, system, and date, plus a full edit/change-log history per alert. Expired alerts auto-archive on a timer.
- **Messages** — Shift handover messages between teams/shifts.
- **Room Access** — Track and approve temporary physical access requests to specific rooms, including authorized personnel, reason (malfunction, maintenance, inspection, etc.), approver, and validity dates.
- **Tokens** — A registry of security tokens/badges issued to people (by company, ID number, token type) with an activity log of check-in/check-out actions.
- **Knowledge Base** — Shared reference material per team, supporting both uploaded files and external links.
- **Links** — Curated list of useful external/internal links, optionally with icons and categories.
- **Statistics** — Aggregate/visual reporting on the above data.
- **Archive** — Historical view of resolved/expired alerts.
- **Logs** — Unified audit trail of changes made to alerts.
- **Custom Pages** — Admin-defined pages that can be added to the navigation dynamically.

There's also a **Global Search** that searches across alerts, and a fully featured **Admin panel** (`/admin`) for managing:
- Users and roles (`admin` / `user`, plus an "access-only" restricted role)
- Teams
- Useful links and knowledge base content
- Navigation/tab configuration (including custom pages)
- Room access settings (rooms list, approvers)

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | shadcn/ui (Radix UI primitives) + Tailwind CSS |
| Routing | React Router |
| Data fetching/cache | TanStack Query |
| Forms/validation | React Hook Form + Zod |
| Rich text | Tiptap |
| Backend | Supabase (Postgres, Auth, Edge Functions, Realtime) |

The project was originally scaffolded with [Lovable](https://lovable.dev).

## Authentication

Users log in with an **Employee ID + password** instead of an email. A Supabase Edge Function (`auth-with-employee-id`) resolves the employee ID to the corresponding internal account email, which is then used to sign in via Supabase Auth. Roles (`admin`, `user`) and an `is_access_only` flag are stored alongside each user's profile and used throughout the app to control what's visible (e.g. which tabs and admin features are shown).

## Backend (Supabase)

- `supabase/migrations` — SQL migrations defining the schema: profiles, roles, teams, alerts, room access, tokens, knowledge base, navigation/custom pages, and Row Level Security (RLS) policies for all of them.
- `supabase/functions` — Edge Functions for privileged operations that shouldn't run in the browser:
  - `auth-with-employee-id` — employee ID → email lookup for login
  - `admin-create-user` — admin-only user creation
  - `admin-reset-password` — admin-only password resets
  - `admin-update-team` — admin-only team management

Data updates (e.g. new/changed alerts) are pushed to connected clients in real time via Supabase Realtime subscriptions.

## Internationalization

The app supports both **English** and **Hebrew**, including automatic RTL/LTR layout switching based on the selected language.

## Getting started

**Requirements:** Node.js & npm (or Bun, since `bun.lock`/`bun.lockb` are present).

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd shifty

# Install dependencies
npm install

# Configure environment variables (Supabase project credentials)
# Create a .env file with:
#   VITE_SUPABASE_URL=your-supabase-url
#   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key

# Start the dev server
npm run dev
```

Other scripts:

```sh
npm run build       # production build
npm run build:dev   # development-mode build
npm run preview      # preview a production build locally
npm run lint         # run ESLint
```

You'll also need a Supabase project with the migrations in `supabase/migrations` applied, and the Edge Functions in `supabase/functions` deployed, for the app to be fully functional.

## Project structure

```
src/
├── components/     # UI components, grouped by feature (alerts, tokens, room-access, etc.) and shadcn/ui primitives
├── contexts/        # React contexts: Auth, Language, Theme, Navigation, Global Search
├── data/            # Static/seed data
├── hooks/           # Custom React hooks
├── integrations/    # Supabase client and generated types
├── lib/             # Utility libraries
├── pages/           # Top-level routed pages (Dashboard, Admin, Settings, Login, etc.)
│   └── tabs/         # Individual dashboard tab implementations
├── types/           # Shared TypeScript types
└── utils/           # Helper utilities

supabase/
├── functions/        # Edge Functions (server-side privileged logic)
└── migrations/       # Database schema & RLS policy migrations
```
