import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import type { BlogPostSummaryOut } from "@royal-vacation/api-client";
import { resolveAssetUrl } from "@/lib/api";
import { formatBlogDate, getAvatarColorClass, getInitials } from "@/lib/blog-format";

export function EditorsPick({ post }: { post: BlogPostSummaryOut }) {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-white lg:grid-cols-2">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted lg:aspect-auto">
        {post.cover_image_url && (
          <Image
            src={resolveAssetUrl(post.cover_image_url)}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        )}
        {post.category_name && (
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-navy shadow-sm">
            {post.category_name}
          </span>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 p-8">
        <span className="flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
          <Sparkles className="h-3.5 w-3.5" />
          Editor&apos;s pick
        </span>
        <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">{post.title}</h2>
        {post.excerpt && <p className="text-sm text-muted-foreground">{post.excerpt}</p>}

        <div className="flex items-center gap-3 pt-2">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColorClass(post.author_name)}`}
          >
            {getInitials(post.author_name)}
          </span>
          <div className="text-sm">
            <p className="font-medium text-foreground">{post.author_name}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {post.published_at && <span>{formatBlogDate(post.published_at, "long")}</span>}
              {post.published_at && <span>·</span>}
              <span>{post.reading_minutes} min read</span>
            </p>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-2 flex w-fit items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
        >
          Read the story
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
