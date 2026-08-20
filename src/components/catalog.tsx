"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "./header";
import { FilterBar, type StatusFilter, type SortOption } from "./filter-bar";
import { BookGrid } from "./book-grid";
import { BookDetailModal } from "./book-detail-modal";
import type { Book } from "@/types/database";

interface CatalogProps {
  initialBooks: Book[];
  publishers: string[];
  years: string[];
}

export function Catalog({ initialBooks, publishers, years }: CatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("title");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>("input[type='text']")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredBooks = useMemo(() => {
    let result = [...initialBooks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((b) => {
        const fields = [
          b.title,
          b.author,
          b.isbn,
          b.publisher_name,
          b.original_title,
        ].filter(Boolean) as string[];
        return fields.some((f) => f.toLowerCase().includes(q));
      });
    }

    if (statusFilter === "published") {
      result = result.filter((b) => b.status === "published");
    }

    if (publisherFilter) {
      result = result.filter((b) => b.publisher_name === publisherFilter);
    }

    if (yearFilter) {
      result = result.filter((b) => b.year === yearFilter);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "title":
          return a.title.localeCompare(b.title, "de");
        case "author":
          return (a.author || "").localeCompare(b.author || "", "de");
        case "year":
          return (b.year || "").localeCompare(a.year || "");
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [initialBooks, searchQuery, statusFilter, publisherFilter, yearFilter, sortOption]);

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        publisherFilter={publisherFilter}
        onPublisherChange={setPublisherFilter}
        publishers={publishers}
        yearFilter={yearFilter}
        onYearChange={setYearFilter}
        years={years}
        sortOption={sortOption}
        onSortChange={setSortOption}
        resultCount={filteredBooks.length}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BookGrid books={filteredBooks} onSelectBook={setSelectedBook} />
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-secondary-text">
        Schiitische Bücher in deutscher Sprache — Verzeichnis
      </footer>

      <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />
    </div>
  );
}