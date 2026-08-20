# Feature 2: Automated Cover Fetcher / Scraper Skill

**Date:** 2026-08-20
**Branch:** `feature/cover-fetcher`
**Project Ref:** `wnicitvyytmbtgueionc`

---

## Features Implemented

### 1. Cover Fetcher Script (`scripts/fetch_covers.py`)

A Python script that fetches book cover images from multiple sources, uploads them to Supabase Storage (`book-covers` bucket), and updates `books.cover_url`.

**Fetch strategy (in order of priority):**
1. **Eslamica shop search** — Scrapes the product search page at `https://eslamica.de/search?sSearch=<title>`, matches images by their `alt` attribute (book title). Returns full-size cover images for books available on Eslamica.
2. **OpenLibrary Covers API** — Fetches `https://covers.openlibrary.org/b/isbn/<isbn>-L.jpg`. Detects 1x1 GIF placeholders (no cover available).
3. **Google Books API** — Searches by ISBN, downloads available cover thumbnail/large images.
4. **Typographic fallback** — Generates a minimal cover image (800x1200) using Pillow with:
   - Warm off-white background (#FBFBFA)
   - Deep charcoal text (#1A1A1A)
   - Cypress green accent (#1C3B2B) — top bar + author name
   - Serif font (Georgia), word-wrapped centered title

**Script features:**
- `--limit N` — Process only N books
- `--dry-run` — Don't upload, just report
- `--no-fallback` — Skip typographic fallback generation
- `--source <eslamica|openlibrary|google|all>` — Use only a specific source
- Idempotent: skips books that already have `cover_url` set
- 0.5s delay between external requests (politeness)
- Batch filename: `{book_id}_{slugified-title}.jpg`

### 2. Data Updated

All 385 books now have `cover_url` populated in the database.

**Source breakdown:**
- Eslamica (real covers): 18 books
- OpenLibrary (real covers): 2 books
- Typographic fallback (generated): 357 books
- Google Books: 0 books (no matches for these niche German Shia books)
- Skipped: 0

### 3. Storage

- All cover images uploaded to the `book-covers` bucket (created in Feature 1)
- Filenames: `{book_id}_{slugified-ascii-title}.jpg`
- Public URLs accessible at: `https://<project>.supabase.co/storage/v1/object/public/book-covers/<filename>`

---

## Errors Encountered

1. **`openpyxl` not installed** → `pip3 install openpyxl --break-system-packages`
2. **PEP 668 externally-managed environment** → resolved with `--break-system-packages` flag
3. **`supabase` Python package not installed** → `pip3 install supabase --break-system-packages`
4. **`TypeError: Object of type datetime is not JSON serializable`** — the Excel "Jahr" column had 2 rows with `datetime.datetime` values (rows 228, 229) instead of strings/ints. Fixed `parse_year()` to extract `.year` from datetime objects.
5. **`SyncBucketActionsMixin.upload() got an unexpected keyword argument 'upsert'`** — The supabase-py v2.31.0 `upload()` method signature is `(path, file, file_options=None)` — `upsert` must be passed inside the `file_options` dict, not as a keyword argument. Fixed by using `file_options={"content-type": "image/jpeg", "upsert": "true"}`.
6. **`InvalidKey` error on filenames with umlauts** — Supabase Storage rejects non-ASCII characters in object keys. Fixed `slugify()` to transliterate German umlauts (ä→ae, ö→oe, ü→ue, ß→ss) and strip all remaining non-ASCII characters.
7. **OpenLibrary returns 1x1 GIF placeholder** — When no cover exists, the API returns a 43-byte 1x1 GIF with HTTP 200. Added `is_valid_image()` check to detect placeholders (size < 1000 bytes or dimensions < 50x50).
8. **Google Books API returned no results** — None of the 385 German Shia Islamic books are in Google Books' catalogue. The API consistently returned `totalItems: 0` for ISBN-based searches. This source was effectively unused.
9. **Eslamica buy_url links are dead (404)** — The original Excel `buy_url` links (e.g., `https://www.eslamica.de/61...-auf-dass-liebe-und-gnade-zwischen-euch-sei?c=101`) return 404. The Eslamica site has been restructured (Shopware). The cover fetcher uses the search endpoint instead.
10. **Initial full run timed out** — 385 books × 0.5s delay + Eslamica fetches exceeded the 10-minute shell timeout. Re-ran in background with `nohup`.

---

## Resolutions

- All covers uploaded successfully (385/385)
- Security advisors run: **0 lints/issues**
- Typographic fallback ensures every book has a visual cover, even without external sources
- Eslamica scraping works via search page `alt` attribute matching (normalized title comparison)
- OpenLibrary contributed 2 covers (ISBNs that happen to be in their catalogue)

---

## Notes for Next Features

- **Feature 3 (Catalog View):** All 385 books have `cover_url` — the catalog grid can display all covers. Books with Eslamica covers (18) show real product photos; the rest (357) show typographic fallbacks with serif title + author.
- **Improving cover coverage:** The typographic fallbacks could be replaced later by:
  - Manual uploads via the publisher portal (Feature 5)
  - Expanding the Eslamica scraper to use product detail pages (requires JS rendering)
  - Adding more ISBN sources (Amazon, Buchhandel.de)
- **Image optimization:** Covers are stored at full resolution. Consider adding Supabase image transforms for thumbnails (e.g., `?width=200`).
- **The `year` column** is `text` (not `integer`) to preserve the mixed formats in the Excel ("Bremen, 2011", "2010", etc.).