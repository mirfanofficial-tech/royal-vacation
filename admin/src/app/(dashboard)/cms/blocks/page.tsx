"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Layers, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import type { CmsBlockOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCmsBlocks } from "@/lib/cms";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function StatusToggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Deactivate" : "Activate"}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50",
        checked ? "bg-navy" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function CmsBlocksCatalog() {
  const { blocks, isLoading, updateBlock, deleteBlock, isMutating } = useCmsBlocks();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () => blocks.filter((b) => b.name.toLowerCase().includes(query.toLowerCase())),
    [blocks, query]
  );

  async function handleToggleActive(block: CmsBlockOut) {
    try {
      await updateBlock(block.id, { is_active: !block.is_active });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this block's status."));
    }
  }

  async function handleDelete(block: CmsBlockOut) {
    if (!window.confirm(`Delete "${block.name}"? This cannot be undone.`)) return;
    try {
      await deleteBlock(block.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this block."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
            <Layers className="size-6" />
            Blocks
          </h1>
          <p className="text-sm text-muted-foreground">
            Reusable content snippets you can reference by slug.
          </p>
        </div>
        {can("cms", "create") && (
          <Button render={<Link href="/cms/blocks/new" />}>
            <Plus data-icon="inline-start" />
            New block
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">Records</p>
              <p className="text-sm text-muted-foreground">Total: {blocks.length} records</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search records…"
                aria-label="Search records"
                className="h-9 w-56 pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Location</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((block) => (
                    <tr key={block.id} className="hover:bg-muted/40">
                      <td className="max-w-md px-6 py-3">
                        <p className="truncate font-medium">{block.name}</p>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {block.slug}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="secondary">{block.block_type}</Badge>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{block.location ?? "—"}</td>
                      <td className="px-6 py-3">
                        <StatusToggle
                          checked={block.is_active}
                          onChange={() => handleToggleActive(block)}
                          disabled={isMutating || !can("cms", "edit")}
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {can("cms", "edit") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Edit"
                              render={<Link href={`/cms/blocks/${block.id}`} />}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can("cms", "delete") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Delete"
                              disabled={isMutating}
                              onClick={() => handleDelete(block)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No records match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CmsBlocksPage() {
  return (
    <PermissionGuard module="cms">
      <CmsBlocksCatalog />
    </PermissionGuard>
  );
}
