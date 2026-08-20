"use client";

import { BookCard } from "./book-card";
import type { Book } from "@/types/database";

interface BookGridProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export function BookGrid({ books, onSelectBook }: BookGridProps) {
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-serif text-lg text-primary-text">Keine Bücher gefunden</p>
        <p className="mt-2 text-sm text-secondary-text">
          Versuchen Sie andere Suchbegriffe oder Filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onClick={() => onSelectBook(book)} />
      ))}
    </div>
  );
}