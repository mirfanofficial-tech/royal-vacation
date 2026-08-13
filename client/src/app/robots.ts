import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3002";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/login", "/register", "/checkout", "/invoice", "/wishlist"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
