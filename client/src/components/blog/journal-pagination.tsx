import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

function buildPageList(current: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, 2, totalPages - 1, totalPages, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (prev && page - prev > 1) result.push("ellipsis");
    result.push(page);
    prev = page;
  }
  return result;
}

export function JournalPagination({
  currentPage,
  pageSize,
  totalItems,
  visibleCount,
  buildHref,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  visibleCount: number;
  buildHref: (page: number) => string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageList = buildPageList(currentPage, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
      <p className="text-sm text-muted-foreground">
        Showing {visibleCount} of {totalItems} article{totalItems === 1 ? "" : "s"}
      </p>

      <div className="flex items-center gap-1.5">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="flex items-center gap-1 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-navy hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-3.5 py-1.5 text-sm font-medium text-muted-foreground opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        <div className="hidden items-center gap-1 sm:flex">
          {pageList.map((page, i) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Link
                key={page}
                href={buildHref(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {page}
              </Link>
            )
          )}
        </div>

        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="flex items-center gap-1 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-navy hover:bg-muted"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-3.5 py-1.5 text-sm font-medium text-muted-foreground opacity-50">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
