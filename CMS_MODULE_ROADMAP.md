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

## Phase 3 — Translation workflow (done)

Lightweight "flag as needed" tracker (per the user's scoping answers): a
translation task is just `entity + target language + status`, no assignee /
inbox / reviewer / quality-score workflow, and **`cms_translation_memory` was
dropped** as premature infrastructure for a single-admin-team app.

**Backend** (`backend/sql/027_cms_translation_tasks.sql` +
`backend/app/models/cms.py` `CmsTranslationTask` +
`backend/app/schemas/cms_translation.py` +
`backend/app/api/routes/admin/cms_translations.py`, registered under
`prefix="/cms/translations"`):
- Polymorphic `entity_type` CHECK `('cms_page','blog_post')` + `entity_id`
  (same pattern as `cms_content_revisions`), `target_language_code` FK →
  `languages(code)` ON DELETE CASCADE, `status` CHECK
  `('requested','done','cancelled')`, `requested_by` (real identity via
  `Depends(require_admin)`, `current_user.display_name or current_user.email`),
  `created_at`/`updated_at` + `set_updated_at()` trigger.
- Partial unique index `uq_cms_translation_tasks_active` — one active
  `requested` task per (entity_type, entity_id, target_language_code). A
  duplicate request returns 409; `en` and inactive languages return 400; a
  missing entity returns 404.
- `TranslationTaskOut.entity_title` is resolved at read time via two LEFT
  JOINs to `CmsPage`/`BlogPost` (not denormalized).
- Existing `cms` module permissions gate the routes; no new RBAC module.

**Frontend** (`packages/api-client` types + methods;
`admin/src/lib/translations.ts`; `admin/src/lib/roles.ts`):
- `useTranslationTasks()` — list + `requestTranslation`/`updateTask`/
  `deleteTask` mutations (full-screen list used by the Translations admin
  screen). `useEntityTranslationTasks()` — per-entity list + inline request,
  used by both editors for the toolbar button state.
- "Request translation" now works in **both** the Blog Editor and the Page
  Builder toolbars (replaces the old disabled `title="Coming soon"` stub):
  disabled for the source language `en`, when a request for that language is
  already pending, or while a request is in flight; shows a `Languages` icon
  and "Requested" when pending.

**Translations admin screen** (`admin/src/app/(dashboard)/cms/translations/page.tsx`,
nav item added to `admin-sidebar.tsx` next to the other CMS items):
- Status tabs (All / Requested / Done / Cancelled) with counts, a table of
  tasks with entity badge + title (links to the page/post editor), target
  language (native name from `useLanguages`), status badge, requester,
  relative time, and a per-row actions menu: mark done / cancel / re-open /
  delete (delete uses the codebase's `window.confirm()` convention — no modal
  component was introduced).

**Scope notes**: target languages come from the existing `languages` table
(sources are English-only), requests gate on `cms` edit/delete permissions,
and the CMS dashboard hub is still mock data — it was not wired to real
translation counts.

**Applied & verified end-to-end (2026-08-13)** — `027` is live on the
dockerized Postgres and all four routes were exercised against real data
(login as `admin@royalvacation.com` / `admin12345`):
- 201 create (page→ar, post→fr) with `entity_title` resolved and
  `requested_by` = acting admin; 409 on duplicate active request; 400 for
  `en`; 404 for missing entity.
- PATCH `requested→done→requested→cancelled` (trigger bumps `updated_at`);
  DELETE 204; GET list ordered by `created_at desc` with `status=` /
  `entity_type=` filters.
- **Bug found & fixed during verification**: PATCH returned 500
  (`sqlalchemy.exc.MissingGreenlet`) because the `set_updated_at()` trigger
  rewrites `updated_at` server-side and the in-session ORM object can't
  lazy-load it after commit. Fixed by re-`select()`ing the task after commit
  (`cms_translations.py` update handler), matching the `cms_pages.py` pattern.
  The roadmap's "always re-select after commit" rule bit again, for real.

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
  '*uvicorn*app.main*' }`), then restart with `python -m uvicorn app.main:app
  --port 8090` from `backend/`. Postgres runs in Docker (`royal_vacation_db`,
  port **5432** — the compose file was updated from the old `royal_vacation_db2`
  / 5433; `docker compose up -d db` in `backend/`).
- **Applying the `sql/` migrations on a fresh DB is NOT purely numeric order**:
  `001_users.sql` has FKs to `currencies`/`languages` (created in `011`), while
  `011`'s triggers need the `set_updated_at()` function (defined in `001`).
  Correct order: pre-create `set_updated_at()`, then `011`, then `001`, then
  `002..010`, then `012..027`. PowerShell can't use `<` redirection, so pipe
  content in: `Get-Content -Raw file.sql | docker exec -i royal_vacation_db
  psql -U postgres -d royal_vacation -v ON_ERROR_STOP=1`.
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
