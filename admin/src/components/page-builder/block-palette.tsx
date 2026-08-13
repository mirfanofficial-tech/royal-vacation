"use client";

import {
  AlignLeft,
  Columns2,
  Heading1,
  ImagePlus,
  LayoutGrid,
  MapPin,
  Megaphone,
  MoveVertical,
  PanelTop,
  Quote,
  Search,
  Star,
  Type,
  Video,
} from "lucide-react";

import type { BuilderBlockType } from "@/lib/page-builder-types";
import { cn } from "@/lib/utils";

export const BLOCK_DRAG_MIME = "application/x-builder-block-type";

interface PaletteEntry {
  type: BuilderBlockType | null;
  label: string;
  icon: typeof PanelTop;
}

const groups: { title: string; entries: PaletteEntry[] }[] = [
  {
    title: "Layout",
    entries: [
      { type: "hero-banner", label: "Hero banner", icon: PanelTop },
      { type: null, label: "Section header", icon: Heading1 },
      { type: "two-column", label: "Two column split", icon: Columns2 },
      { type: null, label: "Spacer", icon: MoveVertical },
    ],
  },
  {
    title: "Content",
    entries: [
      { type: "rich-text", label: "Rich text", icon: Type },
      { type: "image", label: "Image", icon: ImagePlus },
      { type: null, label: "Video embed", icon: Video },
      { type: null, label: "Quote", icon: Quote },
      { type: null, label: "Accordion / FAQ", icon: AlignLeft },
    ],
  },
  {
    title: "Travel",
    entries: [
      { type: "property-grid", label: "Property grid", icon: LayoutGrid },
      { type: null, label: "Destination carousel", icon: MapPin },
      { type: null, label: "Search widget", icon: Search },
      { type: null, label: "Review slider", icon: Star },
      { type: null, label: "Offer strip", icon: Megaphone },
    ],
  },
];

export function BlockPalette({ onAddBlock }: { onAddBlock: (type: BuilderBlockType) => void }) {
  return (
    <div className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-border bg-white">
      <div className="border-b border-border p-4">
        <p className="text-sm font-semibold text-foreground">Add blocks</p>
        <p className="text-xs text-muted-foreground">Drag a block onto the canvas</p>
      </div>
      <div className="space-y-5 p-3">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-1.5 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.entries.map((entry) => {
                const Icon = entry.icon;
                const enabled = entry.type !== null;
                return (
                  <div
                    key={entry.label}
                    draggable={enabled}
                    onDragStart={(e) => {
                      if (!entry.type) return;
                      e.dataTransfer.setData(BLOCK_DRAG_MIME, entry.type);
                      e.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => entry.type && onAddBlock(entry.type)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border border-transparent px-2 py-2 text-sm transition-colors",
                      enabled
                        ? "cursor-grab text-foreground hover:border-border hover:bg-muted/60 active:cursor-grabbing"
                        : "cursor-not-allowed text-muted-foreground/60"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{entry.label}</span>
                    {!enabled && (
                      <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
