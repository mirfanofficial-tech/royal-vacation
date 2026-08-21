"use client";

import { Skeleton } from "@/components/ui/skeleton";

function BreadcrumbSkeleton() {
  return (
    <div className="flex items-center gap-1.5">
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-14" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

function TabsSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      <Skeleton className="hidden h-4 w-28 sm:block" />
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex flex-col items-start gap-2 sm:items-end">
        <Skeleton className="h-6 w-28" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 lg:h-[420px] lg:grid-cols-[1.3fr_1fr_0.9fr]">
      <Skeleton className="aspect-[4/3] w-full rounded-md lg:aspect-auto lg:h-full" />
      <div className="grid grid-cols-2 gap-2 lg:flex lg:h-full lg:flex-col">
        <Skeleton className="aspect-[4/3] w-full rounded-md lg:aspect-auto lg:flex-1" />
        <Skeleton className="aspect-[4/3] w-full rounded-md lg:aspect-auto lg:flex-1" />
      </div>
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-4 lg:h-full">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="mt-auto h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

function IconBoxRowSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:gap-4">
        <Skeleton className="aspect-[4/3] w-full shrink-0 rounded-md sm:w-28" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.1fr_1.6fr_140px]">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full rounded-lg lg:w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PropertyLoadingSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-24">
      <BreadcrumbSkeleton />

      <div className="mt-4">
        <SummarySkeleton />
      </div>

      <div className="mt-4">
        <GallerySkeleton />
      </div>

      <div className="mt-4">
        <TabsSkeleton />
      </div>

      <div className="mt-4">
        <Skeleton className="h-16 w-full rounded-xl" />
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-52" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="mt-2">
            <IconBoxRowSkeleton count={6} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-4">
          <Skeleton className="mb-3 h-5 w-40" />
          <div className="flex flex-wrap gap-6">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-32" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-52" />
          <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-40" />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-14 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>

        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-56" />
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[240px_1fr_1fr_180px]">
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
            <Skeleton className="hidden h-56 w-full rounded-xl lg:block" />
          </div>
        </div>

        <Skeleton className="h-[420px] w-full rounded-xl" />

        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-56" />
          <div className="-mx-1 flex gap-4 overflow-hidden px-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="w-[85%] shrink-0 sm:w-[47%] lg:w-[23.5%]">
                <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-white">
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="flex flex-col gap-2 p-4 pt-0">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                    <Skeleton className="mt-2 h-4 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
