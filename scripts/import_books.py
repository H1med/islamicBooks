#!/usr/bin/env python3
"""
Import Shia Islamic books from the Excel database into Supabase.

Usage:
  python3 scripts/import_books.py

Requirements:
  pip3 install openpyxl supabase --break-system-packages

Environment:
  SUPABASE_URL       - Project URL (e.g. https://<ref>.supabase.co)
  SUPABASE_SERVICE_KEY - service_role key (kept server-side only; never exposed to client)

This script is idempotent: re-running it will not create duplicate publishers
or books. Publishers are matched by name; books are matched by (title, publisher_name).
"""

import os
import sys
import re
import datetime
import openpyxl
from supabase import create_client, Client

EXCEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "Bücherliste - schiitische Bücher in deutscher Sprache_15-11-2022.xlsx",
)

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
    print("  export SUPABASE_URL='https://<ref>.supabase.co'")
    print("  export SUPABASE_SERVICE_KEY='your-service-role-key'")
    sys.exit(1)


def clean(value):
    """Trim whitespace and normalize None to empty string handling."""
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        return stripped if stripped else None
    return value


def parse_year(raw):
    """Extract a readable year/origin string. The Excel 'Jahr' column mixes
    pure years (int) and location+year strings like 'Bremen, 2011'.
    We keep the original text for display fidelity."""
    if raw is None:
        return None
    if isinstance(raw, datetime.datetime):
        return str(raw.year)
    if isinstance(raw, int):
        return str(raw)
    return clean(raw)


def normalize_publisher_name(name: str) -> str:
    """Light normalization for publisher matching (dedup by name)."""
    n = name.strip().lower()
    n = re.sub(r"\s+", " ", n)
    n = n.replace("e.\u202fv.", "e.v.")  # narrow no-break space -> normal
    n = n.replace("e. v.", "e.v.")
    return n


def main():
    print(f"Loading Excel: {EXCEL_PATH}")
    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
    ws = wb["veröffentlicht"]

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    # 1) Collect unique publishers and insert them (idempotent)
    # We use the service_role key, which bypasses RLS for the seed import.
    publishers_map: dict[str, int] = {}  # name -> id
    existing_publishers = supabase.table("publishers").select("id,name").execute()
    for p in existing_publishers.data:
        publishers_map[p["name"]] = p["id"]
    print(f"Existing publishers in DB: {len(publishers_map)}")

    seen_pub_names = set()
    rows = list(ws.iter_rows(min_row=3, values_only=True))
    for row in rows:
        if not row or row[1] is None:
            continue
        pub_name = clean(row[3])
        if not pub_name:
            pub_name = "Unbekannt"
        norm = normalize_publisher_name(pub_name)
        if norm in seen_pub_names:
            continue
        seen_pub_names.add(norm)
        if pub_name in publishers_map:
            continue
        # Insert new publisher (no user_id — these are seed/import publishers)
        resp = supabase.table("publishers").insert({
            "name": pub_name,
            "verified": False,
        }).execute()
        if resp.data:
            publishers_map[pub_name] = resp.data[0]["id"]

    print(f"Total publishers after import: {len(publishers_map)}")

    # 2) Insert books (idempotent by title + publisher_name)
    existing_books = supabase.table("books").select("id,title,publisher_name").execute()
    existing_keys = {(b["title"], b.get("publisher_name")) for b in existing_books.data}
    print(f"Existing books in DB: {len(existing_keys)}")

    books_to_insert = []
    skipped = 0
    for row in rows:
        if not row or row[1] is None:
            continue
        title = clean(row[1])
        if not title:
            continue
        author = clean(row[2])
        pub_name = clean(row[3]) or "Unbekannt"
        isbn = clean(row[4])
        year = parse_year(row[5])
        buy_url = clean(row[6])
        notes = clean(row[7])
        original_title = clean(row[8])

        key = (title, pub_name)
        if key in existing_keys:
            skipped += 1
            continue

        pub_id = publishers_map.get(pub_name)
        # If exact name not found, try normalized match against inserted publishers
        if pub_id is None:
            for pn, pid in publishers_map.items():
                if normalize_publisher_name(pn) == normalize_publisher_name(pub_name):
                    pub_id = pid
                    break

        books_to_insert.append({
            "title": title,
            "author": author,
            "publisher_id": pub_id,
            "publisher_name": pub_name,
            "isbn": isbn,
            "year": year,
            "buy_url": buy_url,
            "original_title": original_title,
            "notes": notes,
            "status": "published",
        })

    print(f"Books to insert: {len(books_to_insert)} (skipped {skipped} duplicates)")

    # Batch insert in chunks of 100
    BATCH = 100
    inserted = 0
    for i in range(0, len(books_to_insert), BATCH):
        chunk = books_to_insert[i:i + BATCH]
        resp = supabase.table("books").insert(chunk).execute()
        inserted += len(resp.data)
        print(f"  Inserted {inserted}/{len(books_to_insert)}...")

    print(f"\nDone. Inserted {inserted} books across {len(publishers_map)} publishers.")


if __name__ == "__main__":
    main()