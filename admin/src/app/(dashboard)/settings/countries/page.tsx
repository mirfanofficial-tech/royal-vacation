"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Globe2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";

import type { CountryOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCountries } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
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

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function CountryCatalog() {
  const {
    countries,
    isLoading,
    createCountry,
    updateCountry,
    deleteCountry,
    isMutating,
  } = useCountries();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<CountryOut | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [dialCode, setDialCode] = useState("");

  const filtered = useMemo(
    () =>
      countries.filter((c) => {
        const matchesQuery = `${c.name} ${c.code}`.toLowerCase().includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || (statusFilter === "active") === c.is_active;
        return matchesQuery && matchesStatus;
      }),
    [countries, query, statusFilter]
  );

  const active = countries.filter((c) => c.is_active).length;

  const stats = [
    { label: "Total countries", value: countries.length, icon: Globe2 },
    { label: "Active", value: active, icon: BadgeCheck },
    { label: "Inactive", value: countries.length - active, icon: Globe2 },
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
    setName("");
    setCode("");
    setDialCode("");
    setSheetOpen(true);
  }

  function openEdit(country: CountryOut) {
    setEditing(country);
    setName(country.name);
    setCode(country.code);
    setDialCode(country.dial_code);
    setSheetOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateCountry(editing.id, {
          name: name.trim() || undefined,
          dial_code: dialCode.trim() || undefined,
        });
        flash(`${name || editing.name} updated.`);
      } else {
        await createCountry({
          code: code.trim(),
          name: name.trim(),
          dial_code: dialCode.trim(),
        });
        flash(`${name.trim()} added to the country catalog.`);
      }
      setSheetOpen(false);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't save this country."));
    }
  }

  async function handleToggleActive(country: CountryOut) {
    try {
      await updateCountry(country.id, { is_active: !country.is_active });
      flash(`${country.name} is now ${country.is_active ? "inactive" : "active"}.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't update this country's status."));
    }
  }

  async function handleDelete(country: CountryOut) {
    if (!window.confirm(`Delete "${country.name}"? This cannot be undone.`)) return;
    try {
      await deleteCountry(country.id);
      flash(`${country.name} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this country."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Countries</h1>
          <p className="text-sm text-muted-foreground">
            Countries guests and properties can be associated with.
          </p>
        </div>
        {can("settings", "create") && (
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            Add country
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
              <CardTitle>All countries</CardTitle>
              <CardDescription>
                {filtered.length} of {countries.length} countries shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search countries…"
                  aria-label="Search countries"
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
                  <th className="px-6 py-3 font-medium">Country</th>
                  <th className="px-6 py-3 font-medium">Dial code</th>
                  <th className="px-6 py-3 font-medium">Status</th>
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
                  filtered.map((country) => (
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
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3.5" />
                          {country.dial_code}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge
                          className={cn(
                            "rounded-full",
                            country.is_active ? statusBadge.active : statusBadge.inactive
                          )}
                        >
                          {country.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Country actions"
                            disabled={isMutating}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" alignOffset={-8}>
                            {can("settings", "edit") && (
                              <>
                                <DropdownMenuItem onClick={() => openEdit(country)}>
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(country)}>
                                  <Globe2 />
                                  {country.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </>
                            )}
                            {can("settings", "delete") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(country)}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-muted-foreground">
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
            <SheetTitle>{editing ? "Edit country" : "Add country"}</SheetTitle>
            <SheetDescription>
              {editing ? "Update this country's details." : "Add a new country to the catalog."}
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
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="AE"
                  className="font-mono text-sm uppercase"
                  disabled={Boolean(editing)}
                />
                {editing && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Code can&apos;t be changed after creation.
                  </p>
                )}
              </div>
              <div>
                <label className={fieldLabel} htmlFor="country-dial-code">
                  Dial code
                </label>
                <Input
                  id="country-dial-code"
                  value={dialCode}
                  maxLength={6}
                  onChange={(e) => setDialCode(e.target.value)}
                  placeholder="+971"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || !code.trim() || !dialCode.trim() || isMutating}
            >
              {isMutating ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {editing ? "Save changes" : "Add country"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function CountriesSettingsPage() {
  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <CountryCatalog />
      </div>
    </PermissionGuard>
  );
}
