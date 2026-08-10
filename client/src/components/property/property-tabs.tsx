"use client";

import { useEffect, useState } from "react";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "rooms", label: "Rooms & Rates" },
  { id: "facilities", label: "Facilities" },
  { id: "reviews", label: "Reviews" },
  { id: "location", label: "Location" },
  { id: "policies", label: "Policies" },
];

// "location" lives in the sticky sidebar rather than the main content column, so its
// scroll position doesn't correlate with reading order — tracking it here causes it to
// steal the active state for an extended range while the sidebar stays pinned in view.
// It's still a clickable tab (jumps to the sidebar map), just not part of scroll-spy.
const scrollSpyIds = new Set(["overview", "rooms", "facilities", "reviews"]);

export function PropertyTabs() {
  const [activeId, setActiveId] = useState(tabs[0].id);

  useEffect(() => {
    const sections = tabs
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
    <div className="sticky top-16 z-40 border-b border-border bg-background">
      <nav className="scrollbar-none -mx-6 flex gap-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className={`shrink-0 whitespace-nowrap border-b-2 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-navy text-navy"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
