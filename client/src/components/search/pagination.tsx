"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ totalPages }: { totalPages: number }) {
  const [page, setPage] = useState(1);

  const pages = [1, 2, 3, 4, 5];

  return (
    <nav
      aria-label="Search results pages"
      className="flex items-center justify-center gap-1.5"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPage(p)}
          className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
            page === p ? "bg-navy text-white" : "text-foreground hover:bg-muted"
          }`}
        >
          {p}
        </button>
      ))}

      <span className="px-1 text-sm text-muted-foreground">...</span>

      <button
        type="button"
        onClick={() => setPage(totalPages)}
        className={`flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${
          page === totalPages ? "bg-navy text-white" : "text-foreground hover:bg-muted"
        }`}
      >
        {totalPages}
      </button>

      <button
        type="button"
        aria-label="Next page"
        disabled={page === totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
