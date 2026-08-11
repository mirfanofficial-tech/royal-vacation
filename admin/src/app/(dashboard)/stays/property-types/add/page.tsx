"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  ImagePlus,
  Loader2,
  Save,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { usePropertyTypes } from "@/lib/property-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AddPropertyTypePage() {
  const router = useRouter();
  const { createPropertyType, uploadImage } = usePropertyTypes();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [countLabel, setCountLabel] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const created = await createPropertyType({
        name: name.trim(),
        slug: (slug.trim() || slugify(name)).trim(),
        description: description.trim() || undefined,
        count_label: countLabel.trim() || undefined,
        sort_order: Number(sortOrder) || 0,
      });
      if (imageFile) {
        await uploadImage(created.id, imageFile);
      }
      router.push(`/stays/property-types/${created.id}`);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to add property type."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/stays/property-types" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Property Types
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-navy">Add Property Type</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new property type shown on the public website.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Save Property Type
          </Button>
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {saveError}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="size-4 text-muted-foreground" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="pt-name">
              Name
            </label>
            <Input
              id="pt-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Hotels"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pt-slug">
              Slug
            </label>
            <Input
              id="pt-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="e.g. hotels"
              className="font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Used in search links. Auto-filled from the name.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel} htmlFor="pt-description">
              Description
            </label>
            <Input
              id="pt-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description"
            />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pt-count-label">
              Display count label
            </label>
            <Input
              id="pt-count-label"
              value={countLabel}
              onChange={(e) => setCountLabel(e.target.value)}
              placeholder="e.g. 3,842 properties"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown under the name on the homepage card.
            </p>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pt-sort-order">
              Sort order
            </label>
            <Input
              id="pt-sort-order"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImagePlus className="size-4 text-muted-foreground" />
            Image
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <span className="flex size-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imagePreview} alt="Preview" className="size-full object-cover" />
            ) : (
              <Building2 className="size-6 text-muted-foreground" />
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
              {imageFile ? "Replace image" : "Choose image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleImageChange}
            />
            <p className="text-xs text-muted-foreground">
              PNG, JPEG, WEBP or SVG, up to 2 MB. Uploaded after saving.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
