"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Loader2,
  Percent,
  Save,
  Tag,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { usePromoCodes } from "@/lib/promo-codes";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function normalizeCode(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function toIsoValue(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function AddPromoCodePage() {
  const router = useRouter();
  const { createPromoCode } = usePromoCodes();

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [maxDiscountCurrency, setMaxDiscountCurrency] = useState("");
  const [minSpendAmount, setMinSpendAmount] = useState("");
  const [minSpendCurrency, setMinSpendCurrency] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const created = await createPromoCode({
        code: code.trim(),
        description: description.trim() || undefined,
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
      router.push(`/payments/promo-codes/${created.id}`);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to add promo code."));
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
            <h1 className="text-2xl font-semibold text-navy">Add Promo Code</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a discount code guests can apply at checkout.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!code.trim() || !validPercent || !validRanges || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Save Promo Code
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
              onChange={(e) => setCode(normalizeCode(e.target.value))}
              placeholder="e.g. ROYAL10"
              className="font-mono uppercase"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Guests enter this at checkout. Letters &amp; numbers only.
            </p>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pc-discount">
              Discount percent (%)
            </label>
            <div className="relative">
              <Percent className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="pc-discount"
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="e.g. 10"
                className="pl-8"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Percentage off the room + extras subtotal. Works in any currency.
            </p>
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
                placeholder="e.g. 10000"
              />
              <Input
                value={maxDiscountCurrency}
                onChange={(e) =>
                  setMaxDiscountCurrency(e.target.value.toUpperCase())
                }
                placeholder="AED"
                className="font-mono uppercase"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Absolute upper bound on the discount. Leave blank for no cap.
            </p>
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
                placeholder="e.g. 500"
              />
              <Input
                value={minSpendCurrency}
                onChange={(e) => setMinSpendCurrency(e.target.value.toUpperCase())}
                placeholder="AED"
                className="font-mono uppercase"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The booking total must reach this value before the code applies.
              Amounts are converted to the booking&apos;s currency automatically.
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
              placeholder="Optional description shown to admins"
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
              placeholder="e.g. 100 (blank = unlimited)"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Active
            </label>
            <select
              value={isActive ? "active" : "inactive"}
              onChange={(e) => setIsActive(e.target.value === "active")}
              className="h-9 w-40 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PromoCodesAddPage() {
  return (
    <PermissionGuard module="payments">
      <AddPromoCodePage />
    </PermissionGuard>
  );
}
