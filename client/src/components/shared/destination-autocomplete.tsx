"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, MapPin } from "lucide-react";
import { useHotelsQuery } from "@/lib/hotels";
import { searchDestinations, type DestinationSuggestion } from "@/lib/destination-search";
import { cn } from "@/lib/utils";

const DROPDOWN_MAX_WIDTH = 384; // 24rem, desktop cap
const DROPDOWN_MAX_HEIGHT = "min(22rem, 60vh)";
const VIEWPORT_MARGIN = 16;
const MOBILE_BREAKPOINT = 640; // Tailwind `sm`

type Coords = { top: number; left: number; width: number };

export function DestinationAutocomplete({
  value,
  onChange,
  onSelect,
  inputRef,
  inputClassName,
  placeholder = "Search for destination, property or city",
}: {
  value: string;
  onChange: (value: string) => void;
  /** Fired in addition to onChange when a suggestion is picked (click or Enter). */
  onSelect?: (suggestion: DestinationSuggestion) => void;
  inputRef?: React.Ref<HTMLInputElement>;
  inputClassName?: string;
  placeholder?: string;
}) {
  const { data: hotels = [] } = useHotelsQuery();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const suggestions = useMemo(() => searchDestinations(hotels, value), [hotels, value]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, open]);

  useEffect(() => {
    if (activeIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listboxId]);

  // Positioned via a portal to <body> (see reviews-modal.tsx for the same
  // pattern) so the dropdown isn't confined to a ScrollReveal ancestor's
  // stacking context — those set will-change/translate, which pins any
  // absolutely-positioned descendant's z-index under later sibling sections
  // regardless of the z-index value itself.
  useEffect(() => {
    if (!open) return;

    function reposition() {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      const width = isMobile
        ? rect.width
        : Math.min(DROPDOWN_MAX_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
      const left = isMobile
        ? rect.left
        : Math.min(rect.left, window.innerWidth - width - VIEWPORT_MARGIN);
      setCoords({ top: rect.bottom + 8, left, width });
    }

    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function pick(suggestion: DestinationSuggestion) {
    onChange(suggestion.label);
    onSelect?.(suggestion);
    setOpen(false);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (event.key === "ArrowDown") setOpen(true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        event.preventDefault();
        pick(suggestions[activeIndex]);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
        className={inputClassName}
      />

      {open &&
        coords &&
        suggestions.length > 0 &&
        createPortal(
          <div
            ref={dropdownRef}
            id={listboxId}
            role="listbox"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              maxHeight: DROPDOWN_MAX_HEIGHT,
            }}
            className="z-50 overflow-y-auto overscroll-contain rounded-xl border border-border bg-white py-1.5 shadow-xl"
          >
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.type}-${suggestion.label}-${index}`}>
                {(index === 0 || suggestions[index - 1].type !== suggestion.type) && (
                  <div className="px-3.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:pt-1.5">
                    {!value.trim()
                      ? "Popular searches"
                      : suggestion.type === "city"
                        ? "Destinations"
                        : "Properties"}
                  </div>
                )}
                <button
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors",
                    index === activeIndex ? "bg-muted" : "hover:bg-muted/60"
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
                    {suggestion.type === "city" ? (
                      <MapPin className="h-4 w-4" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {suggestion.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {suggestion.type === "city" ? suggestion.subtitle : `Hotel in ${suggestion.subtitle}`}
                    </span>
                  </span>
                </button>
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
