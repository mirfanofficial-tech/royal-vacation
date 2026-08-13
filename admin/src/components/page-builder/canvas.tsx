"use client";

import { useState } from "react";
import { Copy, GripVertical, Trash2 } from "lucide-react";

import type { BuilderBlock, BuilderBlockType } from "@/lib/page-builder-types";
import { cn } from "@/lib/utils";
import { BlockPreview } from "./block-renderers";
import { BLOCK_DRAG_MIME } from "./block-palette";

const BLOCK_ID_MIME = "application/x-builder-block-id";

interface CanvasProps {
  blocks: BuilderBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onInsertBlock: (type: BuilderBlockType, index: number) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
}

function DropZone({
  index,
  onInsertBlock,
  onMoveBlock,
}: {
  index: number;
  onInsertBlock: (type: BuilderBlockType, index: number) => void;
  onMoveBlock: (fromIndex: number, toIndex: number) => void;
}) {
  const [active, setActive] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setActive(false);
        const blockType = e.dataTransfer.getData(BLOCK_DRAG_MIME) as BuilderBlockType | "";
        const blockId = e.dataTransfer.getData(BLOCK_ID_MIME);
        if (blockType) {
          onInsertBlock(blockType, index);
        } else if (blockId) {
          onMoveBlock(Number(blockId), index);
        }
      }}
      className={cn(
        "h-2 rounded-full transition-all",
        active ? "h-8 bg-navy/10 ring-2 ring-navy/30" : ""
      )}
    />
  );
}

export function Canvas({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onInsertBlock,
  onMoveBlock,
}: CanvasProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-2 p-6">
      <DropZone index={0} onInsertBlock={onInsertBlock} onMoveBlock={onMoveBlock} />
      {blocks.map((block, index) => (
        <div key={block.id}>
          <div
            onClick={() => onSelectBlock(block.id)}
            className={cn(
              "group relative rounded-xl transition-shadow",
              selectedBlockId === block.id
                ? "ring-2 ring-navy"
                : "ring-1 ring-transparent hover:ring-border"
            )}
          >
            <div
              className={cn(
                "absolute -top-3 left-3 z-10 flex items-center gap-1 rounded-lg border border-border bg-white px-1.5 py-1 text-xs font-medium text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100",
                selectedBlockId === block.id && "opacity-100"
              )}
            >
              <span
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(BLOCK_ID_MIME, String(index));
                  e.dataTransfer.effectAllowed = "move";
                }}
                className="cursor-grab p-0.5 active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripVertical className="size-3.5 text-muted-foreground" />
              </span>
              <span className="px-1">{block.label}</span>
              <button
                type="button"
                aria-label="Duplicate block"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicateBlock(block.id);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Copy className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="Delete block"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBlock(block.id);
                }}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <BlockPreview block={block} />
          </div>
          <DropZone index={index + 1} onInsertBlock={onInsertBlock} onMoveBlock={onMoveBlock} />
        </div>
      ))}
      {blocks.length === 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const blockType = e.dataTransfer.getData(BLOCK_DRAG_MIME) as BuilderBlockType | "";
            if (blockType) onInsertBlock(blockType, 0);
          }}
          className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground"
        >
          + Drop a block here
        </div>
      )}
    </div>
  );
}
