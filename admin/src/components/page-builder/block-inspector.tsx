"use client";

import { useRef } from "react";
import { ImagePlus } from "lucide-react";

import type { CmsPageStatus, CmsPageSummaryOut } from "@royal-vacation/api-client";
import type { BuilderBlock } from "@/lib/page-builder-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

const statusLabels: Record<CmsPageStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

const NO_PARENT = "__no_parent__";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none",
        checked ? "bg-navy" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-foreground">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function BlockPropertiesForm({
  block,
  onPatch,
}: {
  block: BuilderBlock;
  onPatch: (props: Record<string, unknown>) => void;
}) {
  if (block.type === "hero-banner") {
    const p = block.props;
    return (
      <div className="space-y-5">
        <div>
          <label className={fieldLabel}>Eyebrow text</label>
          <Input value={p.eyebrow} onChange={(e) => onPatch({ eyebrow: e.target.value })} />
        </div>
        <div>
          <label className={fieldLabel}>Headline</label>
          <textarea
            value={p.headline}
            onChange={(e) => onPatch({ headline: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div>
          <label className={fieldLabel}>Background media</label>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
            {p.backgroundLabel}
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={fieldLabel + " mb-0"}>Overlay opacity</span>
            <span className="text-xs text-muted-foreground">{p.overlayOpacity}%</span>
          </div>
          <Slider
            value={[p.overlayOpacity]}
            onValueChange={(v) => onPatch({ overlayOpacity: Array.isArray(v) ? v[0] : v })}
          />
        </div>
        <div>
          <label className={fieldLabel}>Content alignment</label>
          <Select value={p.align} onValueChange={(v) => onPatch({ align: v ?? "left" })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left aligned</SelectItem>
              <SelectItem value="center">Centered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={fieldLabel}>Height</label>
          <Select value={p.height} onValueChange={(v) => onPatch({ height: v ?? "medium" })}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small — 320px</SelectItem>
              <SelectItem value="medium">Medium — 480px</SelectItem>
              <SelectItem value="large">Large — 640px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ToggleRow
          label="Show search widget"
          checked={p.showSearchWidget}
          onChange={(v) => onPatch({ showSearchWidget: v })}
        />
        <ToggleRow
          label="Show trust badges"
          checked={p.showTrustBadges}
          onChange={(v) => onPatch({ showTrustBadges: v })}
        />
        <ToggleRow
          label="Parallax scroll"
          checked={p.parallaxScroll}
          onChange={(v) => onPatch({ parallaxScroll: v })}
        />
      </div>
    );
  }

  if (block.type === "rich-text") {
    const p = block.props;
    return (
      <div>
        <label className={fieldLabel}>HTML content</label>
        <textarea
          value={p.html}
          onChange={(e) => onPatch({ html: e.target.value })}
          rows={10}
          className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
    );
  }

  if (block.type === "image") {
    const p = block.props;
    return (
      <div className="space-y-5">
        <div>
          <label className={fieldLabel}>Alt text</label>
          <Input value={p.alt} onChange={(e) => onPatch({ alt: e.target.value })} />
        </div>
        <div>
          <label className={fieldLabel}>Caption</label>
          <Input value={p.caption} onChange={(e) => onPatch({ caption: e.target.value })} />
        </div>
        <div>
          <label className={fieldLabel}>Upload image</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPatch({ objectUrl: URL.createObjectURL(file) });
            }}
            className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-xs"
          />
        </div>
      </div>
    );
  }

  if (block.type === "two-column") {
    const p = block.props;
    return (
      <div className="space-y-5">
        <div>
          <label className={fieldLabel}>Left heading</label>
          <Input value={p.leftHeading} onChange={(e) => onPatch({ leftHeading: e.target.value })} />
        </div>
        <div>
          <label className={fieldLabel}>Left text</label>
          <textarea
            value={p.leftText}
            onChange={(e) => onPatch({ leftText: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div>
          <label className={fieldLabel}>Right heading</label>
          <Input value={p.rightHeading} onChange={(e) => onPatch({ rightHeading: e.target.value })} />
        </div>
        <div>
          <label className={fieldLabel}>Right text</label>
          <textarea
            value={p.rightText}
            onChange={(e) => onPatch({ rightText: e.target.value })}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>
    );
  }

  // property-grid
  const p = block.props;
  return (
    <div className="space-y-5">
      <div>
        <label className={fieldLabel}>Heading</label>
        <Input value={p.heading} onChange={(e) => onPatch({ heading: e.target.value })} />
      </div>
      <div>
        <label className={fieldLabel}>Subheading</label>
        <Input value={p.subheading} onChange={(e) => onPatch({ subheading: e.target.value })} />
      </div>
      <div>
        <label className={fieldLabel}>Tag</label>
        <Input value={p.tag} onChange={(e) => onPatch({ tag: e.target.value })} />
      </div>
      <div>
        <label className={fieldLabel}>Property count</label>
        <Select
          value={String(p.count)}
          onValueChange={(v) => onPatch({ count: Number(v ?? 3) })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="6">6</SelectItem>
            <SelectItem value="9">9</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export interface PageFieldsState {
  title: string;
  slug: string;
  status: CmsPageStatus;
  parentId: string;
  isHomepage: boolean;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
}

interface BlockInspectorProps {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  selectedBlock: BuilderBlock | null;
  onPatchBlock: (props: Record<string, unknown>) => void;
  pageFields: PageFieldsState;
  onPageFieldsChange: (patch: Partial<PageFieldsState>) => void;
  parentOptions: CmsPageSummaryOut[];
  currentLanguageLabel: string;
  authorName: string;
  onAuthorNameChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
  featuredImagePreview: string | null;
  onFeaturedImageChange: (file: File) => void;
  featuredImageError?: string;
}

export function BlockInspector({
  activeTab,
  onActiveTabChange,
  selectedBlock,
  onPatchBlock,
  pageFields,
  onPageFieldsChange,
  parentOptions,
  currentLanguageLabel,
  authorName,
  onAuthorNameChange,
  sortOrder,
  onSortOrderChange,
  featuredImagePreview,
  onFeaturedImageChange,
  featuredImageError,
}: BlockInspectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex h-full w-80 shrink-0 flex-col overflow-y-auto border-l border-border bg-white">
      <Tabs value={activeTab} onValueChange={(v) => onActiveTabChange((v as string) ?? "block")}>
        <TabsList className="px-4 pt-3">
          <TabsTab value="block">Block</TabsTab>
          <TabsTab value="page">Page</TabsTab>
          <TabsTab value="seo">SEO</TabsTab>
        </TabsList>

        <TabsPanel value="block" className="p-4">
          {selectedBlock ? (
            <>
              <div className="mb-4 rounded-lg bg-gold/10 px-3 py-2 text-sm font-medium text-navy">
                {selectedBlock.label}
              </div>
              <BlockPropertiesForm block={selectedBlock} onPatch={onPatchBlock} />
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Select a block on the canvas to edit it.</p>
          )}
        </TabsPanel>

        <TabsPanel value="page" className="space-y-5 p-4">
          <p className="text-xs text-muted-foreground">Editing: {currentLanguageLabel}</p>
          <div>
            <label className={fieldLabel}>Title</label>
            <Input
              value={pageFields.title}
              onChange={(e) => onPageFieldsChange({ title: e.target.value })}
            />
          </div>
          <div>
            <label className={fieldLabel}>URL slug</label>
            <Input
              value={pageFields.slug}
              onChange={(e) => onPageFieldsChange({ slug: e.target.value })}
              className="font-mono text-sm"
            />
          </div>
          <div>
            <label className={fieldLabel}>Status</label>
            <Select
              value={pageFields.status}
              onValueChange={(v) => onPageFieldsChange({ status: (v as CmsPageStatus) ?? "draft" })}
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
            <label className={fieldLabel}>Parent page</label>
            <Select
              value={pageFields.parentId}
              onValueChange={(v) => onPageFieldsChange({ parentId: v ?? NO_PARENT })}
            >
              <SelectTrigger className="w-full">
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
          <ToggleRow
            label="Use as homepage"
            checked={pageFields.isHomepage}
            onChange={(v) => onPageFieldsChange({ isHomepage: v })}
          />
          <div>
            <label className={fieldLabel}>Excerpt</label>
            <textarea
              value={pageFields.excerpt}
              onChange={(e) => onPageFieldsChange({ excerpt: e.target.value })}
              rows={2}
              placeholder="Optional short summary…"
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          <div>
            <span className={fieldLabel}>Featured image</span>
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
                {featuredImagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featuredImagePreview} alt="Featured" className="size-full object-cover" />
                ) : (
                  <ImagePlus className="size-5 text-muted-foreground" />
                )}
              </span>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {featuredImagePreview ? "Replace" : "Upload"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onFeaturedImageChange(file);
                  }}
                />
                {featuredImageError && <p className="text-xs text-destructive">{featuredImageError}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className={fieldLabel}>Author</label>
            <Input value={authorName} onChange={(e) => onAuthorNameChange(e.target.value)} />
          </div>
          <div>
            <label className={fieldLabel}>Sort order</label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
            />
          </div>
        </TabsPanel>

        <TabsPanel value="seo" className="space-y-5 p-4">
          <p className="text-xs text-muted-foreground">Editing: {currentLanguageLabel}</p>
          <div>
            <label className={fieldLabel}>Meta title</label>
            <Input
              value={pageFields.metaTitle}
              onChange={(e) => onPageFieldsChange({ metaTitle: e.target.value })}
            />
          </div>
          <div>
            <label className={fieldLabel}>Meta description</label>
            <textarea
              value={pageFields.metaDescription}
              onChange={(e) => onPageFieldsChange({ metaDescription: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  );
}

export { NO_PARENT };
