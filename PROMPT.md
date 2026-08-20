# PROMPT.md – Master System & AI Instructions

Act as a Senior Full-Stack Engineer and UI/UX Architect. You are building the MVP for a modern, clean web directory for Shia Islamic books in the German language based on the provided Excel database and project specs.

This document serves as the master `PROMPT.md` for AI-assisted development.

---

## 🚨 MANDATORY AI EXECUTION RULES

### 1. Step-by-Step Feature Development
- **DO NOT** attempt to build the entire platform in one single run.
- The user will instruct you to work on a specific feature (e.g., `"work on feature 1"`).
- Work **ONLY** on the requested feature and its associated scope.

### 2. Pre-Execution Memory Reading
- Before starting **ANY** work, read all files in the `/memory` directory to understand previous progress, schema decisions, and current project context.

### 3. Pre-Execution Clarification & Questions
- Before starting a feature, inspect requirements and edge cases.
- If there are open questions or missing specs, ask the user before writing code.

### 4. Supabase Backend & RLS (via Supabase MCP)
- Use **Supabase MCP** to create tables, migrations, foreign keys, and RLS policies.
- **RLS Best Practices:**
  - Public can `SELECT` published books and active in-progress projects.
  - Publishers can `INSERT`, `UPDATE`, `DELETE` only records where `publisher_id = auth.uid()`.
  - Admins (superusers) have full access to approve publishers and moderate entries.
- Cover Images must be stored in Supabase Storage (`bucket: book-covers`).

### 5. UI Design Compliance
- Adhere strictly to `@DESIGN.md`.
- **NO EMOJIS** for icons. Use `lucide-react`.
- Clean, editorial aesthetic with muted tones.

---

## 🏗️ Tech Stack & Architecture

- **Framework:** Next.js (App Router) / React / TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React (`lucide-react`)
- **Backend & Auth:** Supabase (Auth, Postgres, Storage via Supabase MCP)
- **Data Import:** Python / Node script for parsing the Excel file and bulk inserting to Supabase

---

## 📑 FEATURE BREAKDOWN (Modular Execution Roadmap)

---

### 🟢 Feature 1: Database Schema, RLS & Excel Migration
- **Supabase Tables:**
  - `publishers` (id, user_id, name, website, verified, created_at)
  - `books` (id, title, author, publisher_id, publisher_name, isbn, year, buy_url, cover_url, original_title, notes, status, created_at)
  - `in_progress_projects` (id, publisher_id, title, author, stage, progress_percent, needs_support, support_description, contact_url, created_at)
- **RLS Policies:** Public read, publisher-restricted write.
- **Migration Script:** Parse `Bücherliste - schiitische Bücher in deutscher Sprache_15-11-2022.xlsx` and seed the initial books into Supabase.

---

### 🟢 Feature 2: Automated Cover Fetcher / Scraper Skill
- Implement a worker/script that reads the `buy_url` or `isbn` from imported books.
- Scrapes the cover image from shop pages (e.g., *Eslamica*) or fetches via OpenLibrary/Google Books API.
- Uploads images to Supabase Storage and updates `cover_url`.
- Minimalist typographic fallback for missing covers.

---

### 🟢 Feature 3: Public Catalog View (Benutzer-Ansicht)
- **Header & Navigation:** Clean branding, search bar, publisher login button.
- **Filter & Search Bar:** Real-time search across Title, Author, ISBN, Publisher, and Original Title.
- **Grid Display:** Responsive Book Grid (2–5 columns) showing 2:3 aspect ratio book cards.
- **Book Card Details:** Cover image, Title, Author, Publisher badge, Publication Year, and `"Zum Buch / Kaufen"` direct link button.
- **Detail Modal / Drawer:** Clicking a card displays full bibliographic metadata (Original title, notes, ISBN).

---

### 🟢 Feature 4: "In Arbeit & Förderung" Section (Community & Projects)
- Subtab or dedicated section on the homepage: *"Bücher in Vorbereitung / Übersetzung"*.
- Cards displaying books currently being translated or printed by registered publishers.
- Clear badges: *"Übersetzung"*, *"Lektorat"*, *"Unterstützung gesucht"*.
- Direct link to support the project or contact the publisher.

---

### 🟢 Feature 5: Publisher & Admin Portal (Verlag-Ansicht)
- **Auth:** Email/Password Magic Link login for verified publishers and admins.
- **Publisher Dashboard:**
  - Overview of all published books by this publisher.
  - "Buch hinzufügen" Form (Title, Author, ISBN, Year, Shop-Link, Cover-Upload).
  - "Projekt in Arbeit hinzufügen" Form (Status, Bedarf an Unterstützung, Beschreibung).
- **Admin Management:**
  - Admin can invite/create publisher accounts and assign publisher credentials.
