"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileText,
  GripVertical,
  Link2,
  List,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type { CmsMenuOut, CmsPageSummaryOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCmsMenus, useCmsPagesQuery } from "@/lib/cms";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface DraftItem {
  id: string;
  label: string;
  pageId: string | null;
  url: string | null;
}

let tempIdCounter = 0;
function nextTempId() {
  tempIdCounter += 1;
  return `temp:${tempIdCounter}`;
}

function isTempId(id: string) {
  return id.startsWith("temp:");
}

function itemTarget(item: DraftItem, pages: CmsPageSummaryOut[]) {
  if (item.pageId) {
    const page = pages.find((p) => p.id === item.pageId);
    return page ? `/pages/${page.slug}` : "Page not found";
  }
  return item.url || "#";
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none",
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

function MenuEditor({ menu, canEdit }: { menu: CmsMenuOut; canEdit: boolean }) {
  const { addItem, updateItem, removeItem, updateMenu } = useCmsMenus();
  const { data: pages = [] } = useCmsPagesQuery();

  const [draftItems, setDraftItems] = useState<DraftItem[]>(() => menu.items.map(toDraft));
  const [location, setLocation] = useState(menu.location ?? "");
  const [isActive, setIsActive] = useState(menu.is_active);
  const [query, setQuery] = useState("");
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function toDraft(item: CmsMenuOut["items"][number]): DraftItem {
    return { id: item.id, label: item.label, pageId: item.page_id ?? null, url: item.url ?? null };
  }

  // Only resync the local draft when switching menus, or right after a
  // save/discard — never on every background refetch, or in-progress edits
  // (reordering, new unsaved items) would be silently wiped out.
  useEffect(() => {
    setDraftItems(menu.items.map(toDraft));
    setLocation(menu.location ?? "");
    setIsActive(menu.is_active);
    setSelectedPageIds(new Set());
    setEditingItemId(null);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu.id]);

  const originalItems = useMemo(() => menu.items.map(toDraft), [menu]);

  const isDirty =
    location !== (menu.location ?? "") ||
    isActive !== menu.is_active ||
    draftItems.length !== originalItems.length ||
    draftItems.some((d, index) => {
      const orig = originalItems[index];
      return (
        !orig ||
        orig.id !== d.id ||
        orig.label !== d.label ||
        orig.pageId !== d.pageId ||
        orig.url !== d.url
      );
    });

  const availablePages = pages.filter((p) => !draftItems.some((d) => d.pageId === p.id));
  const filteredItems = draftItems.filter((d) =>
    d.label.toLowerCase().includes(query.toLowerCase())
  );

  function handleDiscard() {
    setDraftItems(originalItems);
    setLocation(menu.location ?? "");
    setIsActive(menu.is_active);
    setSelectedPageIds(new Set());
    setEditingItemId(null);
    setError("");
  }

  function handleAddPages() {
    if (selectedPageIds.size === 0) return;
    const additions = pages
      .filter((p) => selectedPageIds.has(p.id))
      .map((p) => ({ id: nextTempId(), label: p.title, pageId: p.id, url: null }));
    setDraftItems((prev) => [...prev, ...additions]);
    setSelectedPageIds(new Set());
  }

  function handleAddCustomLink() {
    if (!customLabel.trim()) return;
    setDraftItems((prev) => [
      ...prev,
      { id: nextTempId(), label: customLabel.trim(), pageId: null, url: customUrl.trim() || "#" },
    ]);
    setCustomLabel("");
    setCustomUrl("");
  }

  function handleRemoveItem(id: string) {
    setDraftItems((prev) => prev.filter((d) => d.id !== id));
  }

  function startEdit(item: DraftItem) {
    setEditingItemId(item.id);
    setEditLabel(item.label);
  }

  function commitEdit() {
    setDraftItems((prev) =>
      prev.map((d) => (d.id === editingItemId ? { ...d, label: editLabel.trim() || d.label } : d))
    );
    setEditingItemId(null);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    setDraftItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      const adjusted = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
      next.splice(adjusted, 0, moved);
      return next;
    });
    setDragIndex(null);
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      let current = menu;

      for (const orig of originalItems) {
        if (!draftItems.some((d) => d.id === orig.id)) {
          current = await removeItem(menu.id, orig.id);
        }
      }

      for (const [index, d] of draftItems.entries()) {
        if (isTempId(d.id)) {
          current = await addItem(menu.id, {
            label: d.label,
            page_id: d.pageId,
            url: d.pageId ? undefined : d.url ?? "#",
            sort_order: index,
          });
        } else {
          const origIndex = originalItems.findIndex((o) => o.id === d.id);
          const orig = origIndex === -1 ? null : originalItems[origIndex];
          const changed =
            !orig ||
            orig.label !== d.label ||
            orig.pageId !== d.pageId ||
            orig.url !== d.url ||
            origIndex !== index;
          if (changed) {
            current = await updateItem(menu.id, d.id, {
              label: d.label,
              page_id: d.pageId,
              url: d.pageId ? undefined : d.url ?? "#",
              sort_order: index,
            });
          }
        }
      }

      if (location !== (menu.location ?? "") || isActive !== menu.is_active) {
        current = await updateMenu(menu.id, {
          location: location.trim() || undefined,
          is_active: isActive,
        });
      }

      setDraftItems(current.items.map(toDraft));
      setLocation(current.location ?? "");
      setIsActive(current.is_active);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save this menu."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">{menu.name}</h2>
                {isDirty && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-navy">
                    Unsaved
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Drag to reorder</p>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={!isDirty || saving} onClick={handleDiscard}>
                  Discard changes
                </Button>
                <Button size="sm" disabled={!isDirty || saving} onClick={handleSave}>
                  {saving && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  Save menu
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search menu items…"
              className="pl-8"
            />
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            {filteredItems.map((item) => {
              const index = draftItems.indexOf(item);
              return (
                <div
                  key={item.id}
                  draggable={canEdit}
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="flex items-center gap-2 border-b border-border bg-white px-3 py-2.5 last:border-b-0 hover:bg-muted/40"
                >
                  {canEdit && (
                    <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                  )}
                  <div className="min-w-0 flex-1">
                    {editingItemId === item.id ? (
                      <Input
                        autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                        onBlur={commitEdit}
                        className="h-7 text-sm"
                      />
                    ) : (
                      <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                    )}
                    <p className="flex items-center gap-1 truncate font-mono text-xs text-muted-foreground">
                      <Link2 className="size-3" />
                      {itemTarget(item, pages)}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {item.pageId ? "Page" : "Custom"}
                  </Badge>
                  {canEdit && (
                    <div className="flex shrink-0 items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label="Edit label"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        aria-label="Remove item"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                {draftItems.length === 0 ? "No items in this menu yet." : "No items match your search."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Add menu items</p>
                <p className="text-xs text-muted-foreground">Select pages and add them to the menu</p>
              </div>

              <div className="max-h-56 space-y-1 overflow-y-auto">
                {availablePages.map((page) => (
                  <label
                    key={page.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm hover:bg-muted/60"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPageIds.has(page.id)}
                      onChange={(e) =>
                        setSelectedPageIds((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(page.id);
                          else next.delete(page.id);
                          return next;
                        })
                      }
                      className="size-3.5 rounded border-input"
                    />
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{page.title}</span>
                  </label>
                ))}
                {availablePages.length === 0 && (
                  <p className="px-1.5 py-2 text-xs text-muted-foreground">
                    All pages are already in this menu.
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                disabled={selectedPageIds.size === 0}
                onClick={handleAddPages}
              >
                Add {selectedPageIds.size > 0 ? selectedPageIds.size : ""} to menu
              </Button>

              <div className="space-y-2 border-t border-border pt-3">
                <p className="text-xs font-medium text-muted-foreground">Custom link</p>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Label"
                />
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="/about or https://…"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!customLabel.trim()}
                  onClick={handleAddCustomLink}
                >
                  <Plus data-icon="inline-start" />
                  Add link
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm font-semibold text-foreground">Menu settings</p>
              <div>
                <label className={fieldLabel}>Display location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. header, footer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Active</span>
                <Toggle checked={isActive} onChange={setIsActive} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function CmsMenusCatalog() {
  const { menus, isLoading, createMenu, deleteMenu } = useCmsMenus();
  const { can } = usePermissions();

  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [location, setLocation] = useState("");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!selectedMenuId && menus.length > 0) setSelectedMenuId(menus[0].id);
  }, [menus, selectedMenuId]);

  const selectedMenu = menus.find((m) => m.id === selectedMenuId) ?? null;

  function openCreate() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setLocation("");
    setCreateError("");
    setSheetOpen(true);
  }

  async function handleCreateMenu() {
    setCreating(true);
    setCreateError("");
    try {
      const created = await createMenu({
        name: name.trim() || "Untitled menu",
        slug: slug.trim() || slugify(name),
        location: location.trim() || undefined,
      });
      setSheetOpen(false);
      setSelectedMenuId(created.id);
    } catch (err) {
      setCreateError(errorMessage(err, "Couldn't create this menu."));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteMenu(menu: CmsMenuOut) {
    if (!window.confirm(`Delete the "${menu.name}" menu and all its items?`)) return;
    try {
      await deleteMenu(menu.id);
      if (selectedMenuId === menu.id) setSelectedMenuId(null);
    } catch {
      // best-effort — menu list will simply still show it if this fails
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Menus</h1>
          <p className="text-sm text-muted-foreground">
            {menus.length} menus
            {selectedMenu && ` · editing "${selectedMenu.name}"`}
          </p>
        </div>
        {can("cms", "create") && (
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" />
            New menu
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">
          <Card className="h-fit p-1.5">
            <div className="space-y-0.5">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedMenuId(menu.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelectedMenuId(menu.id);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-start justify-between gap-2 rounded-lg px-3 py-2.5 text-left outline-none transition-colors",
                    selectedMenuId === menu.id
                      ? "bg-navy text-white"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{menu.name}</p>
                    <p
                      className={cn(
                        "truncate text-xs",
                        selectedMenuId === menu.id ? "text-white/60" : "text-muted-foreground"
                      )}
                    >
                      {menu.location || "No location"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs",
                        selectedMenuId === menu.id
                          ? "bg-white/15 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {menu.items.length}
                    </span>
                    {can("cms", "delete") && (
                      <button
                        type="button"
                        aria-label="Delete menu"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(menu);
                        }}
                        className={cn(
                          "flex size-6 items-center justify-center rounded-md transition-colors",
                          selectedMenuId === menu.id
                            ? "text-white/60 hover:bg-white/10 hover:text-white"
                            : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        )}
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {menus.length === 0 && (
                <p className="flex items-center gap-2 px-3 py-6 text-xs text-muted-foreground">
                  <List className="size-3.5" />
                  No menus yet.
                </p>
              )}
            </div>
          </Card>

          {selectedMenu ? (
            <MenuEditor key={selectedMenu.id} menu={selectedMenu} canEdit={can("cms", "edit")} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {menus.length === 0
                ? "Create a menu to start building navigation."
                : "Select a menu to edit it."}
            </p>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New menu</SheetTitle>
            <SheetDescription>Create a navigation menu to add items to.</SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            {createError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
                {createError}
              </div>
            )}
            <div>
              <label className={fieldLabel} htmlFor="menu-name">
                Name
              </label>
              <Input
                id="menu-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g. Main navigation"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="menu-slug">
                Slug
              </label>
              <Input
                id="menu-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="menu-location">
                Location
              </label>
              <Input
                id="menu-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. header, footer"
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMenu} disabled={creating}>
              {creating && <Loader2 className="animate-spin" data-icon="inline-start" />}
              Create menu
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function CmsMenusPage() {
  return (
    <PermissionGuard module="cms">
      <CmsMenusCatalog />
    </PermissionGuard>
  );
}
