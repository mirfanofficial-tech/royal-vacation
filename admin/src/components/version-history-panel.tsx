"use client";

import { useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { History, RotateCcw } from "lucide-react";

import type { RevisionOut, RevisionSummaryOut } from "@royal-vacation/api-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export interface VersionHistoryField {
  key: string;
  label: string;
}

interface VersionHistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;
  revisions: RevisionSummaryOut[];
  isLoading: boolean;
  getRevisionDetail: (revisionId: string) => Promise<RevisionOut>;
  restoreRevision: (revisionId: string) => Promise<unknown>;
  isRestoring: boolean;
  currentFields: Record<string, unknown>;
  fields: VersionHistoryField[];
}

function previewValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const text = String(value);
  const stripped = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!stripped) return "—";
  return stripped.length > 240 ? `${stripped.slice(0, 240)}…` : stripped;
}

export function VersionHistoryPanel({
  open,
  onOpenChange,
  entityLabel,
  revisions,
  isLoading,
  getRevisionDetail,
  restoreRevision,
  isRestoring,
  currentFields,
  fields,
}: VersionHistoryPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<RevisionOut | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  async function toggleExpand(revisionId: string) {
    if (expandedId === revisionId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(revisionId);
    setDetail(null);
    setLoadingDetail(true);
    try {
      setDetail(await getRevisionDetail(revisionId));
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleRestore(revisionId: string) {
    if (!window.confirm(`Restore this ${entityLabel} to this version? The current version is saved first, so this isn't a one-way door.`)) {
      return;
    }
    await restoreRevision(revisionId);
    setExpandedId(null);
    setDetail(null);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="size-4" />
            Version history
          </SheetTitle>
          <SheetDescription>
            Every save creates a version. Restoring saves the current version first, so you can
            always undo a restore too.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading versions…</p>
          ) : revisions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No saved versions yet — versions are created each time you save.
            </p>
          ) : (
            revisions.map((revision, index) => {
              const isExpanded = expandedId === revision.id;
              return (
                <div key={revision.id} className="overflow-hidden rounded-lg border border-border">
                  <button
                    type="button"
                    onClick={() => toggleExpand(revision.id)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{revision.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNowStrict(new Date(revision.created_at), { addSuffix: true })} ·{" "}
                        {revision.created_by}
                      </p>
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className="shrink-0">
                        Most recent
                      </Badge>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 border-t border-border bg-muted/20 px-3 py-3">
                      {loadingDetail || !detail ? (
                        <p className="py-4 text-center text-xs text-muted-foreground">Loading…</p>
                      ) : (
                        <>
                          <div className="space-y-2.5">
                            {fields.map((field) => (
                              <div key={field.key} className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <p className="mb-0.5 font-medium text-muted-foreground">
                                    {field.label} — then
                                  </p>
                                  <p className="text-foreground">{previewValue(detail.snapshot[field.key])}</p>
                                </div>
                                <div>
                                  <p className="mb-0.5 font-medium text-muted-foreground">
                                    {field.label} — now
                                  </p>
                                  <p
                                    className={cn(
                                      "text-foreground",
                                      previewValue(detail.snapshot[field.key]) !==
                                        previewValue(currentFields[field.key]) && "font-medium text-navy"
                                    )}
                                  >
                                    {previewValue(currentFields[field.key])}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            disabled={isRestoring}
                            onClick={() => handleRestore(revision.id)}
                          >
                            <RotateCcw data-icon="inline-start" />
                            Restore this version
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
