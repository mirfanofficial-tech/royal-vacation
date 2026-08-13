"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Eye,
  History,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  Send,
  Sparkles,
} from "lucide-react";

import type { BlogPostOut, BlogPostStatus, BlogPostUpdate } from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { useBlogCategories, useBlogPosts, useBlogPostRevisions } from "@/lib/blog";
import { useLanguages } from "@/lib/reference";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";
import { VersionHistoryPanel, type VersionHistoryField } from "@/components/version-history-panel";
import { SeoPanel } from "./seo-panel";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const UNCATEGORIZED = "__uncategorized__";
const AUTOSAVE_DELAY_MS = 4000;

const REVISION_FIELDS: VersionHistoryField[] = [
  { key: "title", label: "Title" },
  { key: "excerpt", label: "Excerpt" },
  { key: "content", label: "Content" },
  { key: "meta_title", label: "Meta title" },
  { key: "meta_description", label: "Meta description" },
  { key: "focus_keyword", label: "Focus keyword" },
  { key: "tags", label: "Tags" },
];

const statusLabels: Record<BlogPostStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  published: "Published",
  scheduled: "Scheduled",
};
const statusBadgeClass: Record<BlogPostStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  in_review: "bg-gold/15 text-gold",
  published: "bg-rating/10 text-rating",
  scheduled: "bg-sky-100 text-sky-600",
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function wordStats(html: string) {
  const text = stripHtml(html);
  const words = text ? text.split(" ").length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

interface TranslationValue {
  title: string;
  content: string;
}

export function BlogEditor({ post }: { post: BlogPostOut }) {
  const { categories } = useBlogCategories();
  const { updatePost, uploadCoverImage } = useBlogPosts();
  const { languages } = useLanguages();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    revisions,
    isLoading: revisionsLoading,
    getRevisionDetail,
    restoreRevision,
    isMutating: isRestoring,
  } = useBlogPostRevisions(post.id);
  const [historyOpen, setHistoryOpen] = useState(false);

  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);
  const translationLanguages = useMemo(
    () => activeLanguages.filter((l) => l.code !== "en"),
    [activeLanguages]
  );

  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [excerpt, setExcerpt] = useState(post.excerpt ?? "");
  const [content, setContent] = useState(post.content);
  const [categoryId, setCategoryId] = useState(post.category_id ?? UNCATEGORIZED);
  const [tags, setTags] = useState(post.tags.join(", "));
  const [status, setStatus] = useState<BlogPostStatus>(post.status);
  const [publishDate, setPublishDate] = useState(
    post.published_at ? post.published_at.slice(0, 10) : ""
  );
  const [authorName, setAuthorName] = useState(post.author_name);
  const [metaTitle, setMetaTitle] = useState(post.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(post.meta_description ?? "");
  const [focusKeyword, setFocusKeyword] = useState(post.focus_keyword ?? "");
  const [translations, setTranslations] = useState<Record<string, TranslationValue>>(() =>
    Object.fromEntries(
      Object.entries(post.translations).map(([code, value]) => [
        code,
        { title: value.title ?? "", content: value.content ?? "" },
      ])
    )
  );

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    post.cover_image_url ? resolveAssetUrl(post.cover_image_url) : null
  );
  const [coverImageError, setCoverImageError] = useState("");

  const [activeLanguage, setActiveLanguage] = useState("en");
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [autosaving, setAutosaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  function markDirty() {
    setIsDirty(true);
  }

  function updateTranslation(languageCode: string, patch: Partial<TranslationValue>) {
    setTranslations((prev) => ({
      ...prev,
      [languageCode]: {
        title: prev[languageCode]?.title ?? "",
        content: prev[languageCode]?.content ?? "",
        ...patch,
      },
    }));
    markDirty();
  }

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageError("");
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
    markDirty();
  }

  async function handleSave(options: { silent?: boolean; forceStatus?: BlogPostStatus } = {}) {
    const { silent = false, forceStatus } = options;
    const actionKey = forceStatus ?? "save";
    if (silent) setAutosaving(true);
    else setSaving(actionKey);
    setSaveError("");
    try {
      const resolvedStatus = forceStatus ?? status;
      const finalStatus: BlogPostStatus =
        resolvedStatus === "published" && publishDate && new Date(publishDate) > new Date()
          ? "scheduled"
          : resolvedStatus;

      const body: BlogPostUpdate = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        category_id: categoryId === UNCATEGORIZED ? null : categoryId,
        excerpt: excerpt.trim(),
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status: finalStatus,
        author_name: authorName.trim() || "Royal Vacation Admin",
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        focus_keyword: focusKeyword.trim(),
        published_at: publishDate ? new Date(publishDate).toISOString() : null,
        translations,
      };

      await updatePost(post.id, body, !silent);
      setStatus(finalStatus);

      if (coverImageFile) {
        try {
          await uploadCoverImage(post.id, coverImageFile);
          setCoverImageFile(null);
        } catch (err) {
          setCoverImageError(errorMessage(err, "Post saved, but the cover image failed to upload."));
        }
      }

      setIsDirty(false);
      setLastSavedAt(new Date());
      if (!silent) {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      if (!silent) setSaveError(errorMessage(err, "Failed to save post."));
    } finally {
      if (silent) setAutosaving(false);
      else setSaving(null);
    }
  }

  // Debounced real autosave — fires ~4s after the last edit while dirty,
  // keeping the current status untouched (never auto-publishes/auto-submits).
  useEffect(() => {
    if (!isDirty) return;
    const timer = window.setTimeout(() => {
      handleSave({ silent: true });
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDirty,
    title,
    slug,
    excerpt,
    content,
    categoryId,
    tags,
    metaTitle,
    metaDescription,
    focusKeyword,
    translations,
    publishDate,
    authorName,
  ]);

  // A restore rewrites fields this component initialized local state from at
  // mount — reload rather than try to reconcile every piece of local state.
  async function handleRestoreRevision(revisionId: string) {
    await restoreRevision(revisionId);
    window.location.reload();
  }

  const { words, minutes } = useMemo(() => wordStats(content), [content]);
  const isEditingBase = activeLanguage === "en";
  const currentTranslation = translations[activeLanguage] ?? { title: "", content: "" };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40">
      <header className="flex shrink-0 flex-wrap items-center gap-4 border-b border-border bg-white px-4 py-2.5">
        <Button variant="ghost" size="icon-sm" render={<Link href="/blogs" />} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{title || "Untitled post"}</p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                statusBadgeClass[status]
              )}
            >
              {statusLabels[status]}
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {autosaving
              ? "Saving…"
              : lastSavedAt
                ? `Autosaved ${formatDistanceToNowStrict(lastSavedAt, { addSuffix: true })}`
                : isDirty
                  ? "Unsaved changes"
                  : "All changes saved"}
            {" · "}
            {authorName} · {words.toLocaleString()} words · {minutes} min read
          </p>
        </div>

        <Button variant="outline" size="sm" disabled title="Live preview isn't wired up yet.">
          <Eye data-icon="inline-start" />
          Preview
        </Button>

        <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
          <History data-icon="inline-start" />
          History
        </Button>

        {status === "in_review" && (
          <Button
            variant="outline"
            size="sm"
            disabled={saving !== null}
            onClick={() => handleSave({ forceStatus: "draft" })}
          >
            {saving === "draft" ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <RotateCcw data-icon="inline-start" />
            )}
            Request changes
          </Button>
        )}

        <Button variant="outline" size="sm" disabled={saving !== null} onClick={() => handleSave()}>
          {saving === "save" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          Save
        </Button>

        {status === "draft" && (
          <Button disabled={saving !== null} onClick={() => handleSave({ forceStatus: "in_review" })}>
            {saving === "in_review" ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            Submit for review
          </Button>
        )}
        {status === "in_review" && (
          <Button disabled={saving !== null} onClick={() => handleSave({ forceStatus: "published" })}>
            {saving === "published" ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <CheckCircle2 data-icon="inline-start" />
            )}
            Approve &amp; publish
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        )}
        {(status === "published" || status === "scheduled") && (
          <Button disabled={saving !== null} onClick={() => handleSave({ forceStatus: status })}>
            {saving === status ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Update
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
          </Button>
        )}
      </header>

      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Translations</span>
        <div className="flex flex-wrap items-center gap-3">
          {["en", ...translationLanguages.map((l) => l.code)].map((code) => {
            const label = code === "en" ? "EN" : code.toUpperCase();
            const hasContent = code === "en" ? Boolean(title) : Boolean(translations[code]?.title);
            return (
              <button
                key={code}
                type="button"
                onClick={() => setActiveLanguage(code)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-colors",
                  activeLanguage === code ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    hasContent ? "bg-rating" : "bg-border",
                    activeLanguage === code && "bg-white"
                  )}
                />
                {label}
              </button>
            );
          })}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">
          {1 + Object.values(translations).filter((t) => t.title.trim()).length} of{" "}
          {activeLanguages.length} languages have content
        </span>
        <Button variant="outline" size="sm" disabled title="Coming soon">
          Request translation
        </Button>
      </div>

      {saveError && (
        <div className="flex items-center gap-1.5 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-5 p-6">
          {!isEditingBase && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Editing{" "}
              <span className="font-medium text-foreground">
                {translationLanguages.find((l) => l.code === activeLanguage)?.native_name ?? activeLanguage}
              </span>{" "}
              — title and content only; slug, excerpt, category, tags, SEO and schedule stay shared
              across languages.
            </div>
          )}

          <div>
            <label className={fieldLabel}>Title</label>
            <Input
              value={isEditingBase ? title : currentTranslation.title}
              onChange={(e) => {
                if (isEditingBase) {
                  setTitle(e.target.value);
                  markDirty();
                } else {
                  updateTranslation(activeLanguage, { title: e.target.value });
                }
              }}
              className="h-11 text-lg font-semibold"
              placeholder="Post title"
            />
          </div>

          {isEditingBase && (
            <>
              <div>
                <label className={fieldLabel}>URL slug</label>
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    markDirty();
                  }}
                  className="font-mono text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">royalvacation.com/blog/{slug || "…"}</p>
              </div>
              <div>
                <label className={fieldLabel}>Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => {
                    setExcerpt(e.target.value);
                    markDirty();
                  }}
                  rows={2}
                  placeholder="Optional short summary…"
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </>
          )}

          <div>
            <label className={fieldLabel}>Content</label>
            <RichTextEditor
              key={activeLanguage}
              value={isEditingBase ? content : currentTranslation.content}
              onChange={(html) => {
                if (isEditingBase) {
                  setContent(html);
                  markDirty();
                } else {
                  updateTranslation(activeLanguage, { content: html });
                }
              }}
              placeholder="Type the content here!"
            />
          </div>
        </div>

        <div className="w-80 shrink-0 space-y-4 overflow-y-auto border-l border-border bg-white p-4">
          <Card>
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm font-semibold text-foreground">Publish</p>
              <div>
                <label className={fieldLabel}>Status</label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus((v as BlogPostStatus) ?? "draft");
                    markDirty();
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={fieldLabel}>Publish on</label>
                <Input
                  type="date"
                  value={publishDate}
                  onChange={(e) => {
                    setPublishDate(e.target.value);
                    markDirty();
                  }}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  A future date auto-schedules instead of publishing immediately.
                </p>
              </div>
              <div>
                <label className={fieldLabel}>Author</label>
                <Input
                  value={authorName}
                  onChange={(e) => {
                    setAuthorName(e.target.value);
                    markDirty();
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 pt-4">
              <p className="text-sm font-semibold text-foreground">Featured image</p>
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                {coverImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverImagePreview} alt="Cover" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-6 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}>
                {coverImagePreview ? "Replace" : "Upload"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={handleCoverImageChange}
              />
              {coverImageError && <p className="text-xs text-destructive">{coverImageError}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-4">
              <p className="text-sm font-semibold text-foreground">Category &amp; tags</p>
              <div>
                <label className={fieldLabel}>Category</label>
                <Select
                  value={categoryId}
                  onValueChange={(v) => {
                    setCategoryId(v ?? UNCATEGORIZED);
                    markDirty();
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNCATEGORIZED}>Uncategorized</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className={fieldLabel}>Tags</label>
                <Input
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    markDirty();
                  }}
                  placeholder="beaches, budget, family"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <SeoPanel
                title={title}
                slug={slug}
                excerpt={excerpt}
                content={content}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                focusKeyword={focusKeyword}
                onMetaTitleChange={(v) => {
                  setMetaTitle(v);
                  markDirty();
                }}
                onMetaDescriptionChange={(v) => {
                  setMetaDescription(v);
                  markDirty();
                }}
                onFocusKeywordChange={(v) => {
                  setFocusKeyword(v);
                  markDirty();
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 pt-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Translations</p>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="size-3 text-gold" />
                  {1 + Object.values(translations).filter((t) => t.title.trim()).length}/
                  {activeLanguages.length}
                </span>
              </div>
              {translationLanguages.map((lang) => {
                const hasContent = Boolean(translations[lang.code]?.title);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLanguage(lang.code)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 text-left text-sm hover:bg-muted/60"
                  >
                    <span className="flex items-center gap-2 text-foreground">
                      <span className="w-6 text-xs text-muted-foreground">{lang.code.toUpperCase()}</span>
                      {lang.native_name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        hasContent ? "bg-rating/10 text-rating" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {hasContent ? "Published" : "Not started"}
                    </span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      <VersionHistoryPanel
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        entityLabel="post"
        revisions={revisions}
        isLoading={revisionsLoading}
        getRevisionDetail={getRevisionDetail}
        restoreRevision={handleRestoreRevision}
        isRestoring={isRestoring}
        currentFields={{
          title,
          excerpt,
          content,
          meta_title: metaTitle,
          meta_description: metaDescription,
          focus_keyword: focusKeyword,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }}
        fields={REVISION_FIELDS}
      />
    </div>
  );
}
