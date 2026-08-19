"use client";

import { Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { useLatestBlogPostsQuery } from "@/lib/blog";

export function Blogs() {
  const { data: posts = [], isLoading } = useLatestBlogPostsQuery(4);

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
      <div className="mb-5">
        <h2 className="font-heading text-2xl font-bold text-navy">Featured Blogs</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Carousel opts={{ align: "start" }} className="px-1">
          <CarouselContent>
            {posts.map((post) => (
              <CarouselItem key={post.id} className="sm:basis-1/2 lg:basis-1/4">
                <BlogPostCard post={post} variant="minimal" />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden left-2 lg:flex" />
          <CarouselNext className="hidden right-2 lg:flex" />
        </Carousel>
      )}
    </section>
  );
}
