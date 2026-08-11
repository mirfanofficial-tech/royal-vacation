"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Building2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Settings,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";

import type { StaySettingOut, StaySettingType } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { staySettingTypes, useStaySettings } from "@/lib/stays";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const typeIcons: Record<StaySettingType, typeof Sparkles> = {
  stay_amenity: Sparkles,
  room_type: BedDouble,
  room_amenity: Wifi,
  accommodation: Building2,
  board: UtensilsCrossed,
};

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

function StaysConfigCatalog() {
  const [activeType, setActiveType] = useState<StaySettingType>(staySettingTypes[0].value);
  const { settings, isLoading, updateSetting, deleteSetting, isMutating } =
    useStaySettings(activeType);
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      settings.filter((s) => {
        const matchesQuery = s.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || (statusFilter === "active") === s.is_active;
        return matchesQuery && matchesStatus;
      }),
    [settings, query, statusFilter]
  );

  async function handleToggleActive(setting: StaySettingOut) {
    try {
      await updateSetting(setting.id, { is_active: !setting.is_active });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this setting's status."));
    }
  }

  async function handleDelete(setting: StaySettingOut) {
    if (!window.confirm(`Delete "${setting.name}"? This cannot be undone.`)) return;
    try {
      await deleteSetting(setting.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this setting."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
          <Settings className="size-6" />
          Settings Management
        </h1>
        {can("stays", "create") && (
          <Button render={<Link href="/stays/config/add" />}>
            <Plus data-icon="inline-start" />
            Add New Setting
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <Card className="p-1.5">
        <div className="flex flex-wrap gap-1">
          {staySettingTypes.map((t) => {
            const Icon = typeIcons[t.value];
            const isActive = t.value === activeType;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setActiveType(t.value)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-b-2 border-navy text-navy"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">Records</p>
              <p className="text-sm text-muted-foreground">Total: {settings.length} records</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Filter by status"
              >
                <option value="all">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((setting, index) => (
                    <tr key={setting.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 text-muted-foreground">{index + 1}</td>
                      <td className="px-6 py-3">
                        <StatusToggle
                          checked={setting.is_active}
                          onChange={() => handleToggleActive(setting)}
                          disabled={isMutating || !can("stays", "edit")}
                        />
                      </td>
                      <td className="max-w-md px-6 py-3">
                        <p className="truncate font-medium">{setting.name}</p>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {can("stays", "edit") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Edit"
                              render={<Link href={`/stays/config/${setting.id}`} />}
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
                              onClick={() => handleDelete(setting)}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
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

export default function StaysConfigPage() {
  return (
    <PermissionGuard module="stays">
      <div className="space-y-6 p-6 lg:p-8">
        <StaysConfigCatalog />
      </div>
    </PermissionGuard>
  );
}
