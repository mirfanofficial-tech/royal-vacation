"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, BadgeCheck, CalendarClock, Loader2, Save, Tag } from "lucide-react";

import type { PromoCodeOut, PromoCodeUpdate } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { usePromoCodes } from "@/lib/promo-codes";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function toLocalInputValue(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoValue(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

export default function PromoCodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { promoCodes, isLoading, error, updatePromoCode } = usePromoCodes();
  const { can } = usePermissions();
  const promoCode = promoCodes.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-destructive">
            {errorMessage(error, "Failed to load promo code.")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!promoCode) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Promo code not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PermissionGuard module="payments">
      <PromoCodeDetailView
        key={promoCode.id}
        promoCode={promoCode}
        updatePromoCode={updatePromoCode}
        canEdit={can("payments", "edit")}
      />
    </PermissionGuard>
  );
}

function PromoCodeDetailView({
  promoCode,
  updatePromoCode,
  canEdit,
}: {
  promoCode: PromoCodeOut;
  updatePromoCode: (id: string, body: PromoCodeUpdate) => Promise<PromoCodeOut>;
  canEdit: boolean;
}) {
  const [code, setCode] = useState(promoCode.code);
  const [description, setDescription] = useState(promoCode.description ?? "");
  const [discountPercent, setDiscountPercent] = useState(
    String(promoCode.discount_percent)
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    promoCode.max_discount_amount != null ? String(promoCode.max_discount_amount) : ""
  );
  const [maxDiscountCurrency, setMaxDiscountCurrency] = useState(
    promoCode.max_discount_currency ?? ""
  );
  const [minSpendAmount, setMinSpendAmount] = useState(
    promoCode.min_spend_amount != null ? String(promoCode.min_spend_amount) : ""
  );
  const [minSpendCurrency, setMinSpendCurrency] = useState(
    promoCode.min_spend_currency ?? ""
  );
  const [maxUses, setMaxUses] = useState(
    promoCode.max_uses != null ? String(promoCode.max_uses) : ""
  );
  const [startsAt, setStartsAt] = useState(toLocalInputValue(promoCode.starts_at));
  const [expiresAt, setExpiresAt] = useState(toLocalInputValue(promoCode.expires_at));
  const [isActive, setIsActive] = useState(promoCode.is_active);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      await updatePromoCode(promoCode.id, {
        code: code.trim(),
        description: description.trim(),
        discount_percent: Number(discountPercent) || 0,
        max_discount_amount: maxDiscountAmount.trim()
          ? Number(maxDiscountAmount)
          : undefined,
        max_discount_currency: maxDiscountCurrency.trim() || undefined,
        min_spend_amount: minSpendAmount.trim() ? Number(minSpendAmount) : undefined,
        min_spend_currency: minSpendCurrency.trim() || undefined,
        max_uses: maxUses.trim() ? Number(maxUses) : undefined,
        starts_at: toIsoValue(startsAt),
        expires_at: toIsoValue(expiresAt),
        is_active: isActive,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save promo code."));
    } finally {
      setSaving(false);
    }
  }

  const validPercent = Number(discountPercent) >= 0;
  const validRanges = !(
    (maxDiscountAmount.trim() !== "") !== (maxDiscountCurrency.trim() !== "")
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/payments/promo-codes" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Promo Codes
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-navy">{promoCode.code}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {promoCode.used_count} use{promoCode.used_count === 1 ? "" : "s"}
              {promoCode.max_uses != null ? ` of ${promoCode.max_uses} max` : ""} so far
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!code.trim() || !validPercent || !validRanges || saving || !canEdit}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Update Promo Code
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {saveError}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive promo codes are not accepted at checkout.
            </p>
          </div>
          <select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            disabled={!canEdit}
            className="h-8 w-32 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="size-4 text-muted-foreground" />
            Promo Code Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="pc-code">
              Code
            </label>
            <Input
              id="pc-code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
              }
              disabled={!canEdit}
              className="font-mono uppercase"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pc-discount">
              Discount percent (%)
            </label>
            <Input
              id="pc-discount"
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              disabled={!canEdit}
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pc-max-amount">
              Max discount amount (optional)
            </label>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <Input
                id="pc-max-amount"
                type="number"
                min="0"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                disabled={!canEdit}
                placeholder="e.g. 10000"
              />
              <Input
                value={maxDiscountCurrency}
                onChange={(e) =>
                  setMaxDiscountCurrency(e.target.value.toUpperCase())
                }
                disabled={!canEdit}
                placeholder="AED"
                className="font-mono uppercase"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="pc-min-spend">
              Minimum booking spend (optional)
            </label>
            <div className="grid grid-cols-[1fr_6rem] gap-2">
              <Input
                id="pc-min-spend"
                type="number"
                min="0"
                value={minSpendAmount}
                onChange={(e) => setMinSpendAmount(e.target.value)}
                disabled={!canEdit}
                placeholder="e.g. 500"
              />
              <Input
                value={minSpendCurrency}
                onChange={(e) =>
                  setMinSpendCurrency(e.target.value.toUpperCase())
                }
                disabled={!canEdit}
                placeholder="AED"
                className="font-mono uppercase"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Booking total must reach this value (converted to the booking&apos;s
              currency) before the code applies.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="pc-description">
              Description
            </label>
            <Input
              id="pc-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!canEdit}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pc-max-uses">
              Max uses
            </label>
            <Input
              id="pc-max-uses"
              type="number"
              min="1"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              disabled={!canEdit}
              placeholder="Blank = unlimited"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Used so far
            </label>
            <Input
              value={String(promoCode.used_count)}
              disabled
              className="bg-muted/40"
            />
          </div>
          <div className="sm:col-span-2">
            <CardTitle className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarClock className="size-4" />
              Validity window (optional)
            </CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={fieldLabel} htmlFor="pc-starts">
                  Starts at
                </label>
                <Input
                  id="pc-starts"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="pc-expires">
                  Expires at
                </label>
                <Input
                  id="pc-expires"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={!canEdit}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {!canEdit && (
        <p className="text-xs text-muted-foreground">
          You don&apos;t have permission to edit promo codes.
        </p>
      )}
    </div>
  );
}
