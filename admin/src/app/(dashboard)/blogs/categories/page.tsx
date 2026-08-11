"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Folder,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";

import type { BlogCategoryOut } from "@royal-vacation/api-client";
import { blogCategoryColors, type BlogCategoryColorId } from "@/lib/mock-data";
import { ApiError } from "@/lib/api";
import { useBlogCategories } from "@/lib/blog";
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

function BlogCategoriesCatalog() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory, isMutating } =
    useBlogCategories();
  const { can } = usePermissions();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<BlogCategoryColorId>("navy");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const totalPosts = categories.reduce((sum, category) => sum + category.post_count, 0);
  const topCategory = [...categories].sort((a, b) => b.post_count - a.post_count)[0];

  const stats = [
    { label: "Total categories", value: categories.length, icon: Folder },
    { label: "Posts in categories", value: totalPosts, icon: FileText },
    { label: "Most used", value: topCategory ? topCategory.name : "—", icon: TrendingUp },
  ];

  function openCreate() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setColor("navy");
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
    };
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateCategory(editingId, patch);
      } else {
        await createCategory(patch);
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

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Organize blog posts into manageable groups.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/blogs" />}>
            <ArrowLeft data-icon="inline-start" />
            Posts
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="truncate text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const badge = colorBadge(category.color);
            return (
              <Card key={category.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        badge.badge
                      )}
                    >
                      <Tag className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="truncate">{category.name}</CardTitle>
                      <CardDescription className="truncate">/blog/{category.slug}</CardDescription>
                    </div>
                  </div>
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
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {category.description || "No description yet."}
                  </p>
                  <div className="mt-4">
                    <Badge variant="secondary">
                      {category.post_count} {category.post_count === 1 ? "post" : "posts"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {categories.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
              No categories yet — create one to start organizing posts.
            </p>
          )}
        </div>
      )}

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
