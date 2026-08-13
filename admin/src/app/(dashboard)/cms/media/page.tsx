"use client";

import { useMemo, useRef, useState } from "react";
import {
  CircleCheck,
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

import {
  contentHubMediaAssets,
  mediaAssetsSeed,
  mediaFolders,
  type MediaAsset,
  type MediaAssetType,
  type MediaFolder,
} from "@/lib/mock-data";
import { useLanguages } from "@/lib/reference";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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

interface LibraryAsset extends MediaAsset {
  altText: Record<string, string>;
  objectUrl?: string;
}

const typeMeta: Record<MediaAssetType, { label: string; icon: typeof ImageIcon; className: string }> = {
  image: { label: "Image", icon: ImageIcon, className: "bg-sky-100 text-sky-600" },
  document: { label: "Document", icon: FileText, className: "bg-slate-100 text-slate-600" },
  video: { label: "Video", icon: Video, className: "bg-violet-100 text-violet-600" },
  vector: { label: "Vector", icon: Palette, className: "bg-gold/15 text-gold" },
};

function formatSize(sizeKb: number) {
  if (sizeKb >= 1024) return `${(sizeKb / 1024).toFixed(1)} MB`;
  return `${sizeKb} KB`;
}

function assetSubtitle(asset: LibraryAsset) {
  if (asset.type === "image" && asset.width && asset.height) {
    return `${asset.width}×${asset.height} · ${formatSize(asset.sizeKb)}`;
  }
  if (asset.type === "document") return asset.format;
  if (asset.type === "video") return asset.format;
  return `${asset.format} · ${formatSize(asset.sizeKb)}`;
}

function toLibraryAsset(asset: MediaAsset): LibraryAsset {
  return { ...asset, altText: { en: asset.altTextEn } };
}

let uploadCounter = 0;

function MediaLibrary() {
  const { languages } = useLanguages();
  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);

  const [assets, setAssets] = useState<LibraryAsset[]>(() => mediaAssetsSeed.map(toLibraryAsset));
  const [folders, setFolders] = useState<MediaFolder[]>(mediaFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaAssetType>("all");
  const [dateFilter, setDateFilter] = useState<"any" | "7d" | "30d">("any");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [altLanguage, setAltLanguage] = useState("en");
  const [tagInput, setTagInput] = useState("");
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [copyConfirm, setCopyConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) ?? null;

  const filtered = useMemo(() => {
    const now = Date.now();
    return assets.filter((a) => {
      const matchesFolder = !selectedFolderId || a.folderId === selectedFolderId;
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        a.filename.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.altText.en?.toLowerCase().includes(q);
      const ageDays = (now - new Date(a.uploadedAt).getTime()) / 86_400_000;
      const matchesDate =
        dateFilter === "any" || (dateFilter === "7d" ? ageDays <= 7 : ageDays <= 30);
      return matchesFolder && matchesType && matchesQuery && matchesDate;
    });
  }, [assets, selectedFolderId, typeFilter, query, dateFilter]);

  function selectAsset(asset: LibraryAsset) {
    setSelectedAssetId(asset.id);
    setAltLanguage("en");
  }

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const created: LibraryAsset[] = Array.from(files).map((file) => {
      uploadCounter += 1;
      const isImage = file.type.startsWith("image/");
      return {
        id: `upload_${uploadCounter}`,
        filename: file.name,
        type: isImage ? "image" : file.type.startsWith("video/") ? "video" : "document",
        folderId: "unsorted",
        sizeKb: Math.round(file.size / 1024),
        format: file.type || "Unknown",
        uploadedAt: new Date().toISOString(),
        uploadedBy: "You",
        usedInCount: 0,
        tags: [],
        altTextEn: "",
        altText: { en: "" },
        objectUrl: isImage ? URL.createObjectURL(file) : undefined,
      };
    });
    setAssets((prev) => [...created, ...prev]);
    selectAsset(created[0]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDeleteAsset(id: string) {
    if (!window.confirm("Delete this asset? This can't be undone.")) return;
    setAssets((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
  }

  function handleAltTextChange(value: string) {
    if (!selectedAsset) return;
    setAssets((prev) =>
      prev.map((a) =>
        a.id === selectedAsset.id
          ? { ...a, altText: { ...a.altText, [altLanguage]: value } }
          : a
      )
    );
  }

  function handleAddTag() {
    if (!selectedAsset || !tagInput.trim()) return;
    const tag = tagInput.trim().toLowerCase();
    if (selectedAsset.tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setAssets((prev) =>
      prev.map((a) => (a.id === selectedAsset.id ? { ...a, tags: [...a.tags, tag] } : a))
    );
    setTagInput("");
  }

  function handleRemoveTag(tag: string) {
    if (!selectedAsset) return;
    setAssets((prev) =>
      prev.map((a) => (a.id === selectedAsset.id ? { ...a, tags: a.tags.filter((t) => t !== tag) } : a))
    );
  }

  function handleCopyUrl() {
    if (!selectedAsset) return;
    const url = `https://cdn.royalvacation.com/media/${selectedAsset.filename}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopyConfirm(true);
      window.setTimeout(() => setCopyConfirm(false), 1500);
    });
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    setFolders((prev) => [
      ...prev,
      { id: `folder_${Date.now()}`, name: newFolderName.trim(), count: 0 },
    ]);
    setNewFolderName("");
    setFolderSheetOpen(false);
  }

  const totalCount = assets.length;
  const storagePercent = Math.round(
    (contentHubMediaAssets.storageUsedGb / contentHubMediaAssets.storageTotalGb) * 100
  );

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Media Library</h1>
          <p className="text-sm text-muted-foreground">
            {contentHubMediaAssets.count.toLocaleString()} assets · {contentHubMediaAssets.storageUsedGb} GB
            of {contentHubMediaAssets.storageTotalGb} GB used
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
          <Button size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload data-icon="inline-start" />
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-xs text-muted-foreground">
        <CircleCheck className="size-4 shrink-0 text-rating" />
        <span>
          <span className="font-medium text-foreground">Demo data</span> — no upload backend exists
          yet. Uploading here previews the file locally and won&apos;t persist after a refresh; the
          seed assets, folder counts and storage figures are illustrative.
        </span>
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
              <button
                key={folder.id}
                type="button"
                onClick={() => setSelectedFolderId(folder.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  selectedFolderId === folder.id
                    ? "bg-navy text-white"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Folder className="size-3.5 shrink-0" />
                  <span className="truncate">{folder.name}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-xs",
                    selectedFolderId === folder.id ? "bg-white/15" : "bg-muted text-muted-foreground"
                  )}
                >
                  {folder.count.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 border-t border-border px-3 pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Storage</span>
              <span className="font-medium text-foreground">{storagePercent}%</span>
            </div>
            <Progress value={storagePercent} className="mt-1.5" />
            <p className="mt-1 text-xs text-muted-foreground">
              {contentHubMediaAssets.storageUsedGb} GB of {contentHubMediaAssets.storageTotalGb} GB
            </p>
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

          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filtered.map((asset) => {
                const meta = typeMeta[asset.type];
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
                      {asset.objectUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={asset.objectUrl} alt="" className="size-full object-cover" />
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
                const meta = typeMeta[asset.type];
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
          {selectedAsset ? (
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
                    typeMeta[selectedAsset.type].className
                  )}
                >
                  {selectedAsset.objectUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedAsset.objectUrl} alt="" className="size-full object-cover" />
                  ) : (
                    (() => {
                      const Icon = typeMeta[selectedAsset.type].icon;
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
                    <span className="text-foreground">{formatSize(selectedAsset.sizeKb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format</span>
                    <span className="text-foreground">{selectedAsset.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span className="text-foreground">
                      {new Date(selectedAsset.uploadedAt).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded by</span>
                    <span className="text-foreground">{selectedAsset.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used in</span>
                    <span className="text-foreground">{selectedAsset.usedInCount} pages</span>
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
                            selectedAsset.altText[lang.code] ? "bg-rating" : "bg-border"
                          )}
                        />
                        {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={selectedAsset.altText[altLanguage] ?? ""}
                    onChange={(e) => handleAltTextChange(e.target.value)}
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
