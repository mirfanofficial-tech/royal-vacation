"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import type { BlogPostStatus, BlogPostSummaryOut } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useBlogCategories, useBlogPosts } from "@/lib/blog";
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

const statusVariant: Record<BlogPostStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "outline",
  scheduled: "secondary",
};

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function BlogPostsCatalog() {
  const { categories } = useBlogCategories();
  const { posts, isLoading, deletePost, isMutating } = useBlogPosts();
  const { can } = usePermissions();

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState<"all" | BlogPostStatus>("all");
  const [error, setError] = useState("");

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const matchesQuery = post.title.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = categoryId === "all" || post.category_id === categoryId;
        const matchesStatus = status === "all" || post.status === status;
        return matchesQuery && matchesCategory && matchesStatus;
      }),
    [posts, query, categoryId, status]
  );

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

  const stats = [
    { label: "Total posts", value: posts.length, icon: FileText },
    {
      label: "Published",
      value: posts.filter((p) => p.status === "published").length,
      icon: Newspaper,
    },
    {
      label: "Scheduled",
      value: posts.filter((p) => p.status === "scheduled").length,
      icon: CalendarClock,
    },
    { label: "Total views", value: totalViews.toLocaleString(), icon: Eye },
  ];

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
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
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | BlogPostStatus)}
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Post</th>
                  <th className="px-6 py-3 font-medium">Category</th>
                  <th className="px-6 py-3 font-medium">Author</th>
                  <th className="px-6 py-3 font-medium">Views</th>
                  <th className="px-6 py-3 font-medium">Comments</th>
                  <th className="px-6 py-3 font-medium">Published</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  filtered.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/40">
                      <td className="max-w-md px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-sm font-semibold text-navy">
                            {post.title.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium">{post.title}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              /blog/{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {post.category_name ?? "—"}
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{post.author_name}</td>
                      <td className="px-6 py-3">
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
                      <td className="px-6 py-3 text-muted-foreground">
                        {post.published_at ? post.published_at.slice(0, 10) : "—"}
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={statusVariant[post.status]}>{post.status}</Badge>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {can("blog", "edit") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Edit"
                              render={<Link href={`/blogs/${post.id}`} />}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          )}
                          {can("blog", "delete") && (
                            <Button
                              variant="outline"
                              size="icon-sm"
                              aria-label="Delete"
                              disabled={isMutating}
                              onClick={() => handleDelete(post)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-sm text-muted-foreground">
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
