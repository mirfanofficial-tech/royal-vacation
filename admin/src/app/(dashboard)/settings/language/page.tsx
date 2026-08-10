"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Languages,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Search,
  ToggleLeft,
  Trash2,
} from "lucide-react";

import type { LanguageOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useLanguages } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { useSiteSettings } from "@/lib/site-settings";
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

function LanguageCatalog() {
  const {
    languages,
    isLoading,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    isMutating,
  } = useLanguages();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<LanguageOut | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [nativeName, setNativeName] = useState("");

  const filtered = useMemo(
    () =>
      languages.filter((l) => {
        const matchesQuery = `${l.code} ${l.name} ${l.native_name}`
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || (statusFilter === "active") === l.is_active;
        return matchesQuery && matchesStatus;
      }),
    [languages, query, statusFilter]
  );

  const active = languages.filter((l) => l.is_active).length;

  const stats = [
    { label: "Total languages", value: languages.length, icon: Languages },
    { label: "Active", value: active, icon: BadgeCheck },
    { label: "Inactive", value: languages.length - active, icon: ToggleLeft },
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
    setName("");
    setNativeName("");
    setSheetOpen(true);
  }

  function openEdit(language: LanguageOut) {
    setEditing(language);
    setCode(language.code);
    setName(language.name);
    setNativeName(language.native_name);
    setSheetOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateLanguage(editing.id, {
          name: name.trim() || undefined,
          native_name: nativeName.trim() || undefined,
        });
        flash(`${name || editing.name} updated.`);
      } else {
        await createLanguage({
          code: code.trim(),
          name: name.trim(),
          native_name: nativeName.trim(),
        });
        flash(`${name.trim()} added to the language catalog.`);
      }
      setSheetOpen(false);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't save this language."));
    }
  }

  async function handleToggleActive(language: LanguageOut) {
    try {
      await updateLanguage(language.id, { is_active: !language.is_active });
      flash(`${language.name} is now ${language.is_active ? "inactive" : "active"}.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't update this language's status."));
    }
  }

  async function handleDelete(language: LanguageOut) {
    if (!window.confirm(`Delete "${language.name}"? This cannot be undone.`)) return;
    try {
      await deleteLanguage(language.id);
      flash(`${language.name} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this language."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Language</h1>
          <p className="text-sm text-muted-foreground">
            Languages available to guests across the site.
          </p>
        </div>
        {can("settings", "create") && (
          <Button onClick={openAdd}>
            <Plus data-icon="inline-start" />
            Add language
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
              <CardTitle>All languages</CardTitle>
              <CardDescription>
                {filtered.length} of {languages.length} languages shown.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search languages…"
                  aria-label="Search languages"
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
                  <th className="px-6 py-3 font-medium">Language</th>
                  <th className="px-6 py-3 font-medium">Native name</th>
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
                  filtered.map((language) => (
                    <tr key={language.id} className="hover:bg-muted/40">
                      <td className="max-w-md px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 font-mono text-xs font-semibold text-navy">
                            {language.code}
                          </span>
                          <p className="truncate font-medium">{language.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{language.native_name}</td>
                      <td className="px-6 py-3">
                        <Badge
                          className={cn(
                            "rounded-full",
                            language.is_active ? statusBadge.active : statusBadge.inactive
                          )}
                        >
                          {language.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label="Language actions"
                            disabled={isMutating}
                            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" alignOffset={-8}>
                            {can("settings", "edit") && (
                              <>
                                <DropdownMenuItem onClick={() => openEdit(language)}>
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleActive(language)}>
                                  <ToggleLeft />
                                  {language.is_active ? "Deactivate" : "Activate"}
                                </DropdownMenuItem>
                              </>
                            )}
                            {can("settings", "delete") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDelete(language)}
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
                      No languages match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <DisplayPreferences languages={languages} />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editing ? "Edit language" : "Add language"}</SheetTitle>
            <SheetDescription>
              {editing
                ? "Update this language's display names."
                : "Add a new language to the catalog."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div>
              <label className={fieldLabel} htmlFor="language-code">
                Code
              </label>
              <Input
                id="language-code"
                value={code}
                maxLength={10}
                onChange={(e) => setCode(e.target.value.toLowerCase())}
                placeholder="en"
                className="font-mono"
                disabled={Boolean(editing)}
              />
              {editing && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Code can&apos;t be changed after creation.
                </p>
              )}
            </div>
            <div>
              <label className={fieldLabel} htmlFor="language-name">
                Name
              </label>
              <Input
                id="language-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="English"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="language-native-name">
                Native name
              </label>
              <Input
                id="language-native-name"
                value={nativeName}
                onChange={(e) => setNativeName(e.target.value)}
                placeholder="English"
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!code.trim() || !name.trim() || !nativeName.trim() || isMutating}
            >
              {isMutating ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {editing ? "Save changes" : "Add language"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

function DisplayPreferences({ languages }: { languages: LanguageOut[] }) {
  const { settings, update } = useSiteSettings();
  const [saved, setSaved] = useState(false);
  const activeLanguages = languages.filter((l) => l.is_active);
  const defaultLanguageLabel =
    languages.find((l) => l.code === settings.defaultLanguage)?.name ?? settings.defaultLanguage;

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
              <Languages className="size-4 text-muted-foreground" />
              Display preferences
            </CardTitle>
            <CardDescription>Default language shown to guests.</CardDescription>
          </div>
          <Button size="sm" onClick={handleSave}>
            <Save data-icon="inline-start" />
            Save
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-w-md space-y-2">
        <label className={fieldLabel} htmlFor="settings-language">
          Default language
        </label>
        <select
          id="settings-language"
          value={settings.defaultLanguage}
          onChange={(e) => update({ defaultLanguage: e.target.value })}
          className={selectClass}
        >
          {activeLanguages.length === 0 && (
            <option value={settings.defaultLanguage}>{defaultLanguageLabel}</option>
          )}
          {activeLanguages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name} ({language.native_name})
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">Currently: {defaultLanguageLabel}.</p>
      </CardContent>
    </Card>
  );
}

export default function LanguageSettingsPage() {
  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <LanguageCatalog />
      </div>
    </PermissionGuard>
  );
}
