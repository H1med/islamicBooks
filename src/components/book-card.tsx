"use client";

import { ExternalLink, Building2 } from "lucide-react";
import Image from "next/image";
import type { Book } from "@/types/database";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-border bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-background">
        {book.cover_url ? (
          <Image
            src={book.cover_url}
            alt={book.title}
            fill
            className="h-full w-full object-cover"
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center">
            <span className="font-serif text-sm font-medium text-primary-text line-clamp-3">
              {book.title}
            </span>
            {book.author && (
              <span className="mt-2 text-xs text-secondary-text line-clamp-1">
                {book.author}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-serif text-[15px] font-medium leading-snug text-primary-text line-clamp-2">
          {book.title}
        </h3>
        {book.author && (
          <p className="mt-1 text-[13px] text-secondary-text line-clamp-1">
            {book.author}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-secondary-text">
          {book.publisher_name && (
            <>
              <Building2 className="h-3 w-3" strokeWidth={1.5} />
              <span className="truncate">{book.publisher_name}</span>
            </>
          )}
          {book.year && (
            <span className="ml-auto whitespace-nowrap">{book.year}</span>
          )}
        </div>

        {book.buy_url && (
          <a
            href={book.buy_url}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-xs font-medium text-primary-text transition-colors hover:bg-background"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            Zum Buch
          </a>
        )}
      </div>
    </div>
  );
}