"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Folder,
  MoreHorizontal,
  Pencil,
  Plus,
  Tag,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  blogCategoryColors,
  type AdminBlogCategory,
  type BlogCategoryColorId,
} from "@/lib/mock-data";
import { useBlogCategories } from "@/lib/blog-categories";
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function colorBadge(id: BlogCategoryColorId) {
  return (
    blogCategoryColors.find((color) => color.id === id) ?? blogCategoryColors[0]
  );
}

export default function BlogCategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useBlogCategories();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<BlogCategoryColorId>("navy");

  const totalPosts = categories.reduce(
    (sum, category) => sum + category.postCount,
    0
  );
  const topCategory = [...categories].sort(
    (a, b) => b.postCount - a.postCount
  )[0];

  const stats = [
    { label: "Total categories", value: categories.length, icon: Folder },
    { label: "Posts in categories", value: totalPosts, icon: FileText },
    {
      label: "Most used",
      value: topCategory ? topCategory.name : "—",
      icon: TrendingUp,
    },
  ];

  function openCreate() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setColor("navy");
    setSheetOpen(true);
  }

  function openEdit(category: AdminBlogCategory) {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setSlugTouched(true);
    setDescription(category.description);
    setColor(category.color);
    setSheetOpen(true);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSave() {
    const patch = {
      name: name.trim() || "Untitled",
      slug: slug.trim() || slugify(name),
      description: description.trim(),
      color,
    };
    if (editingId) {
      updateCategory(editingId, patch);
    } else {
      addCategory({ ...patch, postCount: 0 });
    }
    setSheetOpen(false);
  }

  function handleDelete(category: AdminBlogCategory) {
    if (window.confirm(`Delete the "${category.name}" category?`)) {
      deleteCategory(category.id);
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
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" />
            New category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="truncate text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                    <CardDescription className="truncate">
                      /blog/{category.slug}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Category actions"
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" alignOffset={-8}>
                    <DropdownMenuItem onClick={() => openEdit(category)}>
                      <Pencil />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {category.description || "No description yet."}
                </p>
                <div className="mt-4">
                  <Badge variant="secondary">
                    {category.postCount}{" "}
                    {category.postCount === 1 ? "post" : "posts"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit category" : "New category"}
            </SheetTitle>
            <SheetDescription>
              {editingId
                ? "Update the details for this category."
                : "Create a category to group blog posts."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
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
                {slug
                  ? `royalvacation.com/blog/${slug}`
                  : "Auto-generated from the name."}
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
            <Button onClick={handleSave}>Save category</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
