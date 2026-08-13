"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { useSeoAudit, type AuditedItem } from "@/lib/seo-audit";
import { useLanguages } from "@/lib/reference";
import { useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const CLIENT_SITE_URL = process.env.NEXT_PUBLIC_CLIENT_URL ?? "http://localhost:3002";
const ANY_LANGUAGE = "__any_language__";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const severityByCheck: Record<string, "critical" | "warning" | "info"> = {
  "Meta description": "critical",
  "Internal links": "critical",
  "Meta title": "warning",
  "Unique title": "warning",
  "Image alt text": "warning",
  "H1 heading": "warning",
  "Structured data": "info",
};

const severityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-gold/15 text-gold",
  info: "bg-muted text-muted-foreground",
};

function scoreColor(score: number) {
  if (score >= 80) return "bg-rating";
  if (score >= 50) return "bg-gold";
  return "bg-destructive";
}

function CheckIcon({ passed }: { passed: boolean }) {
  return passed ? (
    <CheckCircle2 className="size-4 text-rating" />
  ) : (
    <XCircle className="size-4 text-destructive" />
  );
}

function SeoManager() {
  const audit = useSeoAudit();
  const { languages } = useLanguages();
  const qc = useQueryClient();

  const [issueFilter, setIssueFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState(ANY_LANGUAGE);
  const [scannedAt, setScannedAt] = useState(() => new Date());
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);

  function hasLanguage(item: AuditedItem, code: string) {
    return code === "en" || item.translationLanguageCodes.includes(code);
  }

  const filtered = useMemo(() => {
    return audit.items.filter((item) => {
      const matchesIssue =
        issueFilter === "all" || item.checks.some((c) => c.key === issueFilter && !c.passed);
      const matchesLanguage = languageFilter === ANY_LANGUAGE || hasLanguage(item, languageFilter);
      return matchesIssue && matchesLanguage;
    });
  }, [audit.items, issueFilter, languageFilter]);

  async function handleRunAudit() {
    await qc.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    await qc.invalidateQueries({ queryKey: ["admin", "blog", "posts"] });
    setScannedAt(new Date());
  }

  async function handleVerifySitemap() {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch(`${CLIENT_SITE_URL}/sitemap.xml`, { cache: "no-store" });
      if (!res.ok) {
        setVerifyResult(`Sitemap returned ${res.status} — check the client site is running.`);
        return;
      }
      const xml = await res.text();
      const urlCount = (xml.match(/<url>/g) ?? []).length;
      setVerifyResult(`Reachable — ${urlCount} URL${urlCount === 1 ? "" : "s"} found.`);
    } catch {
      setVerifyResult("Couldn't reach the sitemap — is the client site running?");
    } finally {
      setVerifying(false);
    }
  }

  const sitemapUrlCount = audit.items.filter(
    (i) => i.status === "published" && (i.kind === "blog-post" || i.path.startsWith("/pages/"))
  ).length + 6; // + static routes

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">SEO Manager</h1>
          <p className="text-sm text-muted-foreground">
            Last scanned {formatDistanceToNowStrict(scannedAt, { addSuffix: true })} ·{" "}
            {audit.pagesScanned} pages scanned ·{" "}
            {audit.items.reduce((sum, i) => sum + i.issues.length, 0)} issues found
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<a href={`${CLIENT_SITE_URL}/sitemap.xml`} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink data-icon="inline-start" />
            View sitemap
          </Button>
          <Button variant="outline" size="sm" disabled title="Coming soon">
            Redirects
          </Button>
          <Button size="sm" onClick={handleRunAudit} disabled={audit.isLoading}>
            {audit.isLoading ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            Run audit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">{audit.averageScore}</p>
            <p className="text-sm text-muted-foreground">Average SEO score</p>
            <p className="text-xs text-muted-foreground">across {audit.pagesScanned} real pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-semibold text-foreground">{audit.pagesScanned}</p>
            <p className="text-sm text-muted-foreground">Pages scanned</p>
            <p className="text-xs text-muted-foreground">CMS pages + blog posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground">{audit.missingMetaCount}</p>
              {audit.missingMetaCount > 0 && (
                <Badge variant="outline" className="border-transparent bg-gold/15 text-gold">
                  Fix
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Missing meta data</p>
            <p className="text-xs text-muted-foreground">titles or descriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-2xl font-semibold text-foreground">{audit.brokenLinksTotal}</p>
              {audit.brokenLinksTotal > 0 && (
                <Badge variant="outline" className="border-transparent bg-destructive/10 text-destructive">
                  Urgent
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Pages with broken links</p>
            <p className="text-xs text-muted-foreground">internal links only</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardContent className="space-y-3 pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">Page audit</p>
                <p className="text-xs text-muted-foreground">Sorted by score, lowest first</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={issueFilter}
                  onChange={(e) => setIssueFilter(e.target.value)}
                  className={selectClass}
                  aria-label="Filter by issue"
                >
                  <option value="all">All issues</option>
                  <option value="meta_title">Meta title</option>
                  <option value="meta_description">Meta description</option>
                  <option value="h1">H1 heading</option>
                  <option value="alt_text">Image alt text</option>
                  <option value="broken_links">Internal links</option>
                  <option value="duplicate_title">Unique title</option>
                  <option value="structured_data">Structured data</option>
                </select>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className={selectClass}
                  aria-label="Filter by language"
                >
                  <option value={ANY_LANGUAGE}>All languages</option>
                  {activeLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {audit.isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Page</th>
                      <th className="px-3 py-2 font-medium">Score</th>
                      <th className="px-3 py-2 font-medium">Languages</th>
                      <th className="px-3 py-2 font-medium">Checks</th>
                      <th className="px-3 py-2 font-medium">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((item: AuditedItem) => {
                      const filledLanguages = item.translationLanguageCodes.length + 1;
                      const totalLanguages = Math.max(activeLanguages.length, filledLanguages);
                      const metaTitleCheck = item.checks.find((c) => c.key === "meta_title")!;
                      const metaDescCheck = item.checks.find((c) => c.key === "meta_description")!;
                      const brokenLinksCheck = item.checks.find((c) => c.key === "broken_links")!;
                      return (
                        <tr key={item.id} className="hover:bg-muted/40">
                          <td className="max-w-[220px] px-3 py-2.5">
                            <Link href={item.editHref} className="block truncate font-medium text-foreground hover:text-navy hover:underline">
                              {item.title}
                            </Link>
                            <p className="truncate text-xs text-muted-foreground">
                              royalvacation.com{item.path}
                            </p>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn("h-full rounded-full", scoreColor(item.score))}
                                  style={{ width: `${item.score}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-foreground">{item.score}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: totalLanguages }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={cn(
                                      "size-1.5 rounded-full",
                                      i < filledLanguages ? "bg-rating" : "bg-border"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {filledLanguages}/{totalLanguages}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <CheckIcon passed={metaTitleCheck.passed} />
                              <CheckIcon passed={metaDescCheck.passed} />
                              <CheckIcon passed={brokenLinksCheck.passed} />
                            </div>
                          </td>
                          <td className="max-w-[240px] px-3 py-2.5 text-xs text-muted-foreground">
                            {item.issues.length > 0 ? item.issues.join(" · ") : "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                          No pages match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-1 pt-4">
              <p className="text-sm font-semibold text-foreground">Issues by type</p>
              <p className="mb-2 text-xs text-muted-foreground">
                {audit.issueTypeCounts.reduce((s, i) => s + i.count, 0)} total ·{" "}
                {audit.issueTypeCounts.filter((i) => severityByCheck[i.label] === "critical").length}{" "}
                critical
              </p>
              {audit.issueTypeCounts.map((issue) => {
                const severity = severityByCheck[issue.label] ?? "info";
                return (
                  <div key={issue.label} className="flex items-center justify-between gap-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          severity === "critical"
                            ? "bg-destructive"
                            : severity === "warning"
                              ? "bg-gold"
                              : "bg-muted-foreground"
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{issue.label}</p>
                        <p className="text-xs text-muted-foreground">{issue.count} pages</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0 border-transparent capitalize", severityStyles[severity])}>
                      {severity}
                    </Badge>
                  </div>
                );
              })}
              {audit.issueTypeCounts.length === 0 && !audit.isLoading && (
                <p className="flex items-center gap-1.5 py-4 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-rating" />
                  No issues found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-4">
              <p className="text-sm font-semibold text-foreground">Sitemap &amp; indexing</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sitemap URL</span>
                  <a
                    href={`${CLIENT_SITE_URL}/sitemap.xml`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy hover:underline"
                  >
                    /sitemap.xml
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">URLs in sitemap</span>
                  <span className="font-medium text-foreground">{sitemapUrlCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Auto-generate sitemap</span>
                  <span className="flex items-center gap-1 font-medium text-rating">
                    <CheckCircle2 className="size-3.5" />
                    Always on
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Regenerated live from published pages and posts on every request &mdash; there&apos;s no
                separate &ldquo;submit to Google&rdquo; step available without Search Console access, which
                this app doesn&apos;t have configured.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={handleVerifySitemap} disabled={verifying}>
                {verifying ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
                Verify sitemap
              </Button>
              {verifyResult && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {verifyResult.startsWith("Reachable") ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-rating" />
                  ) : (
                    <AlertTriangle className="size-3.5 shrink-0 text-destructive" />
                  )}
                  {verifyResult}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CmsSeoPage() {
  return (
    <PermissionGuard module="cms">
      <SeoManager />
    </PermissionGuard>
  );
}
