"use client";

import { useMemo, useState } from "react";
import {
  Globe2,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  Building2,
} from "lucide-react";

import {
  useCountries,
} from "@/lib/settings-countries";
import type {
  SettingCountry,
  SettingCountryStatus,
} from "@/lib/mock-data";
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

const statusVariant: Record<
  SettingCountryStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  paused: "outline",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function CountriesSettingsPage() {
  const { countries, addCountry, updateCountry, deleteCountry, toggleStatus } =
    useCountries();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | SettingCountryStatus>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [currency, setCurrency] = useState("");
  const [countryStatus, setCountryStatus] =
    useState<SettingCountryStatus>("active");
  const [properties, setProperties] = useState("0");

  const filtered = useMemo(
    () =>
      countries.filter((country) => {
        const matchesQuery =
          country.name.toLowerCase().includes(query.toLowerCase()) ||
          country.code.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          status === "all" || country.status === status;
        return matchesQuery && matchesStatus;
      }),
    [countries, query, status]
  );

  const activeCount = countries.filter((c) => c.status === "active").length;
  const pausedCount = countries.length - activeCount;
  const totalProperties = countries.reduce(
    (sum, country) => sum + country.properties,
    0
  );

  const stats = [
    { label: "Total countries", value: countries.length, icon: Globe2 },
    { label: "Active", value: activeCount, icon: MapPin },
    { label: "Paused", value: pausedCount, icon: Globe2 },
    { label: "Listed properties", value: totalProperties, icon: Building2 },
  ];

  function openCreate() {
    setEditingId(null);
    setName("");
    setCode("");
    setCurrency("");
    setCountryStatus("active");
    setProperties("0");
    setSheetOpen(true);
  }

  function openEdit(country: SettingCountry) {
    setEditingId(country.id);
    setName(country.name);
    setCode(country.code);
    setCurrency(country.currency);
    setCountryStatus(country.status);
    setProperties(String(country.properties));
    setSheetOpen(true);
  }

  function handleSave() {
    const data = {
      name: name.trim() || "New country",
      code: code.trim().toUpperCase() || "XX",
      currency: currency.trim().toUpperCase() || "USD",
      status: countryStatus,
      properties: Math.max(0, Number(properties) || 0),
    };
    if (editingId) {
      updateCountry({ ...data, id: editingId });
    } else {
      addCountry({ ...data, id: `country_${Date.now().toString(36)}` });
    }
    setSheetOpen(false);
  }

  function handleDelete(country: SettingCountry) {
    if (window.confirm(`Remove "${country.name}" from the list?`)) {
      deleteCountry(country.id);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Countries</h1>
          <p className="text-sm text-muted-foreground">
            Manage the countries the business operates in.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Add country
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All countries</CardTitle>
          <CardDescription>
            {filtered.length} of {countries.length} countries shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries…"
                className="pl-8"
              />
            </div>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "all" | SettingCountryStatus)
              }
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Country</th>
                  <th className="px-6 py-3 font-medium">Currency</th>
                  <th className="px-6 py-3 font-medium">Properties</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((country) => (
                  <tr key={country.id} className="hover:bg-muted/40">
                    <td className="max-w-md px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                          <Globe2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{country.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {country.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {country.currency}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {country.properties > 0 ? country.properties : "—"}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant[country.status]}>
                          {country.status}
                        </Badge>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={country.status === "active"}
                          aria-label={`Toggle ${country.name}`}
                          onClick={() => toggleStatus(country.id)}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            country.status === "active"
                              ? "bg-navy"
                              : "bg-muted"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
                              country.status === "active"
                                ? "translate-x-4"
                                : "translate-x-0.5"
                            )}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Country actions"
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" alignOffset={-8}>
                          <DropdownMenuItem onClick={() => openEdit(country)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(country)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No countries match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit country" : "Add country"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Update the country details below."
                : "Add a country the business operates in."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div>
              <label className={fieldLabel} htmlFor="country-name">
                Country name
              </label>
              <Input
                id="country-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. United Arab Emirates"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={fieldLabel} htmlFor="country-code">
                  ISO code
                </label>
                <Input
                  id="country-code"
                  value={code}
                  maxLength={2}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="AE"
                  className="font-mono text-sm uppercase"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="country-currency">
                  Currency
                </label>
                <Input
                  id="country-currency"
                  value={currency}
                  maxLength={3}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="AED"
                  className="font-mono text-sm uppercase"
                />
              </div>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="country-properties">
                Listed properties
              </label>
              <Input
                id="country-properties"
                type="number"
                min={0}
                value={properties}
                onChange={(e) => setProperties(e.target.value)}
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="country-status">
                Status
              </label>
              <select
                id="country-status"
                value={countryStatus}
                onChange={(e) =>
                  setCountryStatus(e.target.value as SettingCountryStatus)
                }
                className={selectClass}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save country</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
