"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheck,
  ExternalLink,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Newspaper,
  PanelBottom,
  TrendingUp,
} from "lucide-react";

import {
  contentHubDemoTypeCounts,
  contentHubNeedsReviewMock,
  contentHubRecentlyUpdated,
  type ContentHubItemType,
  type ContentHubStatus,
} from "@/lib/mock-data";
import { useCmsPagesQuery } from "@/lib/cms";
import { useBlogPostsQuery, useBlogCommentsQuery } from "@/lib/blog";
import { useMediaAssetsQuery } from "@/lib/media";
import { useLanguages } from "@/lib/reference";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PermissionGuard } from "@/components/permission-guard";
import { cn } from "@/lib/utils";

const CLIENT_SITE_URL = process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3002";

const typeMeta: Record<
  ContentHubItemType,
  { label: string; icon: typeof FileText; iconClass: string; dotClass: string }
> = {
  page: { label: "Page", icon: FileText, iconClass: "bg-navy/10 text-navy", dotClass: "bg-navy" },
  post: { label: "Post", icon: Newspaper, iconClass: "bg-gold/10 text-gold", dotClass: "bg-gold" },
  destination: {
    label: "Destination",
    icon: MapPin,
    iconClass: "bg-rating/10 text-rating",
    dotClass: "bg-rating",
  },
  banner: {
    label: "Banner",
    icon: PanelBottom,
    iconClass: "bg-rose-500/10 text-rose-600",
    dotClass: "bg-rose-500",
  },
  faq: {
    label: "FAQ",
    icon: HelpCircle,
    iconClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
  },
};

const statusMeta: Record<ContentHubStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Published", variant: "default" },
  draft: { label: "Draft", variant: "outline" },
  scheduled: { label: "Scheduled", variant: "secondary" },
  in_review: { label: "In review", variant: "secondary" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatMediaSize(sizeBytes: number) {
  const sizeKb = sizeBytes / 1024;
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb.toFixed(sizeKb < 10 ? 1 : 0)} KB`;
}

function ContentHub() {
  const { data: cmsPages } = useCmsPagesQuery();
  const { data: blogPosts } = useBlogPostsQuery();
  const { data: pendingComments } = useBlogCommentsQuery({ status: "pending" });
  const { data: mediaAssets } = useMediaAssetsQuery();
  const { languages } = useLanguages();

  const contentPages = useMemo(
    () => (cmsPages ?? []).filter((p) => p.page_type === "content"),
    [cmsPages]
  );
  const publishedPageCount = contentPages.filter((p) => p.status === "published").length;
  const activeLanguageCount = languages.filter((l) => l.is_active).length;

  const posts = blogPosts ?? [];
  const draftPostCount = posts.filter((p) => p.status === "draft").length;

  const pendingCommentCount = pendingComments?.length ?? 0;
  const mediaAssetCount = mediaAssets?.length ?? 0;
  const mediaTotalSizeBytes = (mediaAssets ?? []).reduce((sum, a) => sum + a.size_bytes, 0);

  const needsReviewItems = useMemo(() => {
    const items = [...contentHubNeedsReviewMock];
    if (pendingCommentCount > 0) {
      items.push({
        id: "pending-comments",
        title: `${pendingCommentCount} comment${pendingCommentCount === 1 ? "" : "s"} awaiting moderation`,
        sublabel: "Live count from the comments inbox",
        type: "faq" as ContentHubItemType,
      });
    }
    return items;
  }, [pendingCommentCount]);

  const byType = useMemo(
    () =>
      [
        { id: "media", label: "Media assets", count: mediaAssetCount },
        { id: "page", label: "Pages", count: contentPages.length },
        { id: "post", label: "Blog posts", count: posts.length },
        ...contentHubDemoTypeCounts,
      ].sort((a, b) => b.count - a.count),
    [contentPages.length, posts.length, mediaAssetCount]
  );
  const totalRecords = byType.reduce((sum, t) => sum + t.count, 0);
  const maxTypeCount = Math.max(...byType.map((t) => t.count), 1);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Content Hub</h1>
          <p className="text-sm text-muted-foreground">
            Everything published across royalvacation.com — {needsReviewItems.length} items are
            waiting for review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" render={<a href={CLIENT_SITE_URL} target="_blank" rel="noreferrer" />}>
            <ExternalLink data-icon="inline-start" />
            Preview site
          </Button>
          <Button variant="outline" size="sm" disabled title="Coming soon">
            <CalendarDays data-icon="inline-start" />
            Content calendar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-xs text-muted-foreground">
        <CircleCheck className="size-4 shrink-0 text-rating" />
        <span>
          <span className="font-medium text-foreground">Demo data</span> — Pages, Blog posts, Media
          assets and pending comments below are real. Destinations, Banners and FAQs have no
          backend yet, so those figures are mock.
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <FileText className="size-4" />
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-rating">
                <TrendingUp className="size-3" />
                +4
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{publishedPageCount}</p>
              <p className="text-sm text-muted-foreground">Published pages</p>
              <p className="text-xs text-muted-foreground">across {activeLanguageCount} languages</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
                <Newspaper className="size-4" />
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-rating">
                <TrendingUp className="size-3" />
                +7
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Blog posts</p>
              <p className="text-xs text-muted-foreground">{draftPostCount} drafts in progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-rating/10 text-rating">
                <ImageIcon className="size-4" />
              </span>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">
                {mediaAssetCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Media assets</p>
              <p className="text-xs text-muted-foreground">{formatMediaSize(mediaTotalSizeBytes)} total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600">
                <MessageSquare className="size-4" />
              </span>
              <Badge variant={pendingCommentCount > 0 ? "destructive" : "secondary"}>
                {pendingCommentCount > 0 ? "Review" : "Clear"}
              </Badge>
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{pendingCommentCount}</p>
              <p className="text-sm text-muted-foreground">Pending comments</p>
              <p className="text-xs text-muted-foreground">Awaiting moderation review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Recently updated</CardTitle>
              <CardDescription>Last 7 days across all content types</CardDescription>
            </div>
            <Button variant="ghost" size="sm" disabled title="Coming soon">
              View all
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Title</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium">Author</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contentHubRecentlyUpdated.map((item) => {
                    const meta = typeMeta[item.type];
                    const Icon = meta.icon;
                    const status = statusMeta[item.status];
                    return (
                      <tr key={item.id} className="hover:bg-muted/40">
                        <td className="max-w-xs px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                                meta.iconClass
                              )}
                            >
                              <Icon className="size-3.5" />
                            </span>
                            <p className="truncate font-medium text-foreground">{item.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span className={cn("size-1.5 rounded-full", meta.dotClass)} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar size="sm">
                              <AvatarFallback className="bg-navy/10 text-xs font-semibold text-navy">
                                {initials(item.author)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">{item.author}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{item.updatedLabel}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Needs review</CardTitle>
              <CardDescription>{needsReviewItems.length} items assigned to you</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {needsReviewItems.map((item) => {
                const meta = typeMeta[item.type];
                const Icon = meta.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.id === "pending-comments" ? "/blogs/comments?status=pending" : "/cms/pages"}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        meta.iconClass
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.sublabel}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content by type</CardTitle>
              <CardDescription>{totalRecords.toLocaleString()} records in the library</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {byType.map((t) => (
                <div key={t.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{t.label}</span>
                    <span className="font-semibold text-foreground">{t.count.toLocaleString()}</span>
                  </div>
                  <Progress value={(t.count / maxTypeCount) * 100} className="mt-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CmsHubPage() {
  return (
    <PermissionGuard module="cms">
      <ContentHub />
    </PermissionGuard>
  );
}
