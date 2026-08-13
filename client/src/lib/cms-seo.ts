import type { Metadata } from "next";
import type { CmsPageOut } from "@royal-vacation/api-client";

import { api } from "@/lib/api";

export async function getRouteSeo(path: string): Promise<CmsPageOut | null> {
  return api.cms.pages.getByRoute(path).catch(() => null);
}

export function mergeRouteSeoMetadata(
  routeSeo: CmsPageOut | null,
  fallback: Metadata
): Metadata {
  return {
    ...fallback,
    title: routeSeo?.meta_title || fallback.title,
    description: routeSeo?.meta_description || fallback.description,
  };
}
