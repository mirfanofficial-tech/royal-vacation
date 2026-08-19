"use client";

import { useState } from "react";
import { Map, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/search/filter-sidebar";
import { SortSelect } from "@/components/search/sort-select";

export function FilterPanel({
  defaultTypeId,
  onOpenMap,
}: {
  defaultTypeId?: string;
  onOpenMap?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-white p-4">
          <FilterSidebar defaultTypeId={defaultTypeId} />
        </div>
      </aside>

      <div className="flex items-center gap-3 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-navy">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </SheetTrigger>
          <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>Filter Results</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4 pt-10">
              <FilterSidebar defaultTypeId={defaultTypeId} onApply={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        {onOpenMap && (
          <button
            type="button"
            onClick={onOpenMap}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-navy"
          >
            <Map className="h-4 w-4" />
            Map
          </button>
        )}

        <SortSelect triggerClassName="h-[38px] min-w-0 flex-1 rounded-lg border border-border bg-white px-3 text-sm [&_span]:truncate" />
      </div>
    </>
  );
}
