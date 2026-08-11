"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Building2, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import type { PropertyTypeOut } from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { usePropertyTypes } from "@/lib/property-types";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
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

function PropertyTypesCatalog() {
  const { propertyTypes, isLoading, updatePropertyType, deletePropertyType, isMutating } =
    usePropertyTypes();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      [...propertyTypes]
        .sort((a, b) => a.sort_order - b.sort_order)
        .filter((t) => t.name.toLowerCase().includes(query.toLowerCase())),
    [propertyTypes, query]
  );

  async function handleToggleActive(propertyType: PropertyTypeOut) {
    try {
      await updatePropertyType(propertyType.id, { is_active: !propertyType.is_active });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this property type's status."));
    }
  }

  async function handleDelete(propertyType: PropertyTypeOut) {
    if (!window.confirm(`Delete "${propertyType.name}"? This cannot be undone.`)) return;
    try {
      await deletePropertyType(propertyType.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this property type."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
          <Building2 className="size-6" />
          Property Types
        </h1>
        {can("stays", "create") && (
          <Button render={<Link href="/stays/property-types/add" />}>
            <Plus data-icon="inline-start" />
            Add Property Type
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
              <p className="text-sm text-muted-foreground">Total: {propertyTypes.length} records</p>
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
                  <th className="px-6 py-3 font-medium">Image</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Slug</th>
                  <th className="px-6 py-3 font-medium">Sort</th>
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
                  filtered.map((propertyType) => (
                    <tr key={propertyType.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                          {propertyType.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveAssetUrl(propertyType.image_url)}
                              alt={propertyType.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Building2 className="size-4 text-muted-foreground" />
                          )}
                        </span>
                      </td>
                      <td className="max-w-md px-6 py-3">
                        <p className="truncate font-medium">{propertyType.name}</p>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                        {propertyType.slug}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{propertyType.sort_order}</td>
                      <td className="px-6 py-3">
                        <StatusToggle
                          checked={propertyType.is_active}
                          onChange={() => handleToggleActive(propertyType)}
                          disabled={isMutating || !can("stays", "edit")}
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {can("stays", "edit") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Edit"
                              render={<Link href={`/stays/property-types/${propertyType.id}`} />}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can("stays", "delete") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Delete"
                              disabled={isMutating}
                              onClick={() => handleDelete(propertyType)}
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
    </>
  );
}

export default function PropertyTypesPage() {
  return (
    <PermissionGuard module="stays">
      <div className="space-y-6 p-6 lg:p-8">
        <PropertyTypesCatalog />
      </div>
    </PermissionGuard>
  );
}
