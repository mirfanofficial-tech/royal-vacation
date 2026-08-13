"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";

import type { BlogPostOut, CmsPageOut } from "@royal-vacation/api-client";
import { api, callApi } from "@/lib/api";
import { useCmsPagesQuery } from "@/lib/cms";
import { useBlogPostsQuery } from "@/lib/blog";

// Every real, static client route an internal link could legitimately point
// at, beyond the slug-based CMS page / blog post routes computed below.
const STATIC_ROUTES = ["/", "/search", "/blog", "/login", "/register", "/wishlist"];

export type AuditKind = "cms-page" | "blog-post";

export interface AuditCheck {
  key: string;
  label: string;
  passed: boolean;
}

export interface AuditedItem {
  id: string;
  kind: AuditKind;
  title: string;
  path: string;
  editHref: string;
  status: string;
  translationLanguageCodes: string[];
  score: number;
  checks: AuditCheck[];
  issues: string[];
}

function internalLinksIn(html: string): string[] {
  const matches = [...html.matchAll(/<a\s+[^>]*href=["'](\/[^"'#?]*)/gi)];
  return matches.map((m) => m[1]);
}

function imagesMissingAltCount(html: string): number {
  const imgs = [...html.matchAll(/<img\s+[^>]*>/gi)];
  return imgs.filter((m) => !/alt=["'][^"']+["']/i.test(m[0])).length;
}

export function useSeoAudit() {
  const { data: pageSummaries = [] } = useCmsPagesQuery();
  const { data: postSummaries = [] } = useBlogPostsQuery();

  const pageDetailQueries = useQueries({
    queries: pageSummaries.map((p) => ({
      queryKey: ["admin", "cms", "pages", "detail", p.id],
      queryFn: () => callApi(() => api.admin.cms.pages.get(p.id)),
    })),
  });
  const postDetailQueries = useQueries({
    queries: postSummaries.map((p) => ({
      queryKey: ["admin", "blog", "posts", "detail", p.id],
      queryFn: () => callApi(() => api.admin.blog.posts.get(p.id)),
    })),
  });

  const isLoading =
    (pageSummaries.length > 0 && pageDetailQueries.some((q) => q.isLoading)) ||
    (postSummaries.length > 0 && postDetailQueries.some((q) => q.isLoading));

  const pages = pageDetailQueries.map((q) => q.data).filter((p): p is CmsPageOut => Boolean(p));
  const posts = postDetailQueries.map((q) => q.data).filter((p): p is BlogPostOut => Boolean(p));

  return useMemo(() => {
    const knownPaths = new Set<string>(STATIC_ROUTES);
    for (const page of pages) {
      if (page.page_type === "content") knownPaths.add(`/pages/${page.slug}`);
    }
    for (const post of posts) {
      knownPaths.add(`/blog/${post.slug}`);
    }

    const titleCounts = new Map<string, number>();
    for (const page of pages) titleCounts.set(page.title, (titleCounts.get(page.title) ?? 0) + 1);
    for (const post of posts) titleCounts.set(post.title, (titleCounts.get(post.title) ?? 0) + 1);

    function audit(
      kind: AuditKind,
      id: string,
      title: string,
      path: string,
      editHref: string,
      status: string,
      translationLanguageCodes: string[],
      metaTitle: string | null | undefined,
      metaDescription: string | null | undefined,
      excerpt: string | null | undefined,
      content: string
    ): AuditedItem {
      const effectiveMetaTitle = metaTitle || title;
      const effectiveMetaDescription = metaDescription || excerpt || "";
      const brokenLinks = internalLinksIn(content).filter((href) => !knownPaths.has(href));
      const missingAltCount = imagesMissingAltCount(content);

      const checks: AuditCheck[] = [
        {
          key: "meta_title",
          label: "Meta title",
          passed: effectiveMetaTitle.length >= 50 && effectiveMetaTitle.length <= 60,
        },
        {
          key: "meta_description",
          label: "Meta description",
          passed: effectiveMetaDescription.length >= 120 && effectiveMetaDescription.length <= 155,
        },
        { key: "h1", label: "H1 heading", passed: /<h1[\s>]/i.test(content) },
        { key: "alt_text", label: "Image alt text", passed: missingAltCount === 0 },
        { key: "broken_links", label: "Internal links", passed: brokenLinks.length === 0 },
        {
          key: "duplicate_title",
          label: "Unique title",
          passed: (titleCounts.get(title) ?? 1) <= 1,
        },
        {
          key: "structured_data",
          label: "Structured data",
          passed: /application\/ld\+json/i.test(content),
        },
      ];

      const issues: string[] = [];
      if (!checks[0].passed) {
        issues.push(metaTitle ? "Meta title length isn't ideal (aim for 50–60 characters)" : "No meta title set");
      }
      if (!checks[1].passed) {
        issues.push(
          metaDescription
            ? "Meta description length isn't ideal (aim for 120–155 characters)"
            : "No meta description set"
        );
      }
      if (!checks[2].passed) issues.push("Missing H1");
      if (!checks[3].passed) {
        issues.push(`${missingAltCount} image${missingAltCount === 1 ? "" : "s"} missing alt text`);
      }
      if (!checks[4].passed) {
        issues.push(`${brokenLinks.length} broken internal link${brokenLinks.length === 1 ? "" : "s"}`);
      }
      if (!checks[5].passed) issues.push("Duplicate title with another page");
      if (!checks[6].passed) issues.push("No structured data");

      const score = Math.round((checks.filter((c) => c.passed).length / checks.length) * 100);

      return {
        id,
        kind,
        title,
        path,
        editHref,
        status,
        translationLanguageCodes,
        score,
        checks,
        issues,
      };
    }

    const auditedPages = pages.map((page) =>
      audit(
        "cms-page",
        page.id,
        page.title,
        page.page_type === "system" ? page.route_path ?? "" : `/pages/${page.slug}`,
        `/cms/pages/${page.id}/builder`,
        page.status,
        page.translation_language_codes,
        page.meta_title,
        page.meta_description,
        page.excerpt,
        page.content
      )
    );
    const auditedPosts = posts.map((post) =>
      audit(
        "blog-post",
        post.id,
        post.title,
        `/blog/${post.slug}`,
        `/blogs/${post.id}/editor`,
        post.status,
        post.translation_language_codes,
        post.meta_title,
        post.meta_description,
        post.excerpt,
        post.content
      )
    );

    const items = [...auditedPages, ...auditedPosts].sort((a, b) => a.score - b.score);
    const averageScore = items.length
      ? Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length)
      : 0;
    const missingMetaCount = items.filter(
      (i) =>
        !i.checks.find((c) => c.key === "meta_title")?.passed ||
        !i.checks.find((c) => c.key === "meta_description")?.passed
    ).length;
    const brokenLinksTotal = items.reduce(
      (sum, i) => sum + (i.checks.find((c) => c.key === "broken_links")?.passed ? 0 : 1),
      0
    );

    const issueTypeCounts = new Map<string, number>();
    for (const item of items) {
      for (const check of item.checks) {
        if (!check.passed) {
          issueTypeCounts.set(check.label, (issueTypeCounts.get(check.label) ?? 0) + 1);
        }
      }
    }

    return {
      isLoading,
      items,
      averageScore,
      pagesScanned: items.length,
      missingMetaCount,
      brokenLinksTotal,
      issueTypeCounts: Array.from(issueTypeCounts.entries()).map(([label, count]) => ({
        label,
        count,
      })),
    };
  }, [pages, posts, isLoading]);
}
