"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Eye,
  Info,
  Loader2,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  UploadCloud,
} from "lucide-react";

import type {
  CmsPageOut,
  CmsPageStatus,
  CmsPageSummaryOut,
  CmsPageUpdate,
} from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { useCmsPages } from "@/lib/cms";
import { useLanguages } from "@/lib/reference";
import {
  createDefaultBlocks,
  createBlock,
  type BuilderBlock,
  type BuilderBlockType,
} from "@/lib/page-builder-types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BlockPalette } from "./block-palette";
import { Canvas } from "./canvas";
import { BlockInspector, NO_PARENT, type PageFieldsState } from "./block-inspector";

const deviceWidths: Record<string, string> = {
  desktop: "max-w-none",
  tablet: "max-w-[768px] mx-auto",
  mobile: "max-w-[390px] mx-auto",
};

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

interface TranslationFieldValue {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
}

export function PageBuilder({
  page,
  parentOptions,
}: {
  page: CmsPageOut;
  parentOptions: CmsPageSummaryOut[];
}) {
  const { updatePage, uploadFeaturedImage } = useCmsPages();
  const { languages } = useLanguages();

  const [blocks, setBlocks] = useState<BuilderBlock[]>(() => createDefaultBlocks());
  const [past, setPast] = useState<BuilderBlock[][]>([]);
  const [future, setFuture] = useState<BuilderBlock[][]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState("block");
  const [device, setDevice] = useState<keyof typeof deviceWidths>("desktop");
  const [activeLanguage, setActiveLanguage] = useState("en");

  const [baseFields, setBaseFields] = useState({
    title: page.title,
    slug: page.slug,
    status: page.status as CmsPageStatus,
    parentId: page.parent_id ?? NO_PARENT,
    isHomepage: page.is_homepage,
    excerpt: page.excerpt ?? "",
    metaTitle: page.meta_title ?? "",
    metaDescription: page.meta_description ?? "",
  });
  const [translationFields, setTranslationFields] = useState<Record<string, TranslationFieldValue>>(
    () =>
      Object.fromEntries(
        Object.entries(page.translations).map(([code, value]) => [
          code,
          {
            title: value.title ?? "",
            excerpt: value.excerpt ?? "",
            metaTitle: value.meta_title ?? "",
            metaDescription: value.meta_description ?? "",
          },
        ])
      )
  );

  const [authorName, setAuthorName] = useState(page.author_name);
  const [sortOrder, setSortOrder] = useState(String(page.sort_order));
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(
    page.featured_image_url ? resolveAssetUrl(page.featured_image_url) : null
  );
  const [featuredImageError, setFeaturedImageError] = useState("");

  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;

  const isDirty =
    baseFields.title !== page.title ||
    baseFields.slug !== page.slug ||
    baseFields.status !== page.status ||
    baseFields.parentId !== (page.parent_id ?? NO_PARENT) ||
    baseFields.isHomepage !== page.is_homepage ||
    baseFields.excerpt !== (page.excerpt ?? "") ||
    baseFields.metaTitle !== (page.meta_title ?? "") ||
    baseFields.metaDescription !== (page.meta_description ?? "") ||
    authorName !== page.author_name ||
    sortOrder !== String(page.sort_order) ||
    Boolean(featuredImageFile) ||
    Object.entries(translationFields).some(([code, v]) => {
      const original = page.translations[code];
      return (
        v.title !== (original?.title ?? "") ||
        v.excerpt !== (original?.excerpt ?? "") ||
        v.metaTitle !== (original?.meta_title ?? "") ||
        v.metaDescription !== (original?.meta_description ?? "")
      );
    });

  function commitBlocks(next: BuilderBlock[]) {
    setPast((p) => [...p, blocks]);
    setFuture([]);
    setBlocks(next);
  }

  function handleUndo() {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [blocks, ...f]);
    setBlocks(previous);
  }

  function handleRedo() {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setPast((p) => [...p, blocks]);
    setBlocks(next);
  }

  function handleAddBlock(type: BuilderBlockType) {
    commitBlocks([...blocks, createBlock(type)]);
  }

  function handleInsertBlock(type: BuilderBlockType, index: number) {
    const next = [...blocks];
    next.splice(index, 0, createBlock(type));
    commitBlocks(next);
  }

  function handleDeleteBlock(id: string) {
    commitBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function handleDuplicateBlock(id: string) {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const duplicate = { ...blocks[index], id: createBlock(blocks[index].type).id };
    const next = [...blocks];
    next.splice(index + 1, 0, duplicate);
    commitBlocks(next);
  }

  function handleMoveBlock(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex || fromIndex + 1 === toIndex) return;
    const next = [...blocks];
    const [moved] = next.splice(fromIndex, 1);
    const adjustedIndex = fromIndex < toIndex ? toIndex - 1 : toIndex;
    next.splice(adjustedIndex, 0, moved);
    commitBlocks(next);
  }

  function handlePatchBlock(patch: Record<string, unknown>) {
    if (!selectedBlockId) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === selectedBlockId ? ({ ...b, props: { ...b.props, ...patch } } as BuilderBlock) : b))
    );
  }

  function handlePageFieldsChange(patch: Partial<PageFieldsState>) {
    if (activeLanguage === "en") {
      setBaseFields((prev) => ({
        ...prev,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
        ...(patch.status !== undefined ? { status: patch.status } : {}),
        ...(patch.parentId !== undefined ? { parentId: patch.parentId } : {}),
        ...(patch.isHomepage !== undefined ? { isHomepage: patch.isHomepage } : {}),
        ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
        ...(patch.metaTitle !== undefined ? { metaTitle: patch.metaTitle } : {}),
        ...(patch.metaDescription !== undefined ? { metaDescription: patch.metaDescription } : {}),
      }));
    } else {
      setTranslationFields((prev) => ({
        ...prev,
        [activeLanguage]: {
          title: prev[activeLanguage]?.title ?? "",
          excerpt: prev[activeLanguage]?.excerpt ?? "",
          metaTitle: prev[activeLanguage]?.metaTitle ?? "",
          metaDescription: prev[activeLanguage]?.metaDescription ?? "",
          ...(patch.title !== undefined ? { title: patch.title } : {}),
          ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
          ...(patch.metaTitle !== undefined ? { metaTitle: patch.metaTitle } : {}),
          ...(patch.metaDescription !== undefined ? { metaDescription: patch.metaDescription } : {}),
        },
      }));
    }
  }

  function handleFeaturedImageChange(file: File) {
    setFeaturedImageError("");
    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
  }

  const currentPageFields: PageFieldsState =
    activeLanguage === "en"
      ? baseFields
      : {
          title: translationFields[activeLanguage]?.title ?? "",
          slug: baseFields.slug,
          status: baseFields.status,
          parentId: baseFields.parentId,
          isHomepage: baseFields.isHomepage,
          excerpt: translationFields[activeLanguage]?.excerpt ?? "",
          metaTitle: translationFields[activeLanguage]?.metaTitle ?? "",
          metaDescription: translationFields[activeLanguage]?.metaDescription ?? "",
        };

  async function handleSave(publish: boolean) {
    setSaveError("");
    setSaving(publish ? "publish" : "draft");
    try {
      const mergedTranslations = Object.fromEntries(
        activeLanguages
          .filter((l) => l.code !== "en")
          .map((l) => {
            const original = page.translations[l.code];
            const edited = translationFields[l.code];
            return [
              l.code,
              {
                title: edited?.title ?? original?.title ?? "",
                excerpt: edited?.excerpt ?? original?.excerpt ?? "",
                content: original?.content ?? "",
                meta_title: edited?.metaTitle ?? original?.meta_title ?? "",
                meta_description: edited?.metaDescription ?? original?.meta_description ?? "",
              },
            ];
          })
      );

      const body: CmsPageUpdate = {
        title: baseFields.title.trim(),
        slug: baseFields.slug.trim(),
        status: publish ? "published" : baseFields.status,
        parent_id: baseFields.parentId === NO_PARENT ? null : baseFields.parentId,
        is_homepage: baseFields.isHomepage,
        excerpt: baseFields.excerpt.trim(),
        meta_title: baseFields.metaTitle.trim(),
        meta_description: baseFields.metaDescription.trim(),
        author_name: authorName.trim() || "Royal Vacation Admin",
        sort_order: Number(sortOrder) || 0,
        translations: mergedTranslations,
      };

      await updatePage(page.id, body);

      if (featuredImageFile) {
        try {
          await uploadFeaturedImage(page.id, featuredImageFile);
          setFeaturedImageFile(null);
        } catch (err) {
          setFeaturedImageError(errorMessage(err, "Page saved, but the featured image failed to upload."));
        }
      }

      if (publish) setBaseFields((prev) => ({ ...prev, status: "published" }));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save page."));
    } finally {
      setSaving(null);
    }
  }

  const currentLanguageLabel =
    activeLanguages.find((l) => l.code === activeLanguage)?.native_name ?? "English";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/40">
      <header className="flex shrink-0 items-center gap-4 border-b border-border bg-white px-4 py-2.5">
        <Button variant="ghost" size="icon-sm" render={<Link href="/cms/pages" />} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{baseFields.title}</p>
            {isDirty && (
              <span className="shrink-0 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium text-navy">
                Unsaved changes
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            royalvacation.com/pages/{baseFields.slug || "…"}
          </p>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border bg-white p-0.5">
          {(["desktop", "tablet", "mobile"] as const).map((mode) => {
            const Icon = mode === "desktop" ? Monitor : mode === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={mode}
                type="button"
                aria-label={mode}
                onClick={() => setDevice(mode)}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md transition-colors",
                  device === mode ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" aria-label="Undo" disabled={past.length === 0} onClick={handleUndo}>
            <Undo2 className="size-3.5" />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Redo" disabled={future.length === 0} onClick={handleRedo}>
            <Redo2 className="size-3.5" />
          </Button>
        </div>

        <Button variant="outline" size="sm" disabled title="Live preview isn't available yet — no public block-rendering pipeline exists.">
          <Eye data-icon="inline-start" />
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={saving !== null}
          onClick={() => handleSave(false)}
        >
          {saving === "draft" ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Save data-icon="inline-start" />}
          Save draft
        </Button>
        <Button disabled={saving !== null} onClick={() => handleSave(true)}>
          {saving === "publish" ? (
            <Loader2 data-icon="inline-start" className="animate-spin" />
          ) : (
            <UploadCloud data-icon="inline-start" />
          )}
          Publish
          {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
        </Button>
      </header>

      <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-2">
        <span className="text-xs font-medium text-muted-foreground">Translations</span>
        <div className="flex flex-wrap items-center gap-3">
          {["en", ...activeLanguages.filter((l) => l.code !== "en").map((l) => l.code)].map((code) => {
            const lang = activeLanguages.find((l) => l.code === code);
            const label = code === "en" ? "EN" : (lang?.code ?? code).toUpperCase();
            const hasContent = code === "en" ? true : Boolean(translationFields[code]?.title);
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
        <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info className="size-3.5" />
          Block content isn&apos;t saved yet — only page details, SEO and translations are real.
        </span>
      </div>

      {saveError && (
        <div className="flex items-center gap-1.5 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-xs text-destructive">
          <AlertTriangle className="size-3.5 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <BlockPalette onAddBlock={handleAddBlock} />
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className={deviceWidths[device]}>
            <Canvas
              blocks={blocks}
              selectedBlockId={selectedBlockId}
              onSelectBlock={(id) => {
                setSelectedBlockId(id);
                setInspectorTab("block");
              }}
              onDeleteBlock={handleDeleteBlock}
              onDuplicateBlock={handleDuplicateBlock}
              onInsertBlock={handleInsertBlock}
              onMoveBlock={handleMoveBlock}
            />
          </div>
        </div>
        <BlockInspector
          activeTab={inspectorTab}
          onActiveTabChange={setInspectorTab}
          selectedBlock={selectedBlock}
          onPatchBlock={handlePatchBlock}
          pageFields={currentPageFields}
          onPageFieldsChange={handlePageFieldsChange}
          parentOptions={parentOptions}
          currentLanguageLabel={currentLanguageLabel}
          authorName={authorName}
          onAuthorNameChange={setAuthorName}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          featuredImagePreview={featuredImagePreview}
          onFeaturedImageChange={handleFeaturedImageChange}
          featuredImageError={featuredImageError}
        />
      </div>
    </div>
  );
}
