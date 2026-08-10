"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Coins,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  ToggleLeft,
  Trash2,
} from "lucide-react";

import type { CurrencyOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCurrencies } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { currencyPositions, decimalOptions, useSiteSettings } from "@/lib/site-settings";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const statusBadge = {
  active: "bg-rating/10 text-rating",
  inactive: "bg-muted text-muted-foreground",
} as const;

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function formatPreview(currency: string, position: "before" | "after", decimals: string) {
  const amount = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: Number(decimals),
    maximumFractionDigits: Number(decimals),
  }).format(1234567.89);
  return position === "before" ? `${currency} ${amount}` : `${amount} ${currency}`;
}

function CurrencyCatalog() {
  const {
    currencies,
    isLoading,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    isMutating,
  } = useCurrencies();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CurrencyOut | null>(null);
  const [code, setCode] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [rate, setRate] = useState("1");

  const filtered = useMemo(
    () =>
      currencies.filter((c) => {
        const matchesQuery = `${c.code} ${c.name}`.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || (statusFilter === "active") === c.is_active;
        return matchesQuery && matchesStatus;
      }),
    [currencies, query, statusFilter]
  );

  const active = currencies.filter((c) => c.is_active).length;

  const stats = [
    { label: "Total currencies", value: currencies.length, icon: Coins },
    { label: "Active", value: active, icon: BadgeCheck },
    { label: "Inactive", value: currencies.length - active, icon: ToggleLeft },
  ];

  function flash(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 5000);
  }

  function flashError(message: string) {
    setError(message);
    setNotice("");
  }

  function openAdd() {
    setEditing(null);
    setCode("");
    setSymbol("");
    setName("");
    setRate("1");
    setSheetOpen(true);
  }

  function openEdit(currency: CurrencyOut) {
    setEditing(currency);
    setCode(currency.code);
    setSymbol(currency.symbol);
    setName(currency.name);
    setRate(String(currency.rate_to_aed));
    setSheetOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateCurrency(editing.id, {
          symbol: symbol.trim() || undefined,
          name: name.trim() || undefined,
          rate_to_aed: Number(rate) || undefined,
        });
        flash(`${name || editing.name} updated.`);
      } else {
        await createCurrency({
          code: code.trim(),
          symbol: symbol.trim(),
          name: name.trim(),
          rate_to_aed: Number(rate) || 1,
        });
        flash(`${code.trim().toUpperCase()} added to the currency catalog.`);
      }
      setSheetOpen(false);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't save this currency."));
    }
  }

  async function handleToggleActive(currency: CurrencyOut) {
    try {
      await updateCurrency(currency.id, { is_active: !currency.is_active });
      flash(`${currency.name} is now ${currency.is_active ? "inactive" : "active"}.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't update this currency's status."));
    }
  }

  async function handleDelete(currency: CurrencyOut) {
    if (!window.confirm(`Delete "${currency.name}"? This cannot be undone.`)) return;
    try {
      await deleteCurrency(currency.id);
      flash(`${currency.name} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this currency."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Currency</h1>
          <p className="text-sm text-muted-foreground">
            Currencies bookings can be priced in, and how amounts are displayed.
          </p>
        </div>
        {can("settings", "create") && (
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            Add currency
          </Button>
        )}
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm break-words text-emerald-800">
          <BadgeCheck className="size-4 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>All currencies</CardTitle>
              <CardDescription>
                {filtered.length} of {currencies.length} currencies shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search currencies…"
                  aria-label="Search currencies"
                  className="h-8 w-56 pl-8"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Currency</th>
                  <th className="px-6 py-3 font-medium">Symbol</th>
                  <th className="px-6 py-3 font-medium">Rate to AED</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((currency) => (
                    <tr key={currency.id} className="hover:bg-muted/40">
                      <td className="max-w-md px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 font-mono text-xs font-semibold text-navy">
                            {currency.code}
                          </span>
                          <p className="truncate font-medium">{currency.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{currency.symbol}</td>
                      <td className="px-6 py-3 tabular-nums text-muted-foreground">
                        {currency.rate_to_aed}
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          className={cn(
                            "rounded-full",
                            currency.is_active ? statusBadge.active : statusBadge.inactive
                          )}
                        >
                          {currency.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Currency actions"
                            disabled={isMutating}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" alignOffset={-8}>
                            {can("settings", "edit") && (
                              <>
                                <DropdownMenuItem onClick={() => openEdit(currency)}>
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(currency)}>
                                  <ToggleLeft />
                                  {currency.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </>
                            )}
                            {can("settings", "delete") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(currency)}
                                >
                                  <Trash2 />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No currencies match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DisplayPreferences currencies={currencies} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Edit currency" : "Add currency"}</SheetTitle>
            <SheetDescription>
              {editing
                ? "Update this currency's display details and exchange rate."
                : "Add a new currency to the catalog."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={fieldLabel} htmlFor="currency-code">
                  Code
                </label>
                <Input
                  id="currency-code"
                  value={code}
                  maxLength={3}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="USD"
                  className="font-mono uppercase"
                  disabled={Boolean(editing)}
                />
                {editing && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Code can&apos;t be changed after creation.
                  </p>
                )}
              </div>
              <div>
                <label className={fieldLabel} htmlFor="currency-symbol">
                  Symbol
                </label>
                <Input
                  id="currency-symbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="$"
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="currency-name">
                Name
              </label>
              <Input
                id="currency-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="US Dollar"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="currency-rate">
                Rate to AED
              </label>
              <Input
                id="currency-rate"
                type="number"
                min={0}
                step="0.000001"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                How many AED one unit of this currency is worth.
              </p>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!code.trim() || !symbol.trim() || !name.trim() || isMutating}
            >
              {isMutating ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {editing ? "Save changes" : "Add currency"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DisplayPreferences({ currencies }: { currencies: CurrencyOut[] }) {
  const { settings, update } = useSiteSettings();
  const [saved, setSaved] = useState(false);
  const activeCurrencies = currencies.filter((c) => c.is_active);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-4 text-muted-foreground" />
              Display preferences
            </CardTitle>
            <CardDescription>
              Default currency and how amounts are formatted across the site.
            </CardDescription>
          </div>
          <Button size="sm" onClick={handleSave}>
            <Save data-icon="inline-start" />
            Save
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-w-md space-y-5">
        <div>
          <label className={fieldLabel} htmlFor="settings-currency">
            Default currency
          </label>
          <select
            id="settings-currency"
            value={settings.defaultCurrency}
            onChange={(e) => update({ defaultCurrency: e.target.value })}
            className={selectClass}
          >
            {activeCurrencies.length === 0 && (
              <option value={settings.defaultCurrency}>{settings.defaultCurrency}</option>
            )}
            {activeCurrencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} — {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel} htmlFor="settings-position">
            Currency position
          </label>
          <select
            id="settings-position"
            value={settings.currencyPosition}
            onChange={(e) => update({ currencyPosition: e.target.value as "before" | "after" })}
            className={selectClass}
          >
            {currencyPositions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={fieldLabel} htmlFor="settings-decimals">
            Decimal places
          </label>
          <select
            id="settings-decimals"
            value={settings.decimals}
            onChange={(e) => update({ decimals: e.target.value })}
            className={selectClass}
          >
            {decimalOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Preview</p>
          <p className="mt-1 text-lg font-semibold text-navy">
            {formatPreview(settings.defaultCurrency, settings.currencyPosition, settings.decimals)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CurrencySettingsPage() {
  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <CurrencyCatalog />
      </div>
    </PermissionGuard>
  );
}
