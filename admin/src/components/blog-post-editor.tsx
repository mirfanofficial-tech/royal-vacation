"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  FileText,
  ImagePlus,
  Languages as LanguagesIcon,
  Loader2,
  Save,
  Search,
} from "lucide-react";

import type {
  BlogPostCreate,
  BlogPostOut,
  BlogPostStatus,
  BlogPostTranslationValue,
  BlogPostUpdate,
} from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { useBlogCategories, useBlogPosts } from "@/lib/blog";
import { useLanguages } from "@/lib/reference";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/rich-text-editor";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldHint = "mt-1 text-xs text-muted-foreground";

const statusLabels: Record<BlogPostStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
};

const UNCATEGORIZED = "__uncategorized__";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

interface BlogPostEditorProps {
  initial?: BlogPostOut;
}

export function BlogPostEditor({ initial }: BlogPostEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const { categories } = useBlogCategories();
  const { languages } = useLanguages();
  const { createPost, updatePost, uploadCoverImage } = useBlogPosts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? UNCATEGORIZED);
  const [status, setStatus] = useState<BlogPostStatus>(initial?.status ?? "draft");
  const [publishDate, setPublishDate] = useState(
    initial?.published_at ? initial.published_at.slice(0, 10) : ""
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [authorName, setAuthorName] = useState(initial?.author_name ?? "Royal Vacation Admin");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");

  const [translations, setTranslations] = useState<Record<string, BlogPostTranslationValue>>(
    initial?.translations ?? {}
  );

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageError, setCoverImageError] = useState("");

  const [activeTab, setActiveTab] = useState("general");
  const [activeLanguage, setActiveLanguage] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const translationLanguages = useMemo(
    () => languages.filter((l) => l.is_active && l.code !== "en"),
    [languages]
  );
  const currentLanguage = activeLanguage || translationLanguages[0]?.code || "";

  const displayCoverImage =
    coverImagePreview ?? (initial?.cover_image_url ? resolveAssetUrl(initial.cover_image_url) : null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageError("");
    setCoverImageFile(file);
    setCoverImagePreview(URL.createObjectURL(file));
  }

  function setTranslationField(languageCode: string, field: "title" | "content", value: string) {
    setTranslations((prev) => ({
      ...prev,
      [languageCode]: {
        title: prev[languageCode]?.title ?? "",
        content: prev[languageCode]?.content ?? "",
        [field]: value,
      },
    }));
  }

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        category_id: categoryId === UNCATEGORIZED ? null : categoryId,
        excerpt: excerpt.trim(),
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        author_name: authorName.trim() || "Royal Vacation Admin",
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        published_at: publishDate ? new Date(publishDate).toISOString() : null,
        translations,
      };

      let postId = initial?.id;
      if (isEdit && postId) {
        await updatePost(postId, body as BlogPostUpdate);
      } else {
        const created = await createPost(body as BlogPostCreate);
        postId = created.id;
      }

      if (coverImageFile && postId) {
        try {
          await uploadCoverImage(postId, coverImageFile);
        } catch (err) {
          setCoverImageError(errorMessage(err, "Post saved, but the cover image failed to upload."));
        }
      }

      if (!isEdit && postId) {
        router.push(`/blogs/${postId}`);
      } else {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save post."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-foreground/10">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as string) ?? "general")}
          >
            <TabsList className="px-4 pt-3">
              <TabsTab value="general">
                <FileText className="size-3.5" />
                General
              </TabsTab>
              <TabsTab value="seo">
                <Search className="size-3.5" />
                SEO
              </TabsTab>
              <TabsTab value="translations">
                <LanguagesIcon className="size-3.5" />
                Translations
              </TabsTab>
            </TabsList>

            <TabsPanel value="general" className="space-y-5 p-4">
              <div>
                <label className={fieldLabel} htmlFor="post-title">
                  Title
                </label>
                <Input
                  id="post-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Best Neighborhoods to Stay in Dubai in 2026"
                  className="h-10 text-base"
                />
              </div>

              <div>
                <label className={fieldLabel} htmlFor="post-slug">
                  URL slug
                </label>
                <Input
                  id="post-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="best-neighborhoods-to-stay-in-dubai"
                  className="font-mono text-sm"
                />
                <p className={fieldHint}>
                  {slug ? `royalvacation.com/blog/${slug}` : "Auto-generated from the title."}
                </p>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="post-excerpt">
                  Excerpt
                </label>
                <textarea
                  id="post-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Short summary shown on the blog listing page…"
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <span className={fieldLabel}>Cover image</span>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
                    {displayCoverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={displayCoverImage} alt="Cover" className="size-full object-cover" />
                    ) : (
                      <ImagePlus className="size-6 text-muted-foreground" />
                    )}
                  </span>
                  <div className="space-y-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus data-icon="inline-start" />
                      {displayCoverImage ? "Replace image" : "Upload image"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPEG, WEBP or SVG, up to 2 MB.
                    </p>
                    {coverImageError && (
                      <p className="text-xs text-destructive">{coverImageError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className={fieldLabel}>Content</label>
                <RichTextEditor value={content} onChange={setContent} />
              </div>
            </TabsPanel>

            <TabsPanel value="seo" className="space-y-5 p-4">
              <p className="text-sm text-muted-foreground">
                Controls how this post appears in search results.
              </p>
              <div>
                <label className={fieldLabel} htmlFor="post-meta-title">
                  Meta title
                </label>
                <Input
                  id="post-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Title shown in search results"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="post-meta-description">
                  Meta description
                </label>
                <textarea
                  id="post-meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Short description shown under the title in search results"
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </TabsPanel>

            <TabsPanel value="translations" className="p-4">
              {translationLanguages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active languages configured.</p>
              ) : (
                <>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 overflow-x-auto border-b border-border pb-2">
                    {translationLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setActiveLanguage(lang.code)}
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 border-b-2 border-transparent pb-2 text-sm font-medium transition-colors",
                          lang.code === currentLanguage
                            ? "border-navy text-navy"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            translations[lang.code]?.title || translations[lang.code]?.content
                              ? "bg-rating"
                              : "bg-border"
                          )}
                        />
                        {lang.native_name}
                      </button>
                    ))}
                  </div>

                  {currentLanguage && (
                    <div className="space-y-4 pt-4">
                      <div>
                        <label className={fieldLabel} htmlFor="translation-title">
                          Title
                        </label>
                        <Input
                          id="translation-title"
                          value={translations[currentLanguage]?.title ?? ""}
                          onChange={(e) =>
                            setTranslationField(currentLanguage, "title", e.target.value)
                          }
                          placeholder="Enter translation"
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Description</label>
                        <RichTextEditor
                          key={currentLanguage}
                          value={translations[currentLanguage]?.content ?? ""}
                          onChange={(html) => setTranslationField(currentLanguage, "content", html)}
                          placeholder="Type the content here!"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsPanel>
          </Tabs>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className={fieldLabel} htmlFor="post-status">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus((value as BlogPostStatus) ?? "draft")}
              >
                <SelectTrigger id="post-status" className="w-full">
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
              <label className={fieldLabel} htmlFor="post-date">
                Publish date
              </label>
              <Input
                id="post-date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
              <p className={fieldHint}>Leave empty to publish immediately.</p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="post-category">
                Category
              </label>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? UNCATEGORIZED)}>
                <SelectTrigger id="post-category" className="w-full">
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
              <label className={fieldLabel} htmlFor="post-tags">
                Tags
              </label>
              <Input
                id="post-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="dubai, guides, tips"
              />
              <p className={fieldHint}>Separate tags with commas.</p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="post-author">
                Author
              </label>
              <Input id="post-author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-end gap-2 pt-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" render={<Link href="/blogs" />}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim() || saving}>
                {saving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {isEdit ? "Update" : "Publish"}
                {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
              </Button>
            </div>
            {saveError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />
                {saveError}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
