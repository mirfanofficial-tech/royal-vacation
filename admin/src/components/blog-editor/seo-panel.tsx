"use client";

import { useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function countInternalLinks(html: string) {
  const matches = html.match(/<a\s+[^>]*href=["']\/[^"']*["']/gi);
  return matches?.length ?? 0;
}

interface SeoCheck {
  label: string;
  detail: string;
  passed: boolean;
}

export function SeoPanel({
  title,
  slug,
  excerpt,
  content,
  metaTitle,
  metaDescription,
  focusKeyword,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onFocusKeywordChange,
}: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onFocusKeywordChange: (value: string) => void;
}) {
  const displayTitle = metaTitle || title;
  const displayDescription = metaDescription || excerpt;

  const { score, label, checks } = useMemo(() => {
    const internalLinks = countInternalLinks(content);
    const checkList: SeoCheck[] = [
      {
        label: "Meta title length",
        detail: `${displayTitle.length} / 60`,
        passed: displayTitle.length >= 50 && displayTitle.length <= 60,
      },
      {
        label: "Meta description length",
        detail: `${displayDescription.length} / 155`,
        passed: displayDescription.length >= 120 && displayDescription.length <= 155,
      },
      {
        label: "Focus keyword",
        detail: focusKeyword
          ? title.toLowerCase().includes(focusKeyword.toLowerCase())
            ? "In title"
            : "Not in title"
          : "Not set",
        passed: Boolean(focusKeyword) && title.toLowerCase().includes(focusKeyword.toLowerCase()),
      },
      {
        label: "Internal links",
        detail: `${internalLinks} — ${internalLinks === 0 ? "add one more" : "looks good"}`,
        passed: internalLinks >= 1,
      },
    ];
    const passedCount = checkList.filter((c) => c.passed).length;
    const computedScore = Math.round((passedCount / checkList.length) * 100);
    const computedLabel = computedScore >= 75 ? "Good" : computedScore >= 50 ? "OK" : "Needs work";
    return { score: computedScore, label: computedLabel, checks: checkList };
  }, [content, displayDescription, displayTitle, focusKeyword, title]);

  const scoreColor =
    score >= 75 ? "text-rating bg-rating/10" : score >= 50 ? "text-gold bg-gold/10" : "text-destructive bg-destructive/10";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Search preview</p>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", scoreColor)}>
          {label} · {score}
        </span>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="truncate text-xs text-muted-foreground">
          royalvacation.com › blog › {slug || "…"}
        </p>
        <p className="truncate text-sm font-medium text-[#1a0dab]">{displayTitle || "Untitled"}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">
          {displayDescription || "No description yet."}
        </p>
      </div>

      <div>
        <label className={fieldLabel}>Focus keyword</label>
        <Input
          value={focusKeyword}
          onChange={(e) => onFocusKeywordChange(e.target.value)}
          placeholder="e.g. hidden beaches maldives"
        />
      </div>
      <div>
        <label className={fieldLabel}>Meta title</label>
        <Input value={metaTitle} onChange={(e) => onMetaTitleChange(e.target.value)} />
      </div>
      <div>
        <label className={fieldLabel}>Meta description</label>
        <textarea
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="space-y-1.5 border-t border-border pt-3">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-foreground">
              {check.passed ? (
                <CheckCircle2 className="size-3.5 shrink-0 text-rating" />
              ) : (
                <Circle className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              {check.label}
            </span>
            <span className="text-muted-foreground">{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
