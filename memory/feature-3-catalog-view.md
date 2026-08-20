# Feature 3: Public Catalog View (Benutzer-Ansicht)

**Date:** 2026-08-20
**Branch:** `feature/catalog-view`
**Project Ref:** `wnicitvyytmbtgueionc`

---

## Features Implemented

### 1. Next.js App Scaffold
- **Framework:** Next.js 16.3.1 (App Router), TypeScript, Tailwind CSS v4
- **Structure:** `src/app/` (App Router), `src/components/`, `src/lib/`, `src/types/`
- **Packages:** `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`
- **Env:** `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Design System (globals.css)
Implemented the color palette and typography from DESIGN.md as Tailwind v4 `@theme` tokens:
- Background: `#FBFBFA` (warm off-white canvas)
- Surface: `#FFFFFF` (card backgrounds)
- Primary Text: `#1A1A1A` (deep charcoal)
- Secondary Text: `#666660` (muted slate)
- Border: `#EAE9E5` (hairline borders)
- Brand: `#1C3B2B` (deep cypress green)
- Badge published: `#EDF3EE` / `#1C3B2B`
- Badge progress: `#F5EFE6` / `#7A5E28`
- Fonts: Newsreader (serif) for titles, Inter (sans) for body — loaded from Google Fonts

### 3. Components Built

**Header (`src/components/header.tsx`)**
- Sticky header with blur backdrop
- Left: Serif logo text "Schiitische Bücher"
- Center: Live search bar with `Search` icon + `⌘K` keyboard shortcut indicator
- Right: "Verlag Portal" login button (outline variant, `User` icon)

**FilterBar (`src/components/filter-bar.tsx`)**
- Status pill filters: "Alle", "Verfügbar", "In Arbeit"
- Publisher dropdown (populated from DB)
- Year dropdown (populated from DB)
- Sort dropdown: Titel A–Z, Autor A–Z, Jahr, Neueste zuerst
- Result count display

**BookCard (`src/components/book-card.tsx`)**
- 2:3 aspect ratio cover image (using `next/image` with `fill`)
- Typographic fallback for missing covers (serif title block)
- Metadata: title (serif 15px), author (13px), publisher + year (12px)
- "Zum Buch" CTA button with `ExternalLink` icon (opens `buy_url` in new tab)
- Subtle hover lift (`translate-y-[-2px]`) + shadow

**BookGrid (`src/components/book-grid.tsx`)**
- Responsive grid: 2 cols (mobile) → 3 (sm) → 4 (lg) → 5 (xl)
- Empty state with "Keine Bücher gefunden" message

**BookDetailModal (`src/components/book-detail-modal.tsx`)**
- Centered modal with backdrop blur
- Left: cover image (2:3 ratio)
- Right: full bibliographic metadata — title, original title, author, publisher (`Building2`), year (`Calendar`), ISBN (`Hash`), notes (`FileText`)
- "Zum Buch / Kaufen" CTA button (brand color)
- ESC key + backdrop click to close
- Body scroll lock when open

**Catalog (`src/components/catalog.tsx`)**
- Client orchestrator: manages search, filters, sort, and modal state
- Real-time client-side search across title, author, ISBN, publisher_name, original_title
- `⌘K` / `Ctrl+K` keyboard shortcut to focus search
- Result count updates dynamically

### 4. Data Flow
- **Page (Server Component):** Fetches all published books via Supabase SSR client, extracts unique publishers and years for filter dropdowns
- **Catalog (Client Component):** Receives initial data as props, performs client-side filtering/sorting/search (instant, no network round-trips)

### 5. Images
- `next/image` used for all cover images (optimized, lazy-loaded)
- `next.config.ts` configured to allow images from Supabase Storage domain
- Responsive `sizes` attribute for proper image loading

---

## Errors Encountered

1. **`create-next-app` refused to scaffold in non-empty directory** → Scaffolded in `/tmp/nextapp` and copied files into the project manually.
2. **`<img>` ESLint warnings** → Switched to `next/image` with `fill` layout, configured `remotePatterns` in `next.config.ts`.
3. **`<a>` ESLint error (no-html-link-for-pages)** → Replaced with `next/link` `<Link>` components.
4. **JSX closing tag mismatch** after replacing `<a>` with `<Link>` → Fixed closing tag from `</a>` to `</Link>`.

---

## Resolutions

- Build passes: `npm run build` ✓
- Lint passes: `npm run lint` ✓ (0 errors, 0 warnings)
- Dev server verified: HTTP 200 on `localhost:3000` with book content rendering
- All 385 published books load from Supabase with covers

---

## Notes for Next Features

- **Feature 4 (In Arbeit & Förderung):** The "In Arbeit" filter pill is wired but currently shows no books (no `in_progress_projects` data yet). Feature 4 will populate this and potentially merge the view.
- **Feature 5 (Publisher Portal):** The `/login` link in the header is a placeholder. Feature 5 will implement the actual auth flow and dashboard.
- **Search performance:** Currently client-side filtering of 385 books (instant). For larger catalogs, consider server-side search with Supabase full-text search or Postgres `ilike`.
- **The typographic fallback** in BookCard (when `cover_url` is null) is a CSS-only solution; all 385 books currently have covers so this is just a safety net.