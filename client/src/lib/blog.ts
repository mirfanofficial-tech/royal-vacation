"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

export function useLatestBlogPostsQuery(limit: number) {
  return useQuery({
    queryKey: ["blog", "posts", "latest", limit],
    queryFn: () => api.blog.posts.list({ limit }),
  });
}
