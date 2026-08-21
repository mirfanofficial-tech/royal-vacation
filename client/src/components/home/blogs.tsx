"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { useLatestBlogPostsQuery } from "@/lib/blog";

export function Blogs() {
  const { data: posts = [], isLoading } = useLatestBlogPostsQuery(4);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-2xl font-bold text-navy">Featured Blogs</h2>
        <Link href="/blog">
          <Button variant="outline" className="gap-1.5 rounded-full">
            View all articles
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <BlogPostCard key={post.id} post={post} variant="grid" />
          ))}
        </div>
      )}
    </section>
  );
}
