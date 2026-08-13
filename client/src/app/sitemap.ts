import type { MetadataRoute } from "next";

import { api } from "@/lib/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";

const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/search", priority: 0.8, changeFrequency: "daily" },
  { path: "/blog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/login", priority: 0.2, changeFrequency: "yearly" },
  { path: "/register", priority: 0.2, changeFrequency: "yearly" },
  { path: "/wishlist", priority: 0.2, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, posts] = await Promise.all([
    api.cms.pages.list().catch(() => []),
    api.blog.posts.list().catch(() => []),
  ]);

  const pageEntries: MetadataRoute.Sitemap = pages
    .filter((page) => page.page_type === "content")
    .map((page) => ({
      url: `${SITE_URL}/pages/${page.slug}`,
      lastModified: page.updated_at,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticEntries, ...pageEntries, ...postEntries];
}
