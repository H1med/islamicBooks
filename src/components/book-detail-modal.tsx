"use client";

import { useEffect } from "react";
import { X, ExternalLink, Building2, Calendar, Hash, FileText } from "lucide-react";
import Image from "next/image";
import type { Book } from "@/types/database";

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  useEffect(() => {
    if (book) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleEsc);
      };
    }
  }, [book, onClose]);

  if (!book) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-surface/80 p-2 text-secondary-text transition-colors hover:bg-background hover:text-primary-text"
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <div className="flex flex-col sm:flex-row">
          <div className="flex-shrink-0 sm:w-48">
            <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none">
              {book.cover_url ? (
                <Image
                  src={book.cover_url}
                  alt={book.title}
                  fill
                  className="h-full w-full object-cover"
                  sizes="192px"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-background p-4 text-center">
                  <span className="font-serif text-sm font-medium text-primary-text line-clamp-4">
                    {book.title}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-6">
            <h2 className="font-serif text-2xl font-medium leading-tight text-primary-text">
              {book.title}
            </h2>

            {book.original_title && (
              <p className="mt-1 text-sm italic text-secondary-text">
                Originaltitel: {book.original_title}
              </p>
            )}

            {book.author && (
              <p className="mt-3 text-base text-secondary-text">{book.author}</p>
            )}

            <div className="mt-6 space-y-3">
              {book.publisher_name && (
                <div className="flex items-start gap-2 text-sm">
                  <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-text" strokeWidth={1.5} />
                  <span className="text-secondary-text">Verlag:</span>
                  <span className="text-primary-text">{book.publisher_name}</span>
                </div>
              )}

              {book.year && (
                <div className="flex items-start gap-2 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-text" strokeWidth={1.5} />
                  <span className="text-secondary-text">Jahr:</span>
                  <span className="text-primary-text">{book.year}</span>
                </div>
              )}

              {book.isbn && (
                <div className="flex items-start gap-2 text-sm">
                  <Hash className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-text" strokeWidth={1.5} />
                  <span className="text-secondary-text">ISBN:</span>
                  <span className="text-primary-text">{book.isbn}</span>
                </div>
              )}

              {book.notes && (
                <div className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary-text" strokeWidth={1.5} />
                  <span className="text-secondary-text">Anmerkungen:</span>
                  <span className="text-primary-text">{book.notes}</span>
                </div>
              )}
            </div>

            {book.buy_url && (
              <a
                href={book.buy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
                Zum Buch / Kaufen
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}