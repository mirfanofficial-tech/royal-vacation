"use client";

import { useEffect, useState } from "react";
import { ImageIcon, MapPin, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function MapSkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-muted to-border">
        <span className="absolute left-[18%] top-[35%] h-3 w-3 rounded-full bg-white shadow" />
        <span className="absolute left-[62%] top-[20%] h-3 w-3 rounded-full bg-white shadow" />
        <span className="absolute left-[45%] top-[62%] h-3 w-3 rounded-full bg-white shadow" />
        <div className="absolute inset-x-0 bottom-1/2 flex translate-y-1/2 justify-center">
          <span className="flex items-center gap-1.5 rounded-full bg-navy-dark/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            <MapPin className="h-3.5 w-3.5" />
            Plotting map pins…
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterSkeletonPanel() {
  const groups = [3, 3, 3, 4];
  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-12" />
      </div>
      {groups.map((rows, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-32" />
          {Array.from({ length: rows }, (_, rowIndex) => (
            <div key={rowIndex} className="flex items-center justify-between gap-2 py-0.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-3 sm:flex-row sm:gap-5 sm:p-4">
      <div className="w-full shrink-0 sm:w-64">
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-gradient-to-br from-muted to-border">
          <ImageIcon className="h-6 w-6 text-white/70" />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          <Skeleton className="aspect-[4/3] rounded-md" />
          <Skeleton className="aspect-[4/3] rounded-md" />
          <Skeleton className="aspect-[4/3] rounded-md" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-52" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full max-w-sm" />
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <Skeleton className="h-3 w-28" />
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchLoadingSkeleton() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      setElapsed((performance.now() - start) / 1000);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="flex flex-col gap-5">
        <MapSkeletonCard />
        <FilterSkeletonPanel />
      </aside>

      <section className="flex flex-col gap-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg bg-navy/5 px-4 py-2.5 text-sm">
          <span className="flex items-center gap-2 text-foreground">
            <Search className="h-4 w-4 shrink-0 text-navy" />
            642 properties matched — loading the best 25 for page 1 · 118 shown on map
          </span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {elapsed.toFixed(1)}s
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }, (_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold" />
          </span>
          Loading more stays
        </div>
      </section>
    </div>
  );
}
