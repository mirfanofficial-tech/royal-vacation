"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { FileText, Loader2, MoreHorizontal, Pencil, Plus, Search, Trash2 } from "lucide-react";

import type { CmsPageStatus, CmsPageSummaryOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCmsPages } from "@/lib/cms";
import { useLanguages } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusVariant: Record<CmsPageStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "outline",
  archived: "secondary",
};

const statusTabs = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
] as const;

type StatusTab = (typeof statusTabs)[number]["value"];

const sortOptions = [
  { value: "updated_desc", label: "Recently updated" },
  { value: "updated_asc", label: "Oldest" },
  { value: "title_asc", label: "Title A–Z" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

const ANY_LANGUAGE = "__any_language__";
const ANY_AUTHOR = "__any_author__";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function CmsPagesCatalog() {
  const { pages, isLoading, deletePage, isMutating } = useCmsPages();
  const { languages } = useLanguages();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [languageFilter, setLanguageFilter] = useState(ANY_LANGUAGE);
  const [authorFilter, setAuthorFilter] = useState(ANY_AUTHOR);
  const [sort, setSort] = useState<SortOption>("updated_desc");
  const [error, setError] = useState("");

  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);
  const authors = useMemo(
    () => Array.from(new Set(pages.map((p) => p.author_name))).sort(),
    [pages]
  );

  const statusCounts = useMemo(
    () => ({
      all: pages.length,
      published: pages.filter((p) => p.status === "published").length,
      draft: pages.filter((p) => p.status === "draft").length,
      archived: pages.filter((p) => p.status === "archived").length,
    }),
    [pages]
  );

  function hasLanguage(page: CmsPageSummaryOut, code: string) {
    return code === "en" || page.translation_language_codes.includes(code);
  }

  const filtered = useMemo(() => {
    const result = pages.filter((page) => {
      const matchesQuery = page.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusTab === "all" || page.status === statusTab;
      const matchesLanguage =
        languageFilter === ANY_LANGUAGE || hasLanguage(page, languageFilter);
      const matchesAuthor = authorFilter === ANY_AUTHOR || page.author_name === authorFilter;
      return matchesQuery && matchesStatus && matchesLanguage && matchesAuthor;
    });

    return [...result].sort((a, b) => {
      if (sort === "title_asc") return a.title.localeCompare(b.title);
      if (sort === "updated_asc") return a.updated_at.localeCompare(b.updated_at);
      return b.updated_at.localeCompare(a.updated_at);
    });
  }, [pages, query, statusTab, languageFilter, authorFilter, sort]);

  function clearFilters() {
    setQuery("");
    setStatusTab("all");
    setLanguageFilter(ANY_LANGUAGE);
    setAuthorFilter(ANY_AUTHOR);
    setSort("updated_desc");
  }

  async function handleDelete(page: CmsPageSummaryOut) {
    if (!window.confirm(`Delete the page "${page.title}"? This cannot be undone.`)) return;
    try {
      await deletePage(page.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this page."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Pages</h1>
          <p className="text-sm text-muted-foreground">
            {pages.length} pages · {activeLanguages.length} languages
          </p>
        </div>
        {can("cms", "create") && (
          <Button render={<Link href="/cms/pages/new" />}>
            <Plus data-icon="inline-start" />
            New page
          </Button>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <Card className="p-1.5">
        <div className="flex flex-wrap gap-1">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusTab(tab.value)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                statusTab === tab.value
                  ? "border-b-2 border-navy text-navy"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {tab.label}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {statusCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>
      </Card>

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
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by language"
            >
              <option value={ANY_LANGUAGE}>All languages</option>
              {activeLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.native_name}
                </option>
              ))}
            </select>
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className={selectClass}
              aria-label="Filter by author"
            >
              <option value={ANY_AUTHOR}>Any author</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className={selectClass}
              aria-label="Sort"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Page</th>
                  <th className="px-6 py-3 font-medium">Languages</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Updated</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((page) => {
                    const filledLanguages = 1 + page.translation_language_codes.length;
                    const totalLanguages = Math.max(activeLanguages.length, filledLanguages);
                    const path =
                      page.page_type === "system" ? page.route_path : `/pages/${page.slug}`;
                    return (
                      <tr key={page.id} className="hover:bg-muted/40">
                        <td className="max-w-md px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                              <FileText className="size-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">
                                {page.title}
                                {page.is_homepage && (
                                  <Badge variant="secondary" className="ml-2 align-middle">
                                    Homepage
                                  </Badge>
                                )}
                                {page.page_type === "system" && (
                                  <Badge variant="outline" className="ml-2 align-middle">
                                    System
                                  </Badge>
                                )}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                royalvacation.com{path}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: totalLanguages }).map((_, i) => (
                                <span
                                  key={i}
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    i < filledLanguages ? "bg-rating" : "bg-border"
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {filledLanguages}/{totalLanguages}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-navy/10 text-xs font-semibold text-navy">
                                {initials(page.author_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">{page.author_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariant[page.status]}>{page.status}</Badge>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {formatDistanceToNowStrict(new Date(page.updated_at), {
                            addSuffix: true,
                          })}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {(can("cms", "edit") || can("cms", "delete")) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Page actions"
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" alignOffset={-8}>
                                {can("cms", "edit") && (
                                  <DropdownMenuItem
                                    render={
                                      <Link
                                        href={
                                          page.page_type === "system"
                                            ? `/cms/pages/${page.id}`
                                            : `/cms/pages/${page.id}/builder`
                                        }
                                      />
                                    }
                                  >
                                    <Pencil />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {can("cms", "edit") && can("cms", "delete") && (
                                  <DropdownMenuSeparator />
                                )}
                                {can("cms", "delete") && (
                                  <DropdownMenuItem
                                    variant="destructive"
                                    disabled={isMutating || page.page_type === "system"}
                                    onClick={() => handleDelete(page)}
                                  >
                                    <Trash2 />
                                    {page.page_type === "system"
                                      ? "Delete (system page)"
                                      : "Delete"}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No pages match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CmsPagesPage() {
  return (
    <PermissionGuard module="cms">
      <CmsPagesCatalog />
    </PermissionGuard>
  );
}
