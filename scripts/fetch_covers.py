#!/usr/bin/env python3
"""
Automated Cover Fetcher for Shia Islamic Books Directory.

Fetches book cover images from multiple sources and uploads them to
Supabase Storage (bucket: book-covers), then updates books.cover_url.

Fetch strategy (in order of priority):
  1. Eslamica shop search — scrape the product search page for cover images
     matched by book title alt-attribute. Works for the majority of books in
     the catalog since many originate from Eslamica.
  2. OpenLibrary Covers API — by ISBN. Only returns real covers for books that
     exist in OpenLibrary's catalogue; a 1x1 GIF placeholder means "no cover".
  3. Google Books API — search by isbn/title, download the thumbnail/cover.
  4. Typographic fallback — generate a minimal cover image with the book title
     and author on a neutral background using Pillow.

Usage:
  python3 scripts/fetch_covers.py [--limit N] [--no-fallback] [--dry-run]

Requirements:
  pip3 install openpyxl supabase requests pillow --break-system-packages

Environment:
  SUPABASE_URL         - Project URL
  SUPABASE_SERVICE_KEY  - service_role key (server-side only)
"""

import argparse
import hashlib
import io
import os
import re
import sys
import time
from html import unescape
from urllib.parse import quote

import requests
from PIL import Image, ImageDraw, ImageFont

from supabase import create_client, Client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

BUCKET = "book-covers"
ESLAMICA_SEARCH_URL = "https://eslamica.de/search?sSearch={query}"
OPENLIB_COVER_URL = "https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg"
GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
REQUEST_TIMEOUT = 15
DELAY_BETWEEN_REQUESTS = 0.5  # be polite to external servers

# 1x1 GIF returned by OpenLibrary when no cover exists
OPENLIB_PLACEHOLDER_SIZE = 43


# ---------------------------------------------------------------------------
# Fetching cover images from different sources
# ---------------------------------------------------------------------------

def fetch_from_eslamica(title: str, author: str | None = None) -> bytes | None:
    """Search Eslamica for the book title and return the first matching cover."""
    query = quote(title.strip().lower())
    url = ESLAMICA_SEARCH_URL.format(query=query)
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
    except requests.RequestException:
        return None

    html = resp.text
    # Images on the search page have alt attributes = book titles
    pattern = r'<img[^>]*src="(https://eslamica\.de/media/[^"]+)"[^>]*alt="([^"]*)"'
    matches = re.findall(pattern, html)

    title_clean = normalize_title(title)
    for img_url, alt_text in matches:
        alt_clean = normalize_title(unescape(alt_text))
        if titles_match(title_clean, alt_clean):
            # Fetch the full-size image (not the thumbnail srcset)
            img_url = img_url.split("?")[0]  # strip cache-bust query
            try:
                img_resp = requests.get(img_url, timeout=REQUEST_TIMEOUT)
                img_resp.raise_for_status()
                if is_valid_image(img_resp.content):
                    return img_resp.content
            except requests.RequestException:
                continue
    return None


def fetch_from_openlibrary(isbn: str) -> bytes | None:
    """Fetch cover from OpenLibrary Covers API by ISBN."""
    if not isbn:
        return None
    clean_isbn = isbn.replace("-", "").replace(" ", "")
    url = OPENLIB_COVER_URL.format(isbn=clean_isbn)
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        content = resp.content
        # OpenLibrary returns a 1x1 GIF placeholder when no cover exists
        if len(content) <= OPENLIB_PLACEHOLDER_SIZE:
            return None
        if not is_valid_image(content):
            return None
        return content
    except requests.RequestException:
        return None


def fetch_from_google_books(isbn: str, title: str) -> bytes | None:
    """Fetch cover from Google Books API."""
    if not isbn:
        return None
    clean_isbn = isbn.replace("-", "").replace(" ", "")
    url = GOOGLE_BOOKS_URL.format(isbn=clean_isbn)
    try:
        resp = requests.get(url, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        if data.get("totalItems", 0) == 0:
            return None
        vol_info = data["items"][0].get("volumeInfo", {})
        image_links = vol_info.get("imageLinks", {})
        # Try largest available size
        for key in ("extraLarge", "large", "medium", "thumbnail", "smallThumbnail"):
            if key in image_links:
                img_url = image_links[key].replace("http://", "https://")
                try:
                    img_resp = requests.get(img_url, timeout=REQUEST_TIMEOUT)
                    img_resp.raise_for_status()
                    if is_valid_image(img_resp.content):
                        return img_resp.content
                except requests.RequestException:
                    continue
    except (requests.RequestException, KeyError, ValueError):
        pass
    return None


def generate_typographic_fallback(title: str, author: str | None) -> bytes:
    """Generate a minimal typographic cover image (serif title + author)."""
    width, height = 800, 1200
    bg_color = (251, 251, 250)  # #FBFBFA
    text_color = (26, 26, 26)  # #1A1A1A
    accent_color = (28, 59, 43)  # #1C3B2B

    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Try to load a serif font; fall back to default
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Georgia.ttf", 52)
        author_font = ImageFont.truetype("/System/Library/Fonts/Georgia.ttf", 36)
    except (OSError, IOError):
        title_font = ImageFont.load_default()
        author_font = ImageFont.load_default()

    # Draw accent line at top
    draw.rectangle([(0, 0), (width, 8)], fill=accent_color)

    # Draw title (word-wrapped, centered)
    wrapped_title = wrap_text(title, max_chars=24)
    title_lines = wrapped_title.split("\n")
    total_h = sum(draw.textbbox((0, 0), line, font=title_font)[3] for line in title_lines)
    y = (height - total_h) // 2 - 50
    for line in title_lines:
        bbox = draw.textbbox((0, 0), line, font=title_font)
        w = bbox[2] - bbox[0]
        x = (width - w) // 2
        draw.text((x, y), line, fill=text_color, font=title_font)
        y += bbox[3] - bbox[1] + 10

    # Draw author at bottom
    if author:
        bbox = draw.textbbox((0, 0), author, font=author_font)
        w = bbox[2] - bbox[0]
        x = (width - w) // 2
        y = height - 100
        draw.text((x, y), author, fill=accent_color, font=author_font)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def normalize_title(t: str) -> str:
    """Normalize a title for comparison: lowercase, strip punctuation/whitespace."""
    t = t.lower().strip()
    t = re.sub(r"[^\w\s]", "", t, flags=re.UNICODE)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def titles_match(a: str, b: str) -> bool:
    """Check if two normalized titles match (equal or one contains the other)."""
    if not a or not b:
        return False
    if a == b:
        return True
    # One contains the other (handles trailing/leading differences)
    if a in b or b in a:
        return True
    # First 30 chars match for long titles
    if len(a) > 20 and len(b) > 20 and a[:30] == b[:30]:
        return True
    return False


def is_valid_image(data: bytes) -> bool:
    """Check if the data is a valid image (not a 1x1 placeholder)."""
    if not data or len(data) < 1000:
        return False
    try:
        img = Image.open(io.BytesIO(data))
        w, h = img.size
        if w < 50 or h < 50:
            return False
        return True
    except Exception:
        return False


def wrap_text(text: str, max_chars: int = 24) -> str:
    """Word-wrap text to fit within max_chars per line."""
    words = text.split()
    lines = []
    current = ""
    for word in words:
        if len(current) + len(word) + 1 <= max_chars:
            current = (current + " " + word).strip()
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return "\n".join(lines)


def slugify(text: str) -> str:
    """Create a URL-safe ASCII filename from text."""
    # Transliterate common German umlauts
    replacements = {
        "ä": "ae", "ö": "oe", "ü": "ue", "Ä": "Ae", "Ö": "Oe", "Ü": "Ue",
        "ß": "ss", "’": "", "'": "", """: "", """: "",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Remove any remaining non-ASCII
    text = text.encode("ascii", "ignore").decode("ascii")
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s[:80] or "book"


# ---------------------------------------------------------------------------
# Main orchestration
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Fetch and upload book covers.")
    parser.add_argument("--limit", type=int, default=None, help="Max books to process")
    parser.add_argument("--no-fallback", action="store_true", help="Skip typographic fallback")
    parser.add_argument("--dry-run", action="store_true", help="Don't upload to Supabase")
    parser.add_argument("--source", choices=["eslamica", "openlibrary", "google", "all"], default="all")
    args = parser.parse_args()

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.")
        sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # Fetch books without covers
    query = supabase.table("books").select("id,title,author,isbn,buy_url,cover_url").is_("cover_url", "null")
    if args.limit:
        query = query.limit(args.limit)
    resp = query.execute()
    books = resp.data
    print(f"Books to process: {len(books)}")

    stats = {"eslamica": 0, "openlibrary": 0, "google": 0, "fallback": 0, "skipped": 0}

    for i, book in enumerate(books, 1):
        title = book["title"]
        author = book.get("author")
        isbn = book.get("isbn")
        book_id = book["id"]
        print(f"\n[{i}/{len(books)}] {title} (id={book_id})")

        cover_data = None
        source = None

        # 1. Eslamica
        if args.source in ("eslamica", "all") and not cover_data:
            cover_data = fetch_from_eslamica(title, author)
            if cover_data:
                source = "eslamica"

        time.sleep(DELAY_BETWEEN_REQUESTS)

        # 2. OpenLibrary
        if args.source in ("openlibrary", "all") and not cover_data and isbn:
            cover_data = fetch_from_openlibrary(isbn)
            if cover_data:
                source = "openlibrary"

        # 3. Google Books
        if args.source in ("google", "all") and not cover_data and isbn:
            cover_data = fetch_from_google_books(isbn, title)
            if cover_data:
                source = "google"

        # 4. Typographic fallback
        if not cover_data and not args.no_fallback:
            cover_data = generate_typographic_fallback(title, author)
            source = "fallback"

        if not cover_data:
            print("  -> No cover found, skipping")
            stats["skipped"] += 1
            continue

        if args.dry_run:
            print(f"  -> Would upload ({source}, {len(cover_data)} bytes)")
            stats[source] = stats.get(source, 0) + 1
            continue

        # Upload to Supabase Storage
        filename = f"{book_id}_{slugify(title)}.jpg"
        file_options = {"content-type": "image/jpeg", "upsert": "true"}
        try:
            supabase.storage.from_(BUCKET).upload(filename, cover_data, file_options)
        except Exception as e:
            # If file exists, use update instead
            if "already" in str(e).lower() or "409" in str(e):
                supabase.storage.from_(BUCKET).update(
                    filename, cover_data, {"content-type": "image/jpeg"}
                )
            else:
                print(f"  -> Upload error: {e}")
                stats["skipped"] += 1
                continue

        # Get public URL
        public_url_resp = supabase.storage.from_(BUCKET).get_public_url(filename)

        # Update book.cover_url
        supabase.table("books").update({"cover_url": public_url_resp}).eq("id", book_id).execute()

        print(f"  -> Uploaded ({source}, {len(cover_data)} bytes)")
        stats[source] = stats.get(source, 0) + 1

    print(f"\n{'='*50}")
    print(f"Done. Stats: {stats}")


if __name__ == "__main__":
    main()