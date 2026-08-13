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
  Lock,
  Save,
  Search,
} from "lucide-react";

import type {
  CmsPageCreate,
  CmsPageOut,
  CmsPageStatus,
  CmsPageTranslationValue,
  CmsPageUpdate,
} from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { useCmsPages } from "@/lib/cms";
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

const statusLabels: Record<CmsPageStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const NO_PARENT = "__no_parent__";

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

interface CmsPageEditorProps {
  initial?: CmsPageOut;
}

export function CmsPageEditor({ initial }: CmsPageEditorProps) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const isSystemPage = initial?.page_type === "system";
  const { pages, createPage, updatePage, uploadFeaturedImage } = useCmsPages();
  const { languages } = useLanguages();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [parentId, setParentId] = useState(initial?.parent_id ?? NO_PARENT);
  const [sortOrder, setSortOrder] = useState(String(initial?.sort_order ?? 0));
  const [status, setStatus] = useState<CmsPageStatus>(initial?.status ?? "draft");
  const [isHomepage, setIsHomepage] = useState(initial?.is_homepage ?? false);
  const [authorName, setAuthorName] = useState(initial?.author_name ?? "Royal Vacation Admin");
  const [metaTitle, setMetaTitle] = useState(initial?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(initial?.meta_description ?? "");

  const [translations, setTranslations] = useState<Record<string, CmsPageTranslationValue>>(
    initial?.translations ?? {}
  );

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [featuredImageError, setFeaturedImageError] = useState("");

  const [activeTab, setActiveTab] = useState("general");
  const [activeLanguage, setActiveLanguage] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const parentOptions = pages.filter((p) => p.id !== initial?.id);

  const translationLanguages = useMemo(
    () => languages.filter((l) => l.is_active && l.code !== "en"),
    [languages]
  );
  const currentLanguage = activeLanguage || translationLanguages[0]?.code || "";

  function setTranslationField(
    languageCode: string,
    field: keyof CmsPageTranslationValue,
    value: string
  ) {
    setTranslations((prev) => ({
      ...prev,
      [languageCode]: {
        title: prev[languageCode]?.title ?? "",
        excerpt: prev[languageCode]?.excerpt ?? "",
        content: prev[languageCode]?.content ?? "",
        meta_title: prev[languageCode]?.meta_title ?? "",
        meta_description: prev[languageCode]?.meta_description ?? "",
        [field]: value,
      },
    }));
  }

  const displayFeaturedImage =
    featuredImagePreview ??
    (initial?.featured_image_url ? resolveAssetUrl(initial.featured_image_url) : null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleFeaturedImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedImageError("");
    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const body = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        excerpt: excerpt.trim(),
        content,
        parent_id: isSystemPage ? null : parentId === NO_PARENT ? null : parentId,
        sort_order: Number(sortOrder) || 0,
        status,
        is_homepage: isSystemPage ? false : isHomepage,
        meta_title: metaTitle.trim(),
        meta_description: metaDescription.trim(),
        author_name: authorName.trim() || "Royal Vacation Admin",
        translations,
      };

      let pageId = initial?.id;
      if (isEdit && pageId) {
        await updatePage(pageId, body as CmsPageUpdate);
      } else {
        const created = await createPage(body as CmsPageCreate);
        pageId = created.id;
      }

      if (featuredImageFile && pageId) {
        try {
          await uploadFeaturedImage(pageId, featuredImageFile);
        } catch (err) {
          setFeaturedImageError(
            errorMessage(err, "Page saved, but the featured image failed to upload.")
          );
        }
      }

      if (!isEdit && pageId) {
        router.push(`/cms/pages/${pageId}/builder`);
      } else {
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save page."));
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
              {isSystemPage && (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
                  <Lock className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    Custom-design page — controls SEO for{" "}
                    <span className="font-mono text-foreground">{initial?.route_path}</span>. The
                    layout is a bespoke page in the client app, not rendered from CMS content.
                  </span>
                </div>
              )}
              <div>
                <label className={fieldLabel} htmlFor="page-title">
                  Title
                </label>
                <Input
                  id="page-title"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Us"
                  className="h-10 text-base"
                />
              </div>

              <div>
                <label className={fieldLabel} htmlFor="page-slug">
                  URL slug
                </label>
                <Input
                  id="page-slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="about-us"
                  className="font-mono text-sm"
                />
                <p className={fieldHint}>
                  {slug ? `royalvacation.com/pages/${slug}` : "Auto-generated from the title."}
                </p>
              </div>

              <div>
                <label className={fieldLabel} htmlFor="page-excerpt">
                  Excerpt
                </label>
                <textarea
                  id="page-excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Optional short summary…"
                  className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div>
                <span className={fieldLabel}>Featured image</span>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
                    {displayFeaturedImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={displayFeaturedImage}
                        alt="Featured"
                        className="size-full object-cover"
                      />
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
                      {displayFeaturedImage ? "Replace image" : "Upload image"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFeaturedImageChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      PNG, JPEG, WEBP or SVG, up to 2 MB.
                    </p>
                    {featuredImageError && (
                      <p className="text-xs text-destructive">{featuredImageError}</p>
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
                Controls how this page appears in search results.
              </p>
              <div>
                <label className={fieldLabel} htmlFor="page-meta-title">
                  Meta title
                </label>
                <Input
                  id="page-meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Title shown in search results"
                />
              </div>
              <div>
                <label className={fieldLabel} htmlFor="page-meta-description">
                  Meta description
                </label>
                <textarea
                  id="page-meta-description"
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
                        <label className={fieldLabel} htmlFor="translation-excerpt">
                          Excerpt
                        </label>
                        <textarea
                          id="translation-excerpt"
                          value={translations[currentLanguage]?.excerpt ?? ""}
                          onChange={(e) =>
                            setTranslationField(currentLanguage, "excerpt", e.target.value)
                          }
                          rows={2}
                          placeholder="Optional short summary…"
                          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                      </div>
                      <div>
                        <label className={fieldLabel}>Content</label>
                        <RichTextEditor
                          key={currentLanguage}
                          value={translations[currentLanguage]?.content ?? ""}
                          onChange={(html) => setTranslationField(currentLanguage, "content", html)}
                          placeholder="Type the content here!"
                        />
                      </div>
                      <div>
                        <label className={fieldLabel} htmlFor="translation-meta-title">
                          Meta title
                        </label>
                        <Input
                          id="translation-meta-title"
                          value={translations[currentLanguage]?.meta_title ?? ""}
                          onChange={(e) =>
                            setTranslationField(currentLanguage, "meta_title", e.target.value)
                          }
                          placeholder="Title shown in search results"
                        />
                      </div>
                      <div>
                        <label className={fieldLabel} htmlFor="translation-meta-description">
                          Meta description
                        </label>
                        <textarea
                          id="translation-meta-description"
                          value={translations[currentLanguage]?.meta_description ?? ""}
                          onChange={(e) =>
                            setTranslationField(
                              currentLanguage,
                              "meta_description",
                              e.target.value
                            )
                          }
                          rows={3}
                          placeholder="Short description shown under the title in search results"
                          className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
              <label className={fieldLabel} htmlFor="page-status">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus((value as CmsPageStatus) ?? "draft")}
              >
                <SelectTrigger id="page-status" className="w-full">
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

            {!isSystemPage && (
              <div>
                <label className={fieldLabel} htmlFor="page-parent">
                  Parent page
                </label>
                <Select value={parentId} onValueChange={(value) => setParentId(value ?? NO_PARENT)}>
                  <SelectTrigger id="page-parent" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PARENT}>No parent (top-level)</SelectItem>
                    {parentOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className={fieldLabel} htmlFor="page-sort-order">
                Sort order
              </label>
              <Input
                id="page-sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              <p className={fieldHint}>Lower numbers appear first among siblings.</p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="page-author">
                Author
              </label>
              <Input
                id="page-author"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
            </div>

            {!isSystemPage && (
              <>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={isHomepage}
                    onChange={(e) => setIsHomepage(e.target.checked)}
                    className="size-4 rounded border-input"
                  />
                  Use as homepage
                </label>
                <p className="-mt-3 text-xs text-muted-foreground">
                  Marks this as the site&apos;s homepage flag. Setting it here unsets any other
                  page flagged as homepage; the live homepage route isn&apos;t swapped
                  automatically.
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-end gap-2 pt-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" render={<Link href="/cms/pages" />}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!title.trim() || saving}>
                {saving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {isEdit ? "Update" : "Create page"}
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
