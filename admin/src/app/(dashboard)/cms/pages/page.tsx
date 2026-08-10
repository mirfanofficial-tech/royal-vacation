"use client";

import { useMemo, useState } from "react";
import {
  Eye,
  FileText,
  Folder,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  mockCmsPages,
  type CmsPage,
  type CmsPageStatus,
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

const statusVariant: Record<
  CmsPageStatus,
  "default" | "secondary" | "outline"
> = {
  published: "default",
  draft: "outline",
  archived: "secondary",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function slugify(value: string) {
  return (
    "/" +
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

export default function CmsPagesPage() {
  const [pages, setPages] = useState<CmsPage[]>(mockCmsPages);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | CmsPageStatus>("all");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [pageStatus, setPageStatus] = useState<CmsPageStatus>("draft");
  const [author, setAuthor] = useState("Royal Vacation Admin");

  const filtered = useMemo(
    () =>
      pages.filter((page) => {
        const matchesQuery = page.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesStatus = status === "all" || page.status === status;
        return matchesQuery && matchesStatus;
      }),
    [pages, query, status]
  );

  const published = pages.filter((p) => p.status === "published").length;
  const drafts = pages.filter((p) => p.status === "draft").length;
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  const stats = [
    { label: "Total pages", value: pages.length, icon: FileText },
    { label: "Published", value: published, icon: Folder },
    { label: "Drafts", value: drafts, icon: FileText },
    { label: "Total views", value: totalViews.toLocaleString(), icon: Eye },
  ];

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setPageStatus("draft");
    setAuthor("Royal Vacation Admin");
    setSheetOpen(true);
  }

  function openEdit(page: CmsPage) {
    setEditingId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setSlugTouched(true);
    setPageStatus(page.status);
    setAuthor(page.author);
    setSheetOpen(true);
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSave() {
    const data = {
      title: title.trim() || "Untitled page",
      slug: slug.trim() || slugify(title),
      status: pageStatus,
      author: author.trim() || "Royal Vacation Admin",
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    if (editingId) {
      setPages((prev) =>
        prev.map((page) => (page.id === editingId ? { ...page, ...data } : page))
      );
    } else {
      const id = `cms_${Date.now().toString(36)}`;
      setPages((prev) => [{ ...data, id, views: 0 }, ...prev]);
    }
    setSheetOpen(false);
  }

  function handleDelete(page: CmsPage) {
    if (window.confirm(`Delete the page "${page.title}"?`)) {
      setPages((prev) => prev.filter((p) => p.id !== page.id));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Pages</h1>
          <p className="text-sm text-muted-foreground">
            Manage every page of the customer website.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          New page
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
          <CardTitle>All pages</CardTitle>
          <CardDescription>
            {filtered.length} of {pages.length} pages shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages…"
                className="pl-8"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | CmsPageStatus)}
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Page</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Updated</th>
                  <th className="px-6 py-3 font-medium">Views</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-muted/40">
                    <td className="max-w-md px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                          <FileText className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{page.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {page.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[page.status]}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {page.author}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {page.updatedAt}
                    </td>
                    <td className="px-6 py-3">
                      {page.views > 0 ? page.views.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Page actions"
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" alignOffset={-8}>
                          <DropdownMenuItem onClick={() => openEdit(page)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(page)}
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
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-muted-foreground"
                    >
                      No pages match your filters.
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
            <SheetTitle>{editingId ? "Edit page" : "New page"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Update the page details below."
                : "Create a new page for the customer site."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div>
              <label className={fieldLabel} htmlFor="page-title">
                Title
              </label>
              <Input
                id="page-title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. About Us"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="page-slug">
                URL slug
              </label>
              <Input
                id="page-slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="/about"
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {slug
                  ? `royalvacation.com${slug}`
                  : "Auto-generated from the title."}
              </p>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="page-status">
                Status
              </label>
              <select
                id="page-status"
                value={pageStatus}
                onChange={(e) => setPageStatus(e.target.value as CmsPageStatus)}
                className={selectClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="page-author">
                Author
              </label>
              <Input
                id="page-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save page</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
