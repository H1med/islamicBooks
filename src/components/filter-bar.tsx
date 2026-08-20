"use client";

import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

export type StatusFilter = "all" | "published" | "in_progress";
export type SortOption = "title" | "author" | "year" | "newest";

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  publisherFilter: string;
  onPublisherChange: (value: string) => void;
  publishers: string[];
  yearFilter: string;
  onYearChange: (value: string) => void;
  years: string[];
  sortOption: SortOption;
  onSortChange: (value: SortOption) => void;
  resultCount: number;
}

const statusPills: { label: string; value: StatusFilter }[] = [
  { label: "Alle", value: "all" },
  { label: "Verfügbar", value: "published" },
  { label: "In Arbeit", value: "in_progress" },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Titel A–Z", value: "title" },
  { label: "Autor A–Z", value: "author" },
  { label: "Jahr", value: "year" },
  { label: "Neueste zuerst", value: "newest" },
];

export function FilterBar({
  statusFilter,
  onStatusChange,
  publisherFilter,
  onPublisherChange,
  publishers,
  yearFilter,
  onYearChange,
  years,
  sortOption,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {statusPills.map((pill) => (
              <button
                key={pill.value}
                onClick={() => onStatusChange(pill.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === pill.value
                    ? "bg-brand text-white"
                    : "bg-surface text-secondary-text border border-border hover:text-primary-text"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-secondary-text" strokeWidth={1.5} />
              <select
                value={publisherFilter}
                onChange={(e) => onPublisherChange(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-primary-text focus:border-brand focus:outline-none"
              >
                <option value="">Alle Verlage</option>
                {publishers.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={yearFilter}
              onChange={(e) => onYearChange(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-primary-text focus:border-brand focus:outline-none"
            >
              <option value="">Alle Jahre</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-secondary-text" strokeWidth={1.5} />
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-primary-text focus:border-brand focus:outline-none"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-secondary-text">
          {resultCount} {resultCount === 1 ? "Buch" : "Bücher"} gefunden
        </p>
      </div>
    </div>
  );
}