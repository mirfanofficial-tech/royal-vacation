import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

import type { BlogPostSummaryOut } from "@royal-vacation/api-client";
import { resolveAssetUrl } from "@/lib/api";

function formatDate(iso: string, style: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: style,
    day: "numeric",
  });
}

export function BlogPostCard({
  post,
  variant = "grid",
}: {
  post: BlogPostSummaryOut;
  variant?: "grid" | "minimal" | "compact";
}) {
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
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
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
        {post.category_name && (
          <span className="w-fit rounded-full bg-navy/10 px-2.5 py-0.5 text-xs font-medium text-navy">
            {post.category_name}
          </span>
        )}
        <h2 className="line-clamp-2 font-heading text-base font-semibold text-navy group-hover:underline">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {post.published_at && <span>{formatDate(post.published_at)}</span>}
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count}
          </span>
        </div>
      </div>
    </Link>
  );
}
