"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Building2,
  ImagePlus,
  Loader2,
  Save,
} from "lucide-react";

import type { PropertyTypeOut, PropertyTypeUpdate } from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { usePropertyTypes } from "@/lib/property-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function PropertyTypeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { propertyTypes, isLoading, error, updatePropertyType, uploadImage, isMutating } =
    usePropertyTypes();
  const propertyType = propertyTypes.find((p) => p.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-destructive">
            {errorMessage(error, "Failed to load property type.")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!propertyType) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Property type not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PropertyTypeDetailView
      key={propertyType.id}
      propertyType={propertyType}
      updatePropertyType={updatePropertyType}
      uploadImage={uploadImage}
      isUploading={isMutating}
    />
  );
}

function PropertyTypeDetailView({
  propertyType,
  updatePropertyType,
  uploadImage,
  isUploading,
}: {
  propertyType: PropertyTypeOut;
  updatePropertyType: (id: string, body: PropertyTypeUpdate) => Promise<PropertyTypeOut>;
  uploadImage: (id: string, file: File) => Promise<PropertyTypeOut>;
  isUploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(propertyType.name);
  const [slug, setSlug] = useState(propertyType.slug);
  const [description, setDescription] = useState(propertyType.description ?? "");
  const [countLabel, setCountLabel] = useState(propertyType.count_label ?? "");
  const [sortOrder, setSortOrder] = useState(String(propertyType.sort_order));
  const [isActive, setIsActive] = useState(propertyType.is_active);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [imageError, setImageError] = useState("");

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      await updatePropertyType(propertyType.id, {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        count_label: countLabel.trim(),
        sort_order: Number(sortOrder) || 0,
        is_active: isActive,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save property type."));
    } finally {
      setSaving(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    try {
      await uploadImage(propertyType.id, file);
    } catch (err) {
      setImageError(errorMessage(err, "Failed to upload image."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            <h1 className="text-2xl font-semibold text-navy">{propertyType.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">{propertyType.slug}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Update Property Type
            {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
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
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive property types are hidden from the public website.
            </p>
          </div>
          <select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            className="h-8 w-32 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

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
            <Input id="pt-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel} htmlFor="pt-slug">
              Slug
            </label>
            <Input
              id="pt-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono"
            />
            <p className="mt-1 text-xs text-muted-foreground">Used in search links.</p>
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
            {propertyType.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveAssetUrl(propertyType.image_url)}
                alt={propertyType.name}
                className="size-full object-cover"
              />
            ) : (
              <Building2 className="size-6 text-muted-foreground" />
            )}
          </span>
          <div className="space-y-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <ImagePlus data-icon="inline-start" />
              )}
              {propertyType.image_url ? "Replace image" : "Upload image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={handleImageChange}
            />
            {imageError && <p className="text-xs text-destructive">{imageError}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
