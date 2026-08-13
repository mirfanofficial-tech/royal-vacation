# CMS Module — Real Backend Roadmap

Tracks the multi-phase build turning the CMS module from mock/partial data into
real backend-backed features, based on a proposed DB schema the user supplied.
Each phase was scoped, planned (Claude plan mode), built, and curl-verified
end-to-end before moving to the next. This file is the continuation point —
read it top to bottom before resuming.

## Status

| Phase | Feature | Status |
|---|---|---|
| 1 | Media Library backend | ✅ Done |
| 2 | Version History (revisions + restore) | ✅ Done |
| 3 | Translation workflow (tasks + memory) | ⬜ Not started — next up |

Sequencing choice (confirmed by the user): **one phase at a time, review each
before starting the next** — not a combined big-bang build.

## Already decided — don't re-litigate these

The user's original schema proposal used JSONB-per-language columns for all
CMS/blog content and several extra tables. After research + clarifying
questions, these were the resolved decisions for the whole module:

- **Multilingual storage stays as-is**: per-entity translation tables
  (`cms_page_translations`, `blog_post_translations`, and now
  `cms_media_asset_translations`) with a `language_code` FK — **not** JSONB
  columns. Rejected migrating to JSONB because it would require rewriting the
  already-built, already-verified translation UI in Pages/Menus/Blog for no
  functional gain.
- **Blog tags stay a plain `TEXT[]` array** on `blog_posts` — not normalized
  into a `blog_tags` table + join table. Already aggregated live by the
  Categories & Tags screen.
- **SEO audit results stay live-computed** (see `admin/src/lib/seo-audit.ts`,
  built earlier this session) — no persisted `cms_seo_audit` /
  `cms_content_sync_log` tables. Revisit only if score-history-over-time
  becomes an actual ask.
- **Blog Comments moderation needed no work** — it already existed end-to-end
  (`backend/app/api/routes/admin/blog_comments.py`,
  `admin/src/app/(dashboard)/blogs/comments/page.tsx`) before this effort
  started. Dropped from scope entirely, not part of any phase.
- Revisions table (`cms_content_revisions`, added in Phase 2) is **one shared,
  polymorphic table** (`entity_type` + `entity_id`), not two — mirrors the
  existing `user_activity_logs` shape. JSONB is the right call *there*
  specifically because a revision snapshot is opaque and never queried
  structurally — this doesn't reopen the "no JSONB for live content" decision
  above.

## Phase 1 — Media Library backend (done)

Real `cms_media_folders` / `cms_media_assets` / `cms_media_asset_translations`
tables (migration `025_cms_media.sql`), full CRUD + multipart upload API at
`/api/v1/admin/cms/media/*`, wired into the previously-mock
`admin/src/app/(dashboard)/cms/media/page.tsx`. `used_in_count` is computed
live by scanning CMS page / blog post / block content for the asset's URL —
not stored. Local-disk `static/uploads/` storage, matching every other
upload endpoint in the app (no object storage exists anywhere in this stack).

## Phase 2 — Version History (done)

Real revision snapshots + restore for CMS Pages and Blog Posts. Migration
`026_cms_content_revisions.sql`. Every explicit save creates a revision
(autosave in the Blog Editor passes `create_revision=false` to avoid spam);
restore snapshots the current state first (never a one-way door); pruned to
the 50 most recent per entity. UI: shared `admin/src/components/version-history-panel.tsx`,
a "History" button in both the Page Builder and Blog Editor toolbars. Plain
side-by-side compare view, no diff-highlighting library (user's choice — no
new dependency).

## Phase 3 — Translation workflow (not started)

**This is the next phase.** It has not been planned yet — start a fresh Claude
plan-mode session for it rather than assuming the shape below is final; this
is just the context gathered so far so planning doesn't start from zero.

**Scope, from the user's original schema**: `cms_translation_tasks`
(assignment/review workflow — source/target language, status, assignee,
reviewer, quality score) + `cms_translation_memory` (reusable
previously-translated strings, to reduce repeat translation work). No
existing frontend concept for this anywhere in the app.

**Known context for planning:**
- There's a **pre-built UI entry point**: the Blog Editor's Translations bar
  has a disabled `"Request translation"` button
  (`admin/src/components/blog-editor/blog-editor.tsx`, in the row with the
  per-language pills, `title="Coming soon"`) — this is the natural hook-in
  point rather than inventing a new UI slot from scratch. The CMS Page
  Builder has no equivalent stub yet, so decide whether it needs one too.
- No RBAC "translations" module exists yet
  (`dashboard, properties, bookings, guests, modules, cms, blog, reports,
  payments, settings, roles, stays` is the current full list, defined in
  `backend/sql/003_role_permissions.sql` + `004_permissions.sql` + mirrored in
  `packages/api-client/src/types.ts`'s `PermissionModule` union) — decide
  whether translation tasks piggyback on `cms`/`blog`'s existing permission
  checks or need a new module registered (new migration extending both CHECK
  constraints + the TS union).
- Next available migration number: **`027`** (last used: `026_cms_content_revisions.sql`).
- No `AlertDialog`/`ConfirmDialog` component exists anywhere in this codebase
  — every destructive action uses a plain `window.confirm()`. Keep using that
  convention rather than introducing a modal component.
- Real identity capture (`current_user.display_name or current_user.email`)
  was threaded into `cms_pages.py`/`blog_posts.py`'s update handlers in Phase
  2 for `created_by` on revisions — reuse the same `Depends(require_admin)`
  pattern for "assigned_to"/"translated_by"/"reviewed_by" on translation
  tasks so this feature doesn't fall back to free-text/static defaults like
  most of the rest of the app does.
- Questions worth asking the user before designing this phase: is this a
  real assignment workflow (pick a translator, they get a queue, mark
  done, someone reviews) or a lighter "flag this page/post as needing
  translation into X" tracker? The former is a meaningfully bigger UI build
  (a translation-tasks inbox screen, likely under a new nav item) than the
  latter (a few buttons + a badge). Also worth confirming whether
  `cms_translation_memory` (reusable string suggestions) is worth building at
  all for a single-admin-team app of this size, versus dropping it as
  premature infrastructure.

## Other things from the original schema that were explicitly dropped (not deferred)

These came up during scoping and were rejected outright, not postponed — don't
resurrect them without the user explicitly asking again:

- AI-assisted translation/content generation — no real API access to build
  against, would have to be faked.
- Version history "diff/undo-redo duplication" beyond what Phase 2 built.
- Google Search Console-style indexing stats on the SEO Manager screen — no
  real API access.

## Practical notes for resuming

- **Restarting the backend on this Windows box**: `kill <pid>` via the Bash
  tool (Git Bash) does **not** reliably kill the native `python.exe` uvicorn
  process — use PowerShell's `Stop-Process -Id <pid> -Force` instead (found
  via `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like
  '*uvicorn*app.main*' }`), then restart with `nohup python -m uvicorn
  app.main:app --port 8090 > /tmp/uvicorn.log 2>&1 &` from `backend/`.
  Postgres runs in Docker (`royal_vacation_db2`, port 5433) — apply `.sql`
  migrations with `docker exec -i royal_vacation_db2 psql -U postgres -d
  royal_vacation < path/to/migration.sql`.
- **Verification pattern used throughout**: apply migration → restart
  backend → curl-verify the real flow end-to-end (login as
  `admin@royalvacation.com` / `admin12345`, exercise every new endpoint
  against real data) → `npx tsc --noEmit` + `npm run lint` on `admin` →
  rebuild `packages/api-client` (`npm run build`) after any type/method
  changes there.
- **A pre-existing, out-of-scope typecheck error** persists in
  `admin/src/lib/settings-countries.ts` (`mockSettingCountries`/
  `SettingCountry` no longer exported from `mock-data.ts`) — this predates
  all of this work and is not something any of these phases caused. Leave it
  alone unless the user asks about it directly.
- **Hook/API-client conventions to keep mirroring**: `X_KEY` query-key
  consts, `useXQuery`/composite `useX()` hooks in `admin/src/lib/*.ts`,
  `Out`/`Create`/`Update` schema triads in `backend/app/schemas/*.py`,
  translation full-replace via delete-then-reinsert, and always re-`select()`
  after a commit rather than trusting an in-session ORM object (this
  codebase's session factory uses `expire_on_commit=False`, which has bitten
  this project for real before).
