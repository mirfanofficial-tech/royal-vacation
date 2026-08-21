"use client";

import { Skeleton } from "@/components/ui/skeleton";

function SectionHeading() {
  return (
    <div className="mb-5">
      <Skeleton className="h-7 w-64" />
    </div>
  );
}

function SmallCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-white p-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-1.5 p-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 overflow-hidden rounded-xl border border-border bg-white">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4 pt-0">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
        <Skeleton className="mt-2 h-4 w-1/3" />
      </div>
    </div>
  );
}

function DestinationCardSkeleton() {
  return <Skeleton className="aspect-[4/3] w-full rounded-xl" />;
}

function CarouselRowSkeleton({
  count,
  basis,
  card,
}: {
  count: number;
  basis: string;
  card: "small" | "property" | "destination";
}) {
  const Card =
    card === "property" ? PropertyCardSkeleton : card === "destination" ? DestinationCardSkeleton : SmallCardSkeleton;

  return (
    <div className="-mx-1 flex gap-4 overflow-hidden px-1">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`shrink-0 ${basis}`}>
          <Card />
        </div>
      ))}
    </div>
  );
}

function GeniusBannerSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-cream">
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 px-6 py-8 sm:px-10 sm:py-9">
          <Skeleton className="h-4 w-24 bg-gold/20" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-80" />
          <div className="flex flex-wrap gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-40 rounded-full" />
        </div>
        <div className="flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t border-navy/10 px-6 py-8 lg:w-64 lg:border-l lg:border-t-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-10 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </div>
  );
}

export function HomeLoadingSkeleton() {
  return (
    <>
      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 pt-8 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={6} basis="w-[47%] sm:w-[31%] lg:w-[15.5%]" card="small" />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={4} basis="w-[85%] sm:w-[47%] lg:w-[23.5%]" card="property" />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={4} basis="w-[85%] sm:w-[47%] lg:w-[23.5%]" card="property" />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={6} basis="w-[47%] sm:w-[31%] lg:w-[15.5%]" card="small" />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <GeniusBannerSkeleton />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={5} basis="w-[47%] sm:w-[31%] lg:w-[18.5%]" card="destination" />
      </section>

      <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
        <SectionHeading />
        <CarouselRowSkeleton count={4} basis="w-[85%] sm:w-[47%] lg:w-[23.5%]" card="property" />
      </section>

      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 sm:px-6 pb-10 lg:px-24">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        ))}
      </div>
    </>
  );
}
