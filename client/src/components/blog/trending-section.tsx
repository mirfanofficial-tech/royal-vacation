import Link from "next/link";

import type { BlogPostSummaryOut } from "@royal-vacation/api-client";

export function TrendingSection({ posts }: { posts: BlogPostSummaryOut[] }) {
  if (posts.length === 0) return null;

  return (
    <div className="rounded-2xl bg-muted/60 p-6 sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Trending this week</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The stories our readers kept coming back to
          </p>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
          Updated daily
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-4"
          >
            <span className="font-heading text-2xl font-bold text-gold">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold text-navy group-hover:underline">
                {post.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {post.category_name ?? "Journal"} · {post.reading_minutes} min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
