# CLAUDE.md

This file gives Claude Code (and any other Claude instance working in this repo) the context needed to work effectively on **Shifty**.

## What this project is

Shifty is a **shift-handover / operations dashboard** for teams that monitor systems around the clock (NOC / control-room style operations). It centralizes:

- Alerts that are being deliberately ignored/suppressed for a period of time (with full audit history)
- Shift handover messages
- Room access requests/approvals
- Security token (badge) issuance and activity tracking
- A team knowledge base (files + links)
- A curated list of useful links
- Statistics/reporting
- Admin-configurable navigation, including fully custom pages

It is bilingual (English / Hebrew) with automatic RTL layout switching, and was originally scaffolded with [Lovable](https://lovable.dev) (you may see Lovable-specific tooling like `lovable-tagger` and auto-generated comments — these are expected, not mistakes).

## Tech stack

- **Build tool:** Vite 5 (`@vitejs/plugin-react-swc`)
- **Language:** TypeScript (relatively loose config — see "TypeScript config notes" below)
- **UI:** React 18, Tailwind CSS, shadcn/ui (Radix UI primitives under `src/components/ui`)
- **Routing:** React Router v6 (`BrowserRouter`)
- **Server state:** TanStack Query (`QueryClientProvider` wraps the app, though many tabs currently fetch with `useEffect` + raw Supabase calls rather than `useQuery` — be consistent with the surrounding code in whichever file you're editing)
- **Forms:** React Hook Form + Zod (`@hookform/resolvers`)
- **Rich text:** Tiptap (`src/components/ui/rich-text-editor.tsx`)
- **Drag and drop:** `@dnd-kit/*` (used for reordering, e.g. navigation tabs)
- **Backend:** Supabase — Postgres, Auth, Edge Functions (Deno), Realtime, Storage
- **Package manager:** npm (`package-lock.json`) — Bun lockfiles (`bun.lock`, `bun.lockb`) are also present; either should work but **don't mix them** in one change. Default to npm unless told otherwise.

## Commands

```sh
npm install        # install dependencies
npm run dev         # start Vite dev server (port 8080, see vite.config.ts)
npm run build       # production build
npm run build:dev   # build in development mode (useful for debugging a prod-like build)
npm run preview      # preview a production build locally
npm run lint         # ESLint
```

There is **no test suite configured** in this repo currently. Don't assume Jest/Vitest exist — check `package.json` before referencing test commands, and ask before introducing a new test framework.

## Environment variables

The app requires a `.env` file (not committed) with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

These are read in `src/integrations/supabase/client.ts`, which is an **auto-generated file** — comment at the top says "Do not edit it directly." Don't hand-edit it; if the Supabase client setup needs to change, regenerate it or be very deliberate and call this out.

## Path aliases

`@/*` maps to `./src/*` (configured in both `vite.config.ts` and `tsconfig.json`). Always use `@/` imports for anything under `src/`, matching the existing code (e.g. `import { supabase } from '@/integrations/supabase/client'`).

## TypeScript config notes

This project's `tsconfig.json` deliberately relaxes several strict checks:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

This means TypeScript will **not** catch a lot of null/undefined or implicit-`any` issues that it would in a strict project. Don't assume the compiler will save you — reason about null safety manually, especially around Supabase query results (which are typed as possibly `null`).

You will also see `(supabase as any)` casts scattered through the codebase (e.g. `src/pages/Dashboard.tsx`, `src/pages/tabs/AlertsTab.tsx`, `src/pages/tabs/MessagesTab.tsx`). This is a workaround for tables that exist in the live database but aren't (yet) reflected in the generated `src/integrations/supabase/types.ts`. When adding a new table, prefer regenerating types properly; only fall back to `as any` if that's not feasible, and match the existing style if you do.

## ESLint notes

- `@typescript-eslint/no-unused-vars` is **off** — don't "fix" unused vars unless asked; it's an intentional project choice, not an oversight.
- `react-refresh/only-export-components` is a warning, not an error.
- Run `npm run lint` after non-trivial changes, but expect it to be permissive compared to a typical strict config.

## Directory structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, dialog, table, etc.) — generated via shadcn CLI, see components.json
│   ├── admin/             # Admin panel sections: users, teams, links, knowledge base, navigation, room access
│   ├── alerts/            # Alert modals/tables (Add/Edit/Detail, FilterPanel, AlertsTable)
│   ├── knowledge-base/    # Knowledge base item cards/modals/file preview
│   ├── layout/            # Header, TabNavigation
│   ├── messages/          # Message cards/modals
│   ├── room-access/       # Room access request modal
│   ├── statistics/        # StatCard, charts (recharts)
│   └── tokens/            # Token registry & activity log tables/modals
├── contexts/
│   ├── AuthContext.tsx          # Session, user profile, role, login/logout (see "Authentication" below)
│   ├── LanguageContext.tsx       # i18n strings (en/he) + text direction (ltr/rtl) — large file, ~286 'he:' entries
│   ├── ThemeContext.tsx          # Light/dark theme
│   ├── NavigationContext.tsx     # Dynamic tab list (system tabs + admin-defined custom pages)
│   └── GlobalSearchContext.tsx   # Cross-tab search (currently alerts)
├── data/
│   └── mockData.ts        # Static/seed data — check before assuming any data is mock vs. live
├── hooks/
│   ├── use-mobile.tsx      # Responsive breakpoint hook
│   └── use-toast.ts        # Toast hook (shadcn pattern; toasts also use `sonner` in places — check the file you're editing)
├── integrations/supabase/
│   ├── client.ts           # AUTO-GENERATED Supabase client — do not hand-edit
│   └── types.ts            # AUTO-GENERATED database types — regenerate, don't hand-edit
├── lib/
│   └── utils.ts            # `cn()` helper (clsx + tailwind-merge) — standard shadcn utility
├── pages/
│   ├── Index.tsx            # Root route "/": shows Login or Dashboard based on auth state
│   ├── Dashboard.tsx         # Tabbed shell: renders Header, TabNavigation, and active tab content
│   ├── Admin.tsx             # "/admin" — large file (Users, Teams, Links, Knowledge Base, Navigation, Room Access tabs)
│   ├── Settings.tsx          # "/settings"
│   ├── AccessControlPage.tsx # "/access-control"
│   ├── TokensPage.tsx        # "/tokens" (standalone page; TokensTab also exists inside the dashboard)
│   ├── Login.tsx             # Employee ID + password login form
│   ├── DevCreateUser.tsx     # "/dev/create-user" — DEV ONLY, gated by `import.meta.env.DEV` in App.tsx
│   ├── NotFound.tsx          # Catch-all 404
│   └── tabs/                 # One file per dashboard tab: AlertsTab, MessagesTab, ArchiveTab, LogsTab,
│                               LinksTab, KnowledgeBaseTab, RoomAccessTab, TokensTab, StatisticsTab, CustomPageTab
├── types/index.ts            # Shared domain types: IgnoredAlert, AlertChangeLog, ImportantMessage, Comment,
│                               AlertFilters, TEAMS, SYSTEMS, SHIFT_PRESETS, QUICK_DURATIONS, COMMON_HOURS
├── utils/                     # Misc helpers
├── App.tsx                    # Provider tree + route definitions
├── main.tsx                   # React entry point
└── index.css                   # Tailwind base + CSS variables (shadcn theme)

supabase/
├── functions/                  # Deno Edge Functions (server-side privileged logic)
│   ├── auth-with-employee-id/  # Resolves employee ID -> account email for login
│   ├── admin-create-user/      # Admin-only: create a new user + profile + role
│   ├── admin-reset-password/   # Admin-only: reset a user's password
│   └── admin-update-team/      # Admin-only: team management
├── migrations/                  # SQL migrations, timestamp-prefixed, applied in order
└── config.toml                  # Supabase project config
```

## Domain model (core tables, see `supabase/migrations` for exact DDL)

- `profiles` — one row per user, linked to `auth.users`. Holds `employee_id`, `full_name`, `is_access_only`.
- `user_roles` — separate table from `profiles` **by design**, to avoid privilege escalation via a self-editable profile row. Role is an enum: `app_role = 'admin' | 'user'`.
- `teams` — named teams used across alerts, knowledge base, etc.
- `role_change_logs` / `audit_logs` — append-only history tables.
- `ignored_alerts` — the Alerts feature's main table; status is one of `active | pending | expired | deleted` (see `AlertStatus` in `src/types/index.ts`). Has a parallel "secondary" concept (`is_secondary` flag) for a second alert table shown in the same tab.
- `important_messages` — shift handover messages, can be pinned.
- `room_access_entries`, `rooms`, `access_approvers` — Room Access feature.
- `knowledge_base_items` — file or link type, optionally scoped to a `team_id`.
- `navigation_tabs` / `custom_pages` — drive the dynamic tab list rendered in `NavigationContext` + `Dashboard.tsx`. Some tabs are `is_system` (built-in, can't be deleted by admins) vs. custom pages (admin-created, deletable).
- Token-related tables backing `TokensTab`/`TokensPage` (people registry + activity log).

**Row Level Security (RLS) is enabled on every table.** The standard pattern is:

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;
```

`has_role()` is a `SECURITY DEFINER` function specifically to avoid RLS recursion when policies need to check a user's role. **Always use `has_role(auth.uid(), 'admin'::app_role)` in new policies rather than querying `user_roles` directly inside a policy** — this is the established convention and avoids subtle recursion bugs.

When adding a new table:
1. Enable RLS immediately (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
2. Add explicit policies for SELECT/INSERT/UPDATE/DELETE — don't leave a table with RLS enabled but no policies (that silently blocks all access) or RLS disabled (that exposes everything).
3. Follow the existing naming convention for policy names (descriptive, in quotes, e.g. `"Admins can manage rooms"`).
4. Add a new timestamp-prefixed `.sql` file under `supabase/migrations/` — never edit a past migration that may have already been applied to a live database; add a new one instead.

## Authentication flow

Users log in with an **Employee ID + password**, not an email:

1. `AuthContext.login(employeeId, password)` calls the `auth-with-employee-id` Edge Function with `{ employeeId, password, action: 'login' }`.
2. That function looks up the internal account email for the given employee ID and returns it.
3. The client then calls `supabase.auth.signInWithPassword({ email, password })` using the resolved email.
4. On success, `fetchUserProfile()` loads the `profiles` row and `user_roles` row for the session user and builds the `AppUser` object (`id`, `employeeId`, `fullName`, `role`, `isAccessOnly`).

Role-based UI gating uses `isAdmin` and `isAccessOnly` from `useAuth()` — e.g. `Dashboard.tsx` calls `getVisibleTabs(isAdmin, isAccessOnly)` to decide which tabs to render. When adding a new admin-only feature, gate it both in the UI (check `isAdmin`) **and** in RLS policies (`has_role`) — UI gating alone is not security, it's only how it currently fits together; the DB policy is the actual enforcement layer.

## Realtime

Several tabs (alerts, navigation, messages — see migrations `20260401120000_enable_realtime_navigation.sql` and `20260401123000_add_realtime_alerts_messages.sql`) subscribe to Postgres changes via Supabase Realtime, e.g.:

```ts
const channel = supabase
  .channel('ignored_alerts_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'ignored_alerts' }, () => {
    fetchAlerts();
  })
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

If you add a new table that should update live across clients, you'll likely need to enable Realtime for it in a migration (similar to the two referenced above) and follow this subscribe/cleanup pattern in the component.

## Internationalization (i18n)

`LanguageContext.tsx` holds all UI strings for English and Hebrew (`t('some.key')` pattern, check the file for the exact key style) and derives `direction: 'rtl' | 'ltr'` from the selected language. **Any new user-facing string must be added to both languages in this context, not hardcoded inline** — this is a strict existing convention across the whole app. Components also use `dir={direction}` on layout containers (see `Dashboard.tsx`) to flip RTL/LTR — replicate this for any new top-level page/section.

Some domain-specific values (e.g. `REASON_OPTIONS` in `RoomAccessTab.tsx`, `SHIFT_PRESETS` in `src/types/index.ts`) carry **both** a Hebrew and English label directly on the object (`label_he`/`label_en` or `labelHe`/`labelEn`) rather than going through `LanguageContext`. Match whichever pattern the surrounding file already uses.

## UI conventions

- New low-level UI primitives should go through the **shadcn CLI** (config in `components.json`, base color `slate`, CSS variables enabled) rather than being hand-rolled, to stay consistent with `src/components/ui`.
- Feature components are grouped by domain under `src/components/<feature>/` (e.g. `alerts/`, `tokens/`, `room-access/`) — follow this when adding a new feature area rather than dumping everything in `src/components/ui` or `src/pages`.
- Toasts: this app uses `sonner`'s `toast()` in most tab/feature files — check the specific file before assuming which toast API is in use, since `src/components/ui/toaster.tsx` (shadcn's own toast) also exists.
- Class merging: use the `cn()` helper from `@/lib/utils` rather than manually concatenating Tailwind class strings.
- Modals follow an `Add<Thing>Modal` / `Edit<Thing>Modal` / `<Thing>DetailModal` naming convention — match this for new entities.

## Things to be careful about

- **Don't hand-edit `src/integrations/supabase/client.ts` or `types.ts`** — they're generated. If types are missing/wrong (hence the `as any` casts), the correct fix is to regenerate from the Supabase schema, not patch the generated file.
- **Never put privileged logic in the frontend.** Anything that needs elevated permissions (creating users, resetting passwords, managing teams as an admin) goes through a Supabase Edge Function under `supabase/functions/`, which uses the service role key server-side — mirror this pattern for new privileged operations rather than trying to do them with the anon key from the client.
- **Migrations are append-only.** Add a new timestamped file; don't rewrite history.
- **RLS is the real security boundary**, not the React UI. Treat `isAdmin`/`isAccessOnly` checks in components as UX, and enforce the actual rule in a policy.
- **i18n is not optional.** Any new visible string needs an English and Hebrew entry, and RTL needs to keep working.
- The `DevCreateUser` page is intentionally dev-only (`import.meta.env.DEV` guard in `App.tsx`) — don't expose it in production builds.
- `lovable-tagger` and other Lovable-specific artifacts are intentional (this project can still be edited via the Lovable platform) — don't strip them out as "unused" without being asked.
