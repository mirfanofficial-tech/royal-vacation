"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Bold,
  CircleCheck,
  Eye,
  EyeOff,
  Heading2,
  Image,
  Italic,
  Link as LinkIcon,
  List,
  Quote,
} from "lucide-react";

import {
  type AdminBlogPost,
  type BlogStatus,
} from "@/lib/mock-data";
import { useBlogCategories } from "@/lib/blog-categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusLabels: Record<BlogStatus, string> = {
  published: "Published",
  draft: "Draft",
  scheduled: "Scheduled",
};

const markdownActions = [
  { label: "Bold", icon: Bold, prefix: "**", suffix: "**" },
  { label: "Italic", icon: Italic, prefix: "*", suffix: "*" },
  { label: "Heading", icon: Heading2, prefix: "## ", suffix: "" },
  { label: "List", icon: List, prefix: "- ", suffix: "" },
  { label: "Quote", icon: Quote, prefix: "> ", suffix: "" },
  { label: "Link", icon: LinkIcon, prefix: "[", suffix: "](https://)" },
  { label: "Image", icon: Image, prefix: "![alt](", suffix: ")" },
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const fieldLabel =
  "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldHint = "mt-1 text-xs text-muted-foreground";

interface BlogPostEditorProps {
  initial?: AdminBlogPost;
}

export function BlogPostEditor({ initial }: BlogPostEditorProps) {
  const { categories } = useBlogCategories();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [category, setCategory] = useState(
    initial?.category ?? categories[0]?.name ?? ""
  );
  const [status, setStatus] = useState<BlogStatus>(
    initial?.status ?? "draft"
  );
  const [publishDate, setPublishDate] = useState(
    initial?.publishedAt ?? ""
  );
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [author, setAuthor] = useState(
    initial?.author ?? "Royal Vacation Admin"
  );
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(initial?.title ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.excerpt ?? ""
  );
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleFormat(action: (typeof markdownActions)[number]) {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || "text";
    const next =
      content.slice(0, start) +
      action.prefix +
      selected +
      action.suffix +
      content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + action.prefix.length + selected.length;
      textarea.setSelectionRange(start + action.prefix.length, cursor);
    });
  }

  function handleSave(nextStatus: BlogStatus) {
    setStatus(nextStatus);
    setSaved(nextStatus === "published" ? "Published" : "Saved as draft");
    window.setTimeout(() => setSaved(null), 3000);
  }

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>
              Title, excerpt and the body of the post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
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
                {slug
                  ? `royalvacation.com/blog/${slug}`
                  : "Auto-generated from the title."}
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
              <div className="mb-1.5 flex items-center justify-between">
                <label className={fieldLabel} htmlFor="post-content">
                  Body
                </label>
                <div className="flex items-center gap-1">
                  <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5">
                    {markdownActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.label}
                          type="button"
                          onClick={() => handleFormat(action)}
                          aria-label={action.label}
                          title={action.label}
                          className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <Icon className="size-3.5" />
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setPreview((p) => !p)}
                    aria-label={preview ? "Edit" : "Preview"}
                  >
                    {preview ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>
              {preview ? (
                <div
                  aria-label="Preview"
                  className="min-h-40 whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-sm text-foreground"
                >
                  {content || (
                    <span className="text-muted-foreground">
                      Nothing to preview yet.
                    </span>
                  )}
                </div>
              ) : (
                <textarea
                  id="post-content"
                  ref={contentRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder="Write in Markdown… **bold**, _italic_, ## headings, > quotes, - lists"
                  className="w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-1.5 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search engine preview</CardTitle>
            <CardDescription>
              Controls how the post appears in search results.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
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
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Publishing</CardTitle>
            <CardDescription>
              Status, schedule and classification.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className={fieldLabel} htmlFor="post-status">
                Status
              </label>
              <Select value={status} onValueChange={(value) => setStatus((value ?? "draft") as BlogStatus)}>
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
              <p className={fieldHint}>
                Leave empty to publish immediately.
              </p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="post-category">
                Category
              </label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setCategory(value ?? categories[0]?.name ?? "")
                }
              >
                <SelectTrigger id="post-category" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((item) => (
                    <SelectItem key={item.id} value={item.name}>
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
              <Input
                id="post-author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-end gap-2 pt-4">
            <Button variant="outline" render={<Link href="/blogs" />}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleSave("draft")}>
              Save draft
            </Button>
            <Button onClick={() => handleSave("published")}>Publish</Button>
            {saved && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <CircleCheck className="size-4 text-rating" />
                {saved} (demo)
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
