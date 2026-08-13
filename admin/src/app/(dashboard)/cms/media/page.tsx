"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  File,
  FileText,
  Folder,
  Grid3x3,
  Image as ImageIcon,
  List as ListIcon,
  Palette,
  Plus,
  Search,
  Trash2,
  Upload,
  Video,
  X,
} from "lucide-react";

import type { MediaAssetSummaryOut, MediaAssetType } from "@royal-vacation/api-client";
import { resolveAssetUrl } from "@/lib/api";
import { useMedia, useMediaAssetQuery } from "@/lib/media";
import { useLanguages } from "@/lib/reference";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const typeMeta: Record<MediaAssetType, { label: string; icon: typeof ImageIcon; className: string }> = {
  image: { label: "Image", icon: ImageIcon, className: "bg-sky-100 text-sky-600" },
  document: { label: "Document", icon: FileText, className: "bg-slate-100 text-slate-600" },
  video: { label: "Video", icon: Video, className: "bg-violet-100 text-violet-600" },
  vector: { label: "Vector", icon: Palette, className: "bg-gold/15 text-gold" },
};

function formatSize(sizeBytes: number) {
  const sizeKb = sizeBytes / 1024;
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb.toFixed(sizeKb < 10 ? 1 : 0)} KB`;
}

function assetSubtitle(asset: MediaAssetSummaryOut) {
  if (asset.asset_type === "image" && asset.width && asset.height) {
    return `${asset.width}×${asset.height} · ${formatSize(asset.size_bytes)}`;
  }
  return `${asset.format} · ${formatSize(asset.size_bytes)}`;
}

function MediaLibrary() {
  const { languages } = useLanguages();
  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);

  const { folders, assets, isLoading, createFolder, deleteFolder, uploadAsset, updateAsset, deleteAsset } =
    useMedia();

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaAssetType>("all");
  const [dateFilter, setDateFilter] = useState<"any" | "7d" | "30d">("any");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [altLanguage, setAltLanguage] = useState("en");
  const [altDraft, setAltDraft] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [copyConfirm, setCopyConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSummary = assets.find((a) => a.id === selectedAssetId) ?? null;
  const { data: selectedAsset } = useMediaAssetQuery(selectedAssetId ?? undefined);

  useEffect(() => {
    if (!selectedAsset) return;
    const value = altLanguage === "en" ? selectedAsset.alt_text : selectedAsset.translations[altLanguage]?.alt_text ?? "";
    setAltDraft(value);
  }, [selectedAsset, altLanguage]);

  const filtered = useMemo(() => {
    const now = Date.now();
    return assets.filter((a) => {
      const matchesFolder = !selectedFolderId || a.folder_id === selectedFolderId;
      const matchesType = typeFilter === "all" || a.asset_type === typeFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        a.filename.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.alt_text.toLowerCase().includes(q);
      const ageDays = (now - new Date(a.created_at).getTime()) / 86_400_000;
      const matchesDate =
        dateFilter === "any" || (dateFilter === "7d" ? ageDays <= 7 : ageDays <= 30);
      return matchesFolder && matchesType && matchesQuery && matchesDate;
    });
  }, [assets, selectedFolderId, typeFilter, query, dateFilter]);

  function selectAsset(asset: MediaAssetSummaryOut) {
    setSelectedAssetId(asset.id);
    setAltLanguage("en");
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        uploaded.push(await uploadAsset(file, selectedFolderId));
      }
      if (uploaded[0]) selectAsset(uploaded[0]);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDeleteAsset(id: string) {
    if (!window.confirm("Delete this asset? This can't be undone.")) return;
    await deleteAsset(id);
    if (selectedAssetId === id) setSelectedAssetId(null);
  }

  async function handleSaveAltText() {
    if (!selectedAsset) return;
    if (altLanguage === "en") {
      if (altDraft === selectedAsset.alt_text) return;
      await updateAsset(selectedAsset.id, { alt_text: altDraft });
      return;
    }
    if (altDraft === (selectedAsset.translations[altLanguage]?.alt_text ?? "")) return;
    await updateAsset(selectedAsset.id, {
      translations: {
        ...Object.fromEntries(
          Object.entries(selectedAsset.translations).map(([code, value]) => [code, { alt_text: value.alt_text }])
        ),
        [altLanguage]: { alt_text: altDraft },
      },
    });
  }

  async function handleAddTag() {
    if (!selectedAsset || !tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    if (selectedAsset.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    await updateAsset(selectedAsset.id, { tags: [...selectedAsset.tags, tag] });
    setTagInput("");
  }

  async function handleRemoveTag(tag: string) {
    if (!selectedAsset) return;
    await updateAsset(selectedAsset.id, { tags: selectedAsset.tags.filter((t) => t !== tag) });
  }

  function handleCopyUrl() {
    if (!selectedAsset) return;
    const url = resolveAssetUrl(selectedAsset.file_url);
    navigator.clipboard?.writeText(url).then(() => {
      setCopyConfirm(true);
      window.setTimeout(() => setCopyConfirm(false), 1500);
    });
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    await createFolder({ name: newFolderName.trim() });
    setNewFolderName("");
    setFolderSheetOpen(false);
  }

  async function handleDeleteFolder(id: string) {
    if (!window.confirm("Delete this folder? Assets inside move to Unsorted.")) return;
    await deleteFolder(id);
    if (selectedFolderId === id) setSelectedFolderId(null);
  }

  const totalCount = assets.length;
  const totalSizeBytes = assets.reduce((sum, a) => sum + a.size_bytes, 0);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            {totalCount.toLocaleString()} asset{totalCount === 1 ? "" : "s"} · {formatSize(totalSizeBytes)} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setFolderSheetOpen(true)}>
            <Folder data-icon="inline-start" />
            New folder
          </Button>
          <Button variant="outline" size="sm" disabled title="Coming soon">
            <Plus data-icon="inline-start" />
            Bulk optimise
          </Button>
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload data-icon="inline-start" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/svg+xml,application/pdf,video/mp4,video/webm"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[200px_1fr_320px]">
        <Card className="h-fit p-1.5">
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                selectedFolderId === null ? "bg-navy text-white" : "text-foreground hover:bg-muted"
              )}
            >
              <span className="flex items-center gap-2">
                <ImageIcon className="size-3.5" />
                All media
              </span>
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  selectedFolderId === null ? "bg-white/15" : "bg-muted text-muted-foreground"
                )}
              >
                {totalCount}
              </span>
            </button>
            {folders.map((folder) => (
              <div
                key={folder.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedFolderId(folder.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedFolderId(folder.id);
                }}
                className={cn(
                  "group flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedFolderId === folder.id
                    ? "bg-navy text-white"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs",
                      selectedFolderId === folder.id ? "bg-white/15" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {folder.asset_count.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    aria-label={`Delete ${folder.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    className={cn(
                      "hidden size-5 items-center justify-center rounded-md group-hover:flex",
                      selectedFolderId === folder.id ? "hover:bg-white/15" : "hover:bg-border"
                    )}
                  >
                    <X className="size-3" />
                  </button>
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search media by filename, alt text or tag…"
                className="pl-8"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "all" | MediaAssetType)}
              className={selectClass}
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              <option value="image">Image</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="vector">Vector</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "any" | "7d" | "30d")}
              className={selectClass}
              aria-label="Filter by date"
            >
              <option value="any">Any date</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-border bg-white p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  viewMode === "grid" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Grid3x3 className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md",
                  viewMode === "list" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ListIcon className="size-3.5" />
              </button>
            </div>
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">Loading media…</p>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((asset) => {
                const meta = typeMeta[asset.asset_type];
                const Icon = meta.icon;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => selectAsset(asset)}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-white text-left transition-shadow hover:shadow-sm",
                      selectedAssetId === asset.id ? "border-navy ring-2 ring-navy/30" : "border-border"
                    )}
                  >
                    <div className={cn("flex h-24 items-center justify-center", meta.className)}>
                      {asset.asset_type === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveAssetUrl(asset.file_url)}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <Icon className="size-6" />
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="truncate text-xs font-medium text-foreground">{asset.filename}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{assetSubtitle(asset)}</p>
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                  No assets match your filters.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-white">
              {filtered.map((asset) => {
                const meta = typeMeta[asset.asset_type];
                const Icon = meta.icon;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => selectAsset(asset)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-3 py-2.5 text-left last:border-b-0 hover:bg-muted/40",
                      selectedAssetId === asset.id && "bg-muted/60"
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", meta.className)}>
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{asset.filename}</p>
                      <p className="truncate text-xs text-muted-foreground">{assetSubtitle(asset)}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {meta.label}
                    </Badge>
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No assets match your filters.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          {selectedSummary && selectedAsset ? (
            <Card>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Asset details</p>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => setSelectedAssetId(null)}
                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div
                  className={cn(
                    "flex h-40 items-center justify-center overflow-hidden rounded-lg",
                    typeMeta[selectedAsset.asset_type].className
                  )}
                >
                  {selectedAsset.asset_type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveAssetUrl(selectedAsset.file_url)}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    (() => {
                      const Icon = typeMeta[selectedAsset.asset_type].icon;
                      return <Icon className="size-10" />;
                    })()
                  )}
                </div>

                <p className="truncate text-sm font-medium text-foreground">{selectedAsset.filename}</p>

                <div className="space-y-1.5 text-sm">
                  {selectedAsset.width && selectedAsset.height && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span className="text-foreground">
                        {selectedAsset.width} × {selectedAsset.height}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File size</span>
                    <span className="text-foreground">{formatSize(selectedAsset.size_bytes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="text-foreground">{selectedAsset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span className="text-foreground">
                      {new Date(selectedAsset.created_at).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded by</span>
                    <span className="text-foreground">{selectedAsset.uploaded_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used in</span>
                    <span className="text-foreground">{selectedAsset.used_in_count} pages</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Alt text</p>
                  <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1">
                    {activeLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setAltLanguage(lang.code)}
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          altLanguage === lang.code ? "text-navy" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            (lang.code === "en" ? selectedAsset.alt_text : selectedAsset.translations[lang.code]?.alt_text)
                              ? "bg-rating"
                              : "bg-border"
                          )}
                        />
                        {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={altDraft}
                    onChange={(e) => setAltDraft(e.target.value)}
                    onBlur={handleSaveAltText}
                    rows={3}
                    placeholder="Describe this asset…"
                    className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                </div>

                <div className="border-t border-border pt-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Tags</p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {selectedAsset.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove ${tag}`}>
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                    {selectedAsset.tags.length === 0 && (
                      <p className="text-xs text-muted-foreground">No tags yet.</p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="Add a tag"
                      className="h-8 text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleAddTag} disabled={!tagInput.trim()}>
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 border-t border-border pt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleCopyUrl}>
                    <Copy data-icon="inline-start" />
                    {copyConfirm ? "Copied!" : "Copy URL"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Delete asset"
                    onClick={() => handleDeleteAsset(selectedAsset.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
                <File className="size-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Select an asset to see its details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Sheet open={folderSheetOpen} onOpenChange={setFolderSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New folder</SheetTitle>
            <SheetDescription>Organize media assets into a new folder.</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              autoFocus
            />
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setFolderSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create folder
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function CmsMediaPage() {
  return (
    <PermissionGuard module="cms">
      <MediaLibrary />
    </PermissionGuard>
  );
}
