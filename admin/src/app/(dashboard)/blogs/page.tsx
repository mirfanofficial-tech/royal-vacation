"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";

import type { BlogPostStatus, BlogPostSummaryOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useBlogCategories, useBlogPosts } from "@/lib/blog";
import { useLanguages } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const statusVariant: Record<BlogPostStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "outline",
  scheduled: "secondary",
  in_review: "outline",
};
const statusClassName: Partial<Record<BlogPostStatus, string>> = {
  in_review: "border-transparent bg-gold/15 text-gold",
};
const statusLabels: Record<BlogPostStatus, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
  in_review: "In review",
};

const statusTabs = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "in_review", label: "In review" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
] as const;

type StatusTab = (typeof statusTabs)[number]["value"];

const sortOptions = [
  { value: "recent", label: "Most recent" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
] as const;

type SortOption = (typeof sortOptions)[number]["value"];

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

function BlogPostsCatalog() {
  const { categories } = useBlogCategories();
  const { posts, isLoading, deletePost, isMutating } = useBlogPosts();
  const { languages } = useLanguages();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [authorFilter, setAuthorFilter] = useState(ANY_AUTHOR);
  const [dateFilter, setDateFilter] = useState<"any" | "7d" | "30d">("any");
  const [sort, setSort] = useState<SortOption>("recent");
  const [error, setError] = useState("");

  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);
  const authors = useMemo(
    () => Array.from(new Set(posts.map((p) => p.author_name))).sort(),
    [posts]
  );

  const statusCounts = useMemo(
    () => ({
      all: posts.length,
      draft: posts.filter((p) => p.status === "draft").length,
      in_review: posts.filter((p) => p.status === "in_review").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      published: posts.filter((p) => p.status === "published").length,
    }),
    [posts]
  );

  const topPosts = useMemo(
    () => [...posts].sort((a, b) => b.views - a.views).slice(0, 3),
    [posts]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    const result = posts.filter((post) => {
      const matchesQuery = post.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryId === "all" || post.category_id === categoryId;
      const matchesStatus = statusTab === "all" || post.status === statusTab;
      const matchesAuthor = authorFilter === ANY_AUTHOR || post.author_name === authorFilter;
      const referenceDate = post.published_at ?? post.created_at;
      const ageDays = (now - new Date(referenceDate).getTime()) / 86_400_000;
      const matchesDate = dateFilter === "any" || (dateFilter === "7d" ? ageDays <= 7 : ageDays <= 30);
      return matchesQuery && matchesCategory && matchesStatus && matchesAuthor && matchesDate;
    });
    return [...result].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      const aDate = a.published_at ?? a.created_at;
      const bDate = b.published_at ?? b.created_at;
      return sort === "oldest" ? aDate.localeCompare(bDate) : bDate.localeCompare(aDate);
    });
  }, [posts, query, categoryId, statusTab, authorFilter, dateFilter, sort]);

  function clearFilters() {
    setQuery("");
    setCategoryId("all");
    setStatusTab("all");
    setAuthorFilter(ANY_AUTHOR);
    setDateFilter("any");
    setSort("recent");
  }

  async function handleDelete(post: BlogPostSummaryOut) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await deletePost(post.id);
    } catch (err) {
      setError(errorMessage(err, "Couldn't delete this post."));
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Blog posts</h1>
          <p className="text-sm text-muted-foreground">
            Plan, write and publish articles for the customer site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href="/blogs/categories" />}>
            Categories
          </Button>
          {can("blog", "create") && (
            <Button render={<Link href="/blogs/new" />}>
              <Plus data-icon="inline-start" />
              New post
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {topPosts.map((post, index) => (
          <Card key={post.id}>
            <CardContent className="flex items-start gap-3 pt-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-xs font-semibold text-navy">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {post.category_name ?? "Uncategorized"} · {post.views.toLocaleString()} reads
                </p>
              </div>
              <TrendingUp className="size-3.5 shrink-0 text-rating" />
            </CardContent>
          </Card>
        ))}
        {topPosts.length === 0 && (
          <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
            No posts yet.
          </p>
        )}
      </div>

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
          <CardTitle>All posts</CardTitle>
          <CardDescription>
            {filtered.length} of {posts.length} posts shown.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 py-3">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts…"
                className="pl-8"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
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
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "any" | "7d" | "30d")}
              className={selectClass}
              aria-label="Filter by date"
            >
              <option value="any">Any date</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
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
                  <th className="px-6 py-3 font-medium">Post</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Languages</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Reads</th>
                  <th className="px-6 py-3 font-medium">Comments</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((post) => {
                    const filledLanguages = 1 + post.translation_language_codes.length;
                    const totalLanguages = Math.max(activeLanguages.length, filledLanguages);
                    return (
                      <tr key={post.id} className="hover:bg-muted/40">
                        <td className="max-w-md px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-sm font-semibold text-navy">
                              {post.title.charAt(0)}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{post.title}</p>
                              <p className="truncate text-xs text-muted-foreground">/blog/{post.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{post.category_name ?? "—"}</td>
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
                                {initials(post.author_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">{post.author_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium text-foreground">
                          {post.views > 0 ? post.views.toLocaleString() : "—"}
                        </td>
                        <td className="px-6 py-3">
                          <Link
                            href={`/blogs/comments?post=${post.id}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-navy hover:underline"
                          >
                            <MessageSquare className="size-3.5" />
                            {post.comment_count}
                          </Link>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={statusVariant[post.status]} className={statusClassName[post.status]}>
                            {statusLabels[post.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {post.published_at ? post.published_at.slice(0, 10) : "—"}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {(can("blog", "edit") || can("blog", "delete")) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label="Post actions"
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" alignOffset={-8}>
                                {can("blog", "edit") && (
                                  <DropdownMenuItem render={<Link href={`/blogs/${post.id}/editor`} />}>
                                    <Pencil />
                                    Edit
                                  </DropdownMenuItem>
                                )}
                                {can("blog", "edit") && can("blog", "delete") && <DropdownMenuSeparator />}
                                {can("blog", "delete") && (
                                  <DropdownMenuItem
                                    variant="destructive"
                                    disabled={isMutating}
                                    onClick={() => handleDelete(post)}
                                  >
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
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-sm text-muted-foreground">
                      No posts match your filters.
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

export default function BlogsPage() {
  return (
    <PermissionGuard module="blog">
      <BlogPostsCatalog />
    </PermissionGuard>
  );
}
