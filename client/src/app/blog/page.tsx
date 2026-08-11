import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { api } from "@/lib/api";

const PAGE_SIZE = 12;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const category = firstParam(params.category);
  return {
    title: category ? `${category} articles | Royal Vacation Blog` : "Blog | Royal Vacation",
    description: "Travel guides, tips and stories from the Royal Vacation team.",
  };
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = firstParam(params.category) ?? "";
  const q = firstParam(params.q) ?? "";
  const page = Math.max(1, Number(firstParam(params.page) ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [categories, posts] = await Promise.all([
    api.blog.categories.list().catch(() => []),
    api.blog.posts
      .list({
        category: category || undefined,
        q: q || undefined,
        limit: PAGE_SIZE,
        offset,
      })
      .catch(() => []),
  ]);

  const hasNextPage = posts.length > PAGE_SIZE;
  const visiblePosts = posts.slice(0, PAGE_SIZE);

  function pageHref(nextPage: number) {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (q) sp.set("q", q);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  function categoryHref(slug: string) {
    const sp = new URLSearchParams();
    if (slug) sp.set("category", slug);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-6 py-6 lg:px-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

          <div className="mt-4 mb-6">
            <h1 className="font-heading text-3xl font-bold text-navy">Royal Vacation Blog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Travel guides, tips and stories from our team.
            </p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={categoryHref("")}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  !category
                    ? "border-navy bg-navy text-white"
                    : "border-border bg-white text-muted-foreground hover:text-navy"
                }`}
              >
                All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={categoryHref(cat.slug)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    category === cat.slug
                      ? "border-navy bg-navy text-white"
                      : "border-border bg-white text-muted-foreground hover:text-navy"
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <form action="/blog" method="get" className="ml-auto flex w-full max-w-xs items-center">
              {category && <input type="hidden" name="category" value={category} />}
              <div className="relative w-full">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Search articles…"
                  className="w-full rounded-full border border-border bg-white py-2 pr-3 pl-9 text-sm outline-none focus:border-navy"
                />
              </div>
            </form>
          </div>

          {visiblePosts.length === 0 ? (
            <div className="rounded-xl border border-border bg-white px-6 py-16 text-center text-sm text-muted-foreground">
              No articles found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((post) => (
                <BlogPostCard key={post.id} post={post} variant="grid" />
              ))}
            </div>
          )}

          {(page > 1 || hasNextPage) && (
            <div className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}
              <span className="text-sm text-muted-foreground">Page {page}</span>
              {hasNextPage ? (
                <Link
                  href={pageHref(page + 1)}
                  className="flex items-center gap-1 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-navy hover:bg-muted"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
