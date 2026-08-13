"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, BadgeCheck, Loader2, Save } from "lucide-react";

import type { CmsBlockCreate, CmsBlockOut, CmsBlockUpdate } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useCmsBlocks } from "@/lib/cms";
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
import { RichTextEditor } from "@/components/rich-text-editor";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldHint = "mt-1 text-xs text-muted-foreground";

const blockTypes = [
  { value: "text", label: "Text" },
  { value: "html", label: "HTML" },
  { value: "cta", label: "Call to action" },
  { value: "banner", label: "Banner" },
];

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

export function CmsBlockEditor({ initial }: { initial?: CmsBlockOut }) {
  const router = useRouter();
  const isEdit = Boolean(initial);
  const { createBlock, updateBlock } = useCmsBlocks();

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [blockType, setBlockType] = useState(initial?.block_type ?? "text");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        block_type: blockType,
        location: location.trim() || undefined,
        content,
        is_active: isActive,
      };

      if (isEdit && initial) {
        await updateBlock(initial.id, body as CmsBlockUpdate);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2000);
      } else {
        await createBlock(body as CmsBlockCreate);
        router.push("/cms/blocks");
      }
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save block."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className={fieldLabel} htmlFor="block-name">
              Name
            </label>
            <Input
              id="block-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Footer promo banner"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="block-slug">
              Slug
            </label>
            <Input
              id="block-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="footer-promo-banner"
              className="font-mono text-sm"
            />
            <p className={fieldHint}>Used to reference this block by API/embed.</p>
          </div>
          <div>
            <label className={fieldLabel}>Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className={fieldLabel} htmlFor="block-type">
                Block type
              </label>
              <Select value={blockType} onValueChange={(value) => setBlockType(value ?? "text")}>
                <SelectTrigger id="block-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className={fieldLabel} htmlFor="block-location">
                Location
              </label>
              <Input
                id="block-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. footer, homepage-banner"
              />
              <p className={fieldHint}>A free-text tag for where this block is meant to render.</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="size-4 rounded border-input"
              />
              Active
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-end gap-2 pt-4">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" render={<Link href="/cms/blocks" />}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!name.trim() || saving}>
                {saving ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                {isEdit ? "Update" : "Create block"}
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
