# Generate DESIGN.md as a file or provide exact text in markdown
design_md_content = """# DESIGN.md – Minimalist & Modern Book Directory

## 1. Design Philosophy & Aesthetic
- **Anti-AI Aesthetic:** Avoid heavy neon gradients, complex glassmorphism, floating blur orbs, and generic template tropes.
- **Editorial & Timeless:** Clean, typography-driven catalog layout inspired by high-end publisher archives, *Stripe Press*, and editorial digital libraries.
- **Content-First:** The book cover and crisp bibliographic metadata take center stage.
- **Strict Icon Rule:** **NO EMOJIS AS ICONS.** Use sharp, refined vector icons only (`lucide-react`, 1.5px stroke).

## 2. Color System (Muted & Warm Slate Palette)
- **Background / Canvas:** `#FBFBFA` (warm off-white / editorial canvas)
- **Surface / Card Background:** `#FFFFFF` (pure white for crisp contrast)
- **Primary Text:** `#1A1A1A` (deep charcoal, avoiding harsh `#000000`)
- **Secondary Text / Metadata:** `#666660` (neutral muted slate)
- **Borders & Dividers:** `#EAE9E5` (subtle hairline borders)
- **Brand / Primary Accent:** `#1C3B2B` (deep cypress / forest green – dignified, understated)
- **Status Badge – Published / Available:**
  - Background: `#EDF3EE`
  - Text: `#1C3B2B`
- **Status Badge – In Progress / Needs Support:**
  - Background: `#F5EFE6`
  - Text: `#7A5E28`

## 3. Typography
- **Headings & Display:**
  - Preferred: Serif (`Newsreader`, `Fraunces`, or `Instrument Serif`) for book titles and editorial headers.
  - Alternative: Geometrical Sans (`Geist`, `Inter`, `Plus Jakarta Sans`).
- **Body & Bibliographic Metadata:**
  - Clean Sans-Serif (`Geist Sans` or `Inter`) with tight letter-spacing (`tracking-tight`) for high readability across dense catalog listings.

## 4. Iconography
- **Library:** `lucide-react` (Stroke width: `1.5px`)
- **Mapping:**
  - Search: `Search`
  - Filters & Sorting: `SlidersHorizontal`, `ArrowUpDown`
  - External Store Link: `ExternalLink`
  - Publisher / Organization: `Building2`
  - Account / Profile: `User`
  - In Progress / Translation: `BookOpenCheck`, `Languages`
  - Support & Backing: `HandHeart`
  - Verification Badge: `BadgeCheck`

## 5. UI Architecture & Components

### A. Public View (User Catalog)
- **Header:**
  - Left: Minimalist logo / title text.
  - Center: Live instant search bar (`Search` icon, keyboard shortcut indicator `⌘K`).
  - Right: "Publisher Portal" login button (`variant="outline"`).
- **Filter Bar:**
  - Horizontal pill-style filter chips for status ("All", "Available", "In Progress").
  - Dropdowns for Publisher and Release Year.
- **Book Card (2:3 Aspect Ratio):**
  - Crisp border (`1px solid #EAE9E5`) and subtle lift on hover (`translate-y-[-2px]`).
  - Cover image container with standard vertical ratio (2:3).
  - Typographic fallback cover if image is unavailable (clean monochrome block with centered serif title & author).
  - Metadata block: Title (`font-serif font-medium text-[15px]`), Author (`text-[13px] text-neutral-500`), Publisher & Year (`text-[12px] text-neutral-400`).
  - Action: Direct CTA link "Buy Book" / "View Store" with `ExternalLink` icon.
- **Detail Sheet / Modal:**
  - Displays full data: Original Title, Translator, ISBN-13, Year, Publisher, Notes, and Buy Link.

### B. In-Progress & Community Support Section
- Filterable view showcasing upcoming translations or print projects.
- Progress bar (`0% - 100%`) showing current stage (*Translation*, *Proofreading*, *Typesetting*, *Print*).
- Highlight callout if publisher needs community support / sponsorship.

### C. Publisher & Admin Portal
- **Dashboard Layout:** Clean sidebar navigation + content area.
- **Books Table:** Status column, quick edit actions, cover preview thumbnail.
- **Submission Modal:** Streamlined multi-field form (Title, Original Title, Author, ISBN, Year, Store URL, Cover File Upload).
"""

with open("DESIGN.md", "w", encoding="utf-8") as f:
    f.write(design_md_content)
print("DESIGN.md created successfully")
