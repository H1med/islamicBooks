"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-xl font-medium tracking-tight text-primary-text">
            Schiitische Bücher
          </span>
        </Link>

        <div className="relative flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-text"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Titel, Autor, ISBN, Verlag suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-16 text-sm text-primary-text placeholder:text-secondary-text focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-secondary-text">
            ⌘K
          </kbd>
        </div>

        <Link
          href="/login"
          className="hidden items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary-text transition-colors hover:bg-surface sm:flex"
        >
          <User className="h-4 w-4" strokeWidth={1.5} />
          Verlag Portal
        </Link>
      </div>
    </header>
  );
}