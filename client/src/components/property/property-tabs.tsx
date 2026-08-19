"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const baseTabs = [
  { id: "overview", label: "Overview" },
  { id: "availability", label: "Rooms & Rates" },
  { id: "facilities", label: "Facilities" },
  { id: "reviews", label: "Guest reviews" },
  { id: "location", label: "Location" },
  { id: "policies", label: "Policies" },
];

// "location" is the mini-map embedded near the top of the gallery, so its scroll
// position doesn't correlate with reading order — tracking it here causes it to
// steal the active state for an extended range while it sits near the top of the page.
// It's still a clickable tab (jumps to the map), just not part of scroll-spy.
const scrollSpyIds = new Set(["overview", "availability", "facilities", "reviews"]);

export function PropertyTabs({ reviewCount }: { reviewCount?: number }) {
  const tabs = baseTabs.map((tab) =>
    tab.id === "reviews" && reviewCount
      ? { ...tab, label: `Guest reviews (${reviewCount.toLocaleString()})` }
      : tab
  );
  const [activeId, setActiveId] = useState(tabs[0].id);

  useEffect(() => {
    const sections = baseTabs
      .filter((tab) => scrollSpyIds.has(tab.id))
      .map((tab) => document.getElementById(tab.id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-140px 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-16 z-40 flex items-center justify-between gap-4 border-b border-border bg-background px-4 py-2">
      <nav className="scrollbar-none -mx-6 flex gap-1.5 overflow-x-auto px-6 lg:mx-0 lg:px-0">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-navy"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-emerald-600 sm:flex">
        <ShieldCheck className="h-3.5 w-3.5" />
        We Price Match
      </span>
    </div>
  );
}
