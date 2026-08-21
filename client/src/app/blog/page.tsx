import type { Metadata } from "next";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { NewsletterBanner } from "@/components/search/newsletter-banner";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { JournalHero } from "@/components/blog/journal-hero";
import { EditorsPick } from "@/components/blog/editors-pick";
import { TrendingSection } from "@/components/blog/trending-section";
import { JournalPagination } from "@/components/blog/journal-pagination";
import { SortSelect } from "@/components/blog/sort-select";
import { api } from "@/lib/api";

const PAGE_SIZE = 12;
const LATEST_COUNT = 8;

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
  const sort = firstParam(params.sort) === "views" ? "views" : "latest";
  const page = Math.max(1, Number(firstParam(params.page) ?? "1") || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const showEditorial = !category && !q && page === 1;

  const [categories, total, posts, highlights] = await Promise.all([
    api.blog.categories.list().catch(() => []),
    api.blog.posts.count({ category: category || undefined, q: q || undefined }).catch(() => ({ total: 0 })),
    api.blog.posts
      .list({ category: category || undefined, q: q || undefined, sort, limit: PAGE_SIZE, offset })
      .catch(() => []),
    showEditorial
      ? api.blog.posts.list({ sort: "views", limit: 4 }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const visiblePosts = posts.slice(0, PAGE_SIZE);
  const latestPosts = visiblePosts.slice(0, LATEST_COUNT);
  const morePosts = visiblePosts.slice(LATEST_COUNT, PAGE_SIZE);

  const editorsPick = highlights[0];
  const trending = editorsPick
    ? highlights.filter((post) => post.id !== editorsPick.id).slice(0, 3)
    : [];

  function pageHref(nextPage: number) {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (q) sp.set("q", q);
    if (sort !== "latest") sp.set("sort", sort);
    if (nextPage > 1) sp.set("page", String(nextPage));
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  function categoryHref(slug: string) {
    const sp = new URLSearchParams();
    if (slug) sp.set("category", slug);
    if (q) sp.set("q", q);
    if (sort !== "latest") sp.set("sort", sort);
    const qs = sp.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

          <div className="mt-4">
            <JournalHero
              articleCount={total.total}
              categoryCount={categories.length}
              category={category}
              q={q}
            />
          </div>

          {showEditorial && editorsPick && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Editor&apos;s pick
              </p>
              <EditorsPick post={editorsPick} />
            </div>
          )}

          <div className="mt-8 mb-6 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href={categoryHref("")}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  !category
                    ? "border-navy bg-navy text-white"
                    : "border-border bg-white text-muted-foreground hover:text-navy"
                }`}
              >
                All stories
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

            <div className="ml-auto">
              <SortSelect category={category || undefined} q={q || undefined} value={sort} />
            </div>
          </div>

          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-heading text-xl font-bold text-navy">Latest stories</h2>
            <p className="text-sm text-muted-foreground">
              Fresh from the road, updated every week
            </p>
          </div>

          {latestPosts.length === 0 ? (
            <div className="mt-4 rounded-xl border border-border bg-white px-4 sm:px-6 py-16 text-center text-sm text-muted-foreground">
              No articles found.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestPosts.map((post) => (
                <BlogPostCard key={post.id} post={post} variant="journal" />
              ))}
            </div>
          )}

          {trending.length > 0 && (
            <div className="mt-10">
              <TrendingSection posts={trending} />
            </div>
          )}

          {morePosts.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-baseline justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-navy">
                    More from the journal
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Guides, reviews and slow reads worth saving
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="text-sm font-medium text-navy hover:underline"
                >
                  See archive →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {morePosts.map((post) => (
                  <BlogPostCard key={post.id} post={post} variant="journal" />
                ))}
              </div>
            </div>
          )}

          {visiblePosts.length > 0 && (
            <div className="mt-10">
              <JournalPagination
                currentPage={page}
                pageSize={PAGE_SIZE}
                totalItems={total.total}
                visibleCount={visiblePosts.length}
                buildHref={pageHref}
              />
            </div>
          )}

          <div className="mt-10">
            <NewsletterBanner />
          </div>

          <div className="mt-10">
            <TrustBadgesRow variant="plain" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
