"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  GripVertical,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

import type { BlogCategoryOut } from "@royal-vacation/api-client";
import { blogCategoryColors, type BlogCategoryColorId } from "@/lib/mock-data";
import { ApiError } from "@/lib/api";
import { useBlogCategories, useBlogPosts } from "@/lib/blog";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldHint = "mt-1 text-xs text-muted-foreground";

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

function colorBadge(id: string) {
  return blogCategoryColors.find((color) => color.id === id) ?? blogCategoryColors[0];
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none disabled:opacity-50",
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

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function BlogCategoriesCatalog() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, isMutating } =
    useBlogCategories();
  const { posts } = useBlogPosts();
  const { can } = usePermissions();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<BlogCategoryColorId>("navy");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [tagQuery, setTagQuery] = useState("");

  const tagUsage = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [posts]);

  const filteredTags = tagUsage.filter((t) =>
    t.tag.toLowerCase().includes(tagQuery.toLowerCase())
  );
  const maxTagCount = Math.max(...tagUsage.map((t) => t.count), 1);

  function openCreate() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setColor("navy");
    setVisible(true);
    setError("");
    setSheetOpen(true);
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("new") === "1") openCreate();
  }, []);

  function openEdit(category: BlogCategoryOut) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setDescription(category.description ?? "");
    setColor((category.color as BlogCategoryColorId) ?? "navy");
    setVisible(category.is_visible);
    setError("");
    setSheetOpen(true);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSave() {
    const patch = {
      name: name.trim() || "Untitled",
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      color,
      is_visible: visible,
    };
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateCategory(editingId, patch);
      } else {
        await createCategory({ ...patch, sort_order: categories.length });
      }
      setSheetOpen(false);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save this category."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(category: BlogCategoryOut) {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    try {
      await deleteCategory(category.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this category."));
    }
  }

  async function handleToggleVisible(category: BlogCategoryOut) {
    try {
      await updateCategory(category.id, { is_visible: !category.is_visible });
    } catch (err) {
      setError(errorMessage(err, "Couldn't update visibility."));
    }
  }

  async function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const ids = categories.map((c) => c.id);
    const [moved] = ids.splice(dragIndex, 1);
    const adjusted = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
    ids.splice(adjusted, 0, moved);
    setDragIndex(null);
    try {
      await Promise.all(
        ids.map((id, index) => {
          const category = categories.find((c) => c.id === id);
          if (category && category.sort_order !== index) {
            return updateCategory(id, { sort_order: index });
          }
          return Promise.resolve();
        })
      );
    } catch (err) {
      setError(errorMessage(err, "Couldn't reorder categories."));
    }
  }

  function handleExport() {
    const rows = [
      ["Category", "Slug", "Posts", "Visible"],
      ...categories.map((c) => [c.name, c.slug, String(c.post_count), c.is_visible ? "Yes" : "No"]),
      [],
      ["Tag", "Uses"],
      ...tagUsage.map((t) => [t.tag, String(t.count)]),
    ];
    downloadCsv("blog-taxonomy.csv", rows);
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Categories &amp; Tags</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categories · {tagUsage.length} tags · shared taxonomy across posts
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" render={<Link href="/blogs" />}>
            <ArrowLeft data-icon="inline-start" />
            Posts
          </Button>
          <Button variant="outline" disabled title="Coming soon">
            Merge duplicates
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download data-icon="inline-start" />
            Export
          </Button>
          {can("blog", "create") && (
            <Button onClick={openCreate}>
              <Plus data-icon="inline-start" />
              New category
            </Button>
          )}
        </div>
      </div>

      {error && !sheetOpen && (
        <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium">Slug</th>
                    <th className="px-6 py-3 font-medium">Posts</th>
                    <th className="px-6 py-3 font-medium">Visible</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((category, index) => {
                    const badge = colorBadge(category.color);
                    return (
                      <tr
                        key={category.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className="hover:bg-muted/40"
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", badge.badge)}>
                              <Tag className="size-3.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{category.name}</p>
                              {category.description && (
                                <p className="truncate text-xs text-muted-foreground">
                                  {category.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                          /blog/{category.slug}
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="secondary">{category.post_count}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Toggle
                            checked={category.is_visible}
                            onChange={() => handleToggleVisible(category)}
                            disabled={isMutating}
                          />
                        </td>
                        <td className="px-6 py-3 text-right">
                          {(can("blog", "edit") || can("blog", "delete")) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Category actions"
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" alignOffset={-8}>
                                {can("blog", "edit") && (
                                  <DropdownMenuItem onClick={() => openEdit(category)}>
                                    <Pencil />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {can("blog", "edit") && can("blog", "delete") && <DropdownMenuSeparator />}
                                {can("blog", "delete") && (
                                  <DropdownMenuItem variant="destructive" onClick={() => handleDelete(category)}>
                                    <Trash2 />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No categories yet — create one to start organizing posts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Tags</p>
              <p className="text-xs text-muted-foreground">
                {tagUsage.length} total · sized by usage across real posts
              </p>
            </div>
            <div className="relative w-56">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={tagQuery}
                onChange={(e) => setTagQuery(e.target.value)}
                placeholder="Filter tags…"
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredTags.map(({ tag, count }) => {
              const scale = 0.75 + (count / maxTagCount) * 0.55;
              return (
                <span
                  key={tag}
                  style={{ fontSize: `${scale}rem` }}
                  className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-foreground"
                >
                  {tag}
                  <span className="text-xs text-muted-foreground">{count}</span>
                </span>
              );
            })}
            {filteredTags.length === 0 && (
              <p className="py-4 text-sm text-muted-foreground">
                {tagUsage.length === 0 ? "No tags used yet." : "No tags match your search."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit category" : "New category"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Update the details for this category."
                : "Create a category to group blog posts."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            {error && (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className={fieldLabel} htmlFor="category-name">
                Name
              </label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Travel Guides"
              />
            </div>

            <div>
              <label className={fieldLabel} htmlFor="category-slug">
                URL slug
              </label>
              <Input
                id="category-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="travel-guides"
                className="font-mono text-sm"
              />
              <p className={fieldHint}>
                {slug ? `royalvacation.com/blog/${slug}` : "Auto-generated from the name."}
              </p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="category-description">
                Description
              </label>
              <textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Short description shown on the blog index…"
                className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div>
              <span className={fieldLabel}>Color</span>
              <div
                className="flex flex-wrap items-center gap-2"
                role="radiogroup"
                aria-label="Category color"
              >
                {blogCategoryColors.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={color === option.id}
                    aria-label={option.label}
                    title={option.label}
                    onClick={() => setColor(option.id)}
                    className={cn(
                      "size-7 rounded-full transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      option.chip,
                      color === option.id
                        ? "ring-2 ring-ring ring-offset-2 ring-offset-popover"
                        : "opacity-60 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Visible on the site</span>
              <Toggle checked={visible} onChange={setVisible} />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || isMutating}>
              {saving ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
              Save category
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function BlogCategoriesPage() {
  return (
    <PermissionGuard module="blog">
      <BlogCategoriesCatalog />
    </PermissionGuard>
  );
}
