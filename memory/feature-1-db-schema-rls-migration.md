# Feature 1: Database Schema, RLS & Excel Migration

**Date:** 2026-08-20
**Branch:** `feature/db-schema-migration`
**Project Ref:** `wnicitvyytmbtgueionc`

---

## Features Implemented

### 1. Database Tables (via Supabase MCP migrations)

Three tables created in the `public` schema with RLS enabled on every table:

- **`publishers`** — Publisher profiles linked to Supabase auth users.
  - Columns: `id` (bigint identity PK), `user_id` (uuid, unique, FK → `auth.users`), `name`, `website`, `verified`, `created_at`.
  - Indexes: `publishers_user_id_idx`, `publishers_name_idx`.
  - RLS: Public SELECT; publisher owns INSERT/UPDATE/DELETE on their row (`user_id = auth.uid()`).

- **`books`** — Book catalog entries.
  - Columns: `id`, `title`, `author`, `publisher_id` (FK → publishers, ON DELETE SET NULL), `publisher_name`, `isbn`, `year` (text, preserves mixed formats like "Bremen, 2011"), `buy_url`, `cover_url`, `original_title`, `notes`, `status` (check: draft/published/archived), `created_at`.
  - Indexes: `books_publisher_id_idx`, `books_title_idx`, `books_author_idx`, `books_status_idx`.
  - RLS: Public SELECT only published books; publisher can INSERT/UPDATE/DELETE books where `publisher_id` matches their own publishers row.

- **`in_progress_projects`** — Books being translated/printed.
  - Columns: `id`, `publisher_id` (FK → publishers, ON DELETE CASCADE), `title`, `author`, `stage` (check: translation/proofreading/typesetting/print), `progress_percent` (0–100 check), `needs_support`, `support_description`, `contact_url`, `created_at`.
  - Indexes: `in_progress_projects_publisher_id_idx`, `in_progress_projects_stage_idx`.
  - RLS: Public SELECT; publisher owns INSERT/UPDATE/DELETE via publishers.user_id = auth.uid().

### 2. Storage Bucket

- **`book-covers`** bucket created (public read).
- Storage RLS policies: anon/authenticated SELECT; authenticated INSERT/UPDATE/DELETE (covers upsert which needs all three).

### 3. Excel Migration Script

- **File:** `scripts/import_books.py`
- Parses `Bücherliste - schiitische Bücher in deutscher Sprache_15-11-2022.xlsx` (sheet: `veröffentlicht`).
- Idempotent: matches publishers by name, books by (title, publisher_name).
- Uses `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` env vars (service_role bypasses RLS for seeding).
- Handles datetime values in the "Jahr" column (2 rows had datetime objects, extracted year).
- Inserts in batches of 100.

### 4. Data Imported

- **85 publishers** seeded (no user_id — these are historical/import-only publishers).
- **385 books** seeded, all linked to publishers, all with `status = 'published'`.
- 1 Excel row skipped (exact duplicate title + publisher).
- Top publishers by book count: ESLAMICA (121), Islamisches Zentrum Hamburg (31), Islamisches Zentrum Hamburg e.V. (19), Unbekannt (17), Islamisches Kulturzentrum Wien (13).

---

## Errors Encountered

1. **`openpyxl` not installed** → fixed with `pip3 install openpyxl --break-system-packages`.
2. **PEP 668 externally-managed environment** → resolved with `--break-system-packages` flag.
3. **`supabase` Python package not installed** → fixed with `pip3 install supabase --break-system-packages`.
4. **`TypeError: Object of type datetime is not JSON serializable`** — the Excel "Jahr" column had 2 rows with `datetime.datetime` values (rows 228, 229) instead of strings/ints. Fixed `parse_year()` to extract `.year` from datetime objects.
5. **Initial run partial completion** — the script crashed mid-batch after 200 books. After fixing the datetime issue, re-running was idempotent and inserted the remaining 185 books.

---

## Resolutions

- All schema created via `supabase_apply_migration` (3 migrations for tables + 1 for storage bucket).
- Security advisors run: **0 lints/issues**.
- Import script made idempotent (checks existing publishers and books before inserting).
- The `year` column is `text` (not `integer`) to preserve the mixed formats in the Excel ("Bremen, 2011", "2010", etc.).

---

## Notes for Next Features

- **Feature 2 (Cover Fetcher):** The `cover_url` column is currently NULL for all books. The storage bucket `book-covers` is ready.
- **Feature 3 (Catalog View):** All 385 books are public-readable with `status = 'published'`. The catalog view can query `books` + join `publishers`.
- **Feature 5 (Publisher Portal):** The seed publishers have no `user_id`. When publishers register, they'll need to be linked to an auth user (admin workflow).
- The `publisher_name` column on `books` is denormalized for display; it preserves the original Excel publisher text even if the `publisher_id` link is later changed.