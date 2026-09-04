"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";

import type { PromoCodeOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { usePromoCodes } from "@/lib/promo-codes";
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

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PromoCodesCatalog() {
  const { promoCodes, isLoading, updatePromoCode, deletePromoCode, isMutating } =
    usePromoCodes();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      [...promoCodes].filter((p) =>
        `${p.code} ${p.description ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [promoCodes, query]
  );

  async function handleToggleActive(promoCode: PromoCodeOut) {
    try {
      await updatePromoCode(promoCode.id, { is_active: !promoCode.is_active });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this promo code's status."));
    }
  }

  async function handleDelete(promoCode: PromoCodeOut) {
    if (!window.confirm(`Delete promo code "${promoCode.code}"? This cannot be undone.`)) return;
    try {
      await deletePromoCode(promoCode.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this promo code."));
    }
  }

  const now = Date.now();
  const isWithinWindow = (p: PromoCodeOut) => {
    if (p.starts_at && new Date(p.starts_at).getTime() > now) return false;
    if (p.expires_at && new Date(p.expires_at).getTime() < now) return false;
    return true;
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
          <Tag className="size-6" />
          Promo Codes
        </h1>
        {can("payments", "create") && (
          <Button render={<Link href="/payments/promo-codes/add" />}>
            <Plus data-icon="inline-start" />
            Add Promo Code
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
              <p className="text-sm text-muted-foreground">Total: {promoCodes.length} records</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search promo codes…"
                aria-label="Search promo codes"
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
                  <th className="px-6 py-3 font-medium">Code</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Discount</th>
                  <th className="px-6 py-3 font-medium">Usage</th>
                  <th className="px-6 py-3 font-medium">Valid</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((promo) => (
                    <tr key={promo.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-1 font-mono text-xs font-semibold text-navy">
                          <Tag className="size-3 text-muted-foreground" />
                          {promo.code}
                        </span>
                      </td>
                      <td className="max-w-sm px-6 py-3">
                        <p className="truncate text-muted-foreground">
                          {promo.description || "—"}
                        </p>
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {promo.discount_percent}%{promo.max_discount_amount != null
                          ? ` (max ${promo.max_discount_amount.toLocaleString()} ${promo.max_discount_currency ?? ""})`
                          : ""}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {promo.used_count}
                        {promo.max_uses != null ? ` / ${promo.max_uses}` : ""}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {isWithinWindow(promo) ? (
                          <span>
                            {formatDate(promo.starts_at)} – {formatDate(promo.expires_at)}
                          </span>
                        ) : (
                          <span className="text-destructive">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <StatusToggle
                          checked={promo.is_active}
                          onChange={() => handleToggleActive(promo)}
                          disabled={isMutating || !can("payments", "edit")}
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {can("payments", "edit") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Edit"
                              render={<Link href={`/payments/promo-codes/${promo.id}`} />}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can("payments", "delete") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Delete"
                              disabled={isMutating}
                              onClick={() => handleDelete(promo)}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No promo codes match your filters.
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

export default function PromoCodesPage() {
  return (
    <PermissionGuard module="payments">
      <div className="space-y-6 p-6 lg:p-8">
        <PromoCodesCatalog />
      </div>
    </PermissionGuard>
  );
}
