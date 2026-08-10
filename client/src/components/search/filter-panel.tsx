"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/search/filter-sidebar";

export function FilterPanel({ defaultTypeId }: { defaultTypeId?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-xl border border-border bg-white p-4">
          <FilterSidebar defaultTypeId={defaultTypeId} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-navy">
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
      </div>
    </>
  );
}
