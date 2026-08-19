import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { MessageSquare } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { BlogPostCard } from "@/components/blog/blog-post-card";
import { CommentsSection } from "@/components/blog/comments-section";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { NewsletterBanner } from "@/components/search/newsletter-banner";
import { api, resolveAssetUrl } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await api.blog.posts.get(slug).catch(() => null);
  if (!post) return {};
  return {
    title: post.meta_title || `${post.title} | Royal Vacation Blog`,
    description: post.meta_description || post.excerpt || undefined,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function computeReadTime(html: string) {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await api.blog.posts.get(slug).catch(() => null);
  if (!post) notFound();

  const [comments, relatedRaw] = await Promise.all([
    api.blog.comments.list(slug).catch(() => []),
    api.blog.posts.list({ category: post.category_slug ?? undefined, limit: 7 }).catch(() => []),
  ]);
  const related = relatedRaw.filter((p) => p.id !== post.id).slice(0, 6);

  const sanitizedContent = DOMPurify.sanitize(post.content);
  const readTime = computeReadTime(post.content);

  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pt-6 lg:px-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              ...(post.category_name && post.category_slug
                ? [{ label: post.category_name, href: `/blog?category=${post.category_slug}` }]
                : []),
              { label: post.title },
            ]}
          />
        </div>

        {post.cover_image_url ? (
          <div className="relative mt-4 h-[380px] w-full overflow-hidden bg-muted sm:h-[440px]">
            <Image
              src={resolveAssetUrl(post.cover_image_url)}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-8 lg:px-10">
                {post.category_name && post.category_slug && (
                  <Link
                    href={`/blog?category=${post.category_slug}`}
                    className="mb-3 inline-block rounded-full bg-gold px-3 py-1 text-xs font-semibold text-navy-dark"
                  >
                    {post.category_name}
                  </Link>
                )}
                <h1 className="max-w-3xl font-heading text-3xl font-bold text-white sm:text-4xl">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">{post.excerpt}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-4 max-w-[1400px] px-4 sm:px-6 lg:px-10">
            {post.category_name && post.category_slug && (
              <Link
                href={`/blog?category=${post.category_slug}`}
                className="mb-3 inline-block rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy"
              >
                {post.category_name}
              </Link>
            )}
            <h1 className="max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {post.excerpt}
              </p>
            )}
          </div>
        )}

        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
            <Avatar>
              <AvatarFallback className="bg-navy/10 font-semibold text-navy">
                {initials(post.author_name)}
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-semibold text-foreground">{post.author_name}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {post.published_at && <span>{formatDate(post.published_at)}</span>}
                <span>·</span>
                <span>{readTime} min read</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comment_count}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start">
            <article className="min-w-0 flex-1">
              <div
                className="prose prose-sm sm:prose-base max-w-none prose-blockquote:rounded-r-lg prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:font-heading prose-blockquote:text-lg prose-blockquote:text-navy prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />

              {post.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-white px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <CommentsSection slug={slug} comments={comments} />
            </article>

            {related.length > 0 && (
              <aside className="w-full shrink-0 lg:w-72">
                <div className="rounded-xl border border-border bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-navy">Related reads</h3>
                  <div className="space-y-4">
                    {related.slice(0, 3).map((p) => (
                      <BlogPostCard key={p.id} post={p} variant="compact" />
                    ))}
                  </div>
                </div>
              </aside>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-14 border-t border-border pt-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold text-navy">More from the blog</h2>
                <Link href="/blog" className="text-sm font-semibold text-gold hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.slice(0, 3).map((p) => (
                  <BlogPostCard key={p.id} post={p} variant="grid" />
                ))}
              </div>
            </div>
          )}

          <div className="mt-14">
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
