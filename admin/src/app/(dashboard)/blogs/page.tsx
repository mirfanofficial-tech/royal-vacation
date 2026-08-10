"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  Copy,
  Eye,
  FileText,
  MoreHorizontal,
  Newspaper,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import {
  mockBlogPosts,
  type BlogStatus,
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

const statusVariant: Record<BlogStatus, "default" | "secondary" | "outline"> = {
  published: "default",
  draft: "outline",
  scheduled: "secondary",
};

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function BlogsPage() {
  const { categories } = useBlogCategories();
  const [posts, setPosts] = useState(mockBlogPosts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<"all" | BlogStatus>("all");

  const filtered = useMemo(
    () =>
      posts.filter((post) => {
        const matchesQuery = post.title
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesCategory =
          category === "all" || post.category === category;
        const matchesStatus = status === "all" || post.status === status;
        return matchesQuery && matchesCategory && matchesStatus;
      }),
    [posts, query, category, status]
  );

  const totalViews = posts.reduce((sum, post) => sum + post.views, 0);

  const stats = [
    {
      label: "Total posts",
      value: posts.length,
      icon: FileText,
    },
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
    {
      label: "Total views",
      value: totalViews.toLocaleString(),
      icon: Eye,
    },
  ];

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }

  function handleDuplicate(post: (typeof mockBlogPosts)[number]) {
    const copy = {
      ...post,
      id: `${post.id}_copy`,
      title: `${post.title} (copy)`,
      slug: `${post.slug}-copy`,
      status: "draft" as const,
      views: 0,
    };
    setPosts((prev) => [copy, ...prev]);
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
          <Button render={<Link href="/blogs/new" />}>
            <Plus data-icon="inline-start" />
            New post
          </Button>
        </div>
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
              aria-label="Filter by category"
            >
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "all" | BlogStatus)}
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
                  <th className="px-6 py-3 font-medium">Published</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((post) => (
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
                      {post.category}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {post.author}
                    </td>
                    <td className="px-6 py-3">
                      {post.views > 0 ? post.views.toLocaleString() : "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {post.publishedAt || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[post.status]}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label="Post actions"
                          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" alignOffset={-8}>
                          <DropdownMenuItem render={<Link href={`/blogs/${post.id}`} />}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(post)}>
                            <Copy />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleDelete(post.id)}
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
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
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
