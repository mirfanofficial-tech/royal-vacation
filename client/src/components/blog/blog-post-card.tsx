import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { BlogPostSummaryOut } from "@royal-vacation/api-client";
import { resolveAssetUrl } from "@/lib/api";
import { formatBlogDate as formatDate, getAvatarColorClass, getInitials } from "@/lib/blog-format";

export function BlogPostCard({
  post,
  variant = "grid",
}: {
  post: BlogPostSummaryOut;
  variant?: "grid" | "minimal" | "compact" | "journal";
}) {
  if (variant === "journal") {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {post.cover_image_url && (
            <Image
              src={resolveAssetUrl(post.cover_image_url)}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          )}
          {post.category_name && (
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-navy shadow-sm">
              {post.category_name}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs text-muted-foreground">
            {post.published_at && formatDate(post.published_at)}
            {post.published_at && " · "}
            {post.reading_minutes} min read
          </p>
          <h3 className="line-clamp-2 font-heading text-base font-semibold text-navy group-hover:underline">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${getAvatarColorClass(post.author_name)}`}
              >
                {getInitials(post.author_name)}
              </span>
              <span className="truncate text-xs font-medium text-foreground">
                {post.author_name}
              </span>
            </div>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors group-hover:border-navy group-hover:text-navy">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {post.cover_image_url && (
            <Image
              src={resolveAssetUrl(post.cover_image_url)}
              alt={post.title}
              fill
              className="object-cover"
              sizes="56px"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium text-navy group-hover:underline">
            {post.title}
          </p>
          {post.published_at && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatDate(post.published_at)}
            </p>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "minimal") {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {post.cover_image_url && (
            <Image
              src={resolveAssetUrl(post.cover_image_url)}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          )}
        </div>
        <h3 className="line-clamp-2 font-heading text-base font-semibold text-navy group-hover:underline">
          {post.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {post.published_at ? formatDate(post.published_at, "long") : ""}
        </p>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {post.cover_image_url && (
          <Image
            src={resolveAssetUrl(post.cover_image_url)}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs">
          {post.category_name && (
            <span className="font-bold uppercase tracking-wide text-gold">
              {post.category_name}
            </span>
          )}
          {post.category_name && <span className="text-muted-foreground">&middot;</span>}
          <span className="text-muted-foreground">{post.reading_minutes} min read</span>
        </div>
        <h2 className="line-clamp-2 font-heading text-lg font-bold text-navy group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-semibold text-navy">
          Learn More
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
