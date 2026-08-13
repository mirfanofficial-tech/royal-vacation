"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useBlogPosts } from "@/lib/blog";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";

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

function NewBlogPostForm() {
  const router = useRouter();
  const { createPost } = useBlogPosts();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setCreating(true);
    try {
      const post = await createPost({
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        content: "",
        status: "draft",
      });
      router.push(`/blogs/${post.id}/editor`);
    } catch (err) {
      setError(errorMessage(err, "Failed to create post."));
      setCreating(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Name your post</CardTitle>
        <CardDescription>
          You&apos;ll write the content next in the full editor — category, tags, SEO and
          translations can all be set from there too.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className={fieldLabel} htmlFor="new-post-title">
            Title
          </label>
          <Input
            id="new-post-title"
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. 10 Hidden Beaches in the Maldives"
            className="h-10 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim() && !creating) handleCreate();
            }}
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="new-post-slug">
            URL slug
          </label>
          <Input
            id="new-post-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="hidden-beaches-maldives"
            className="font-mono text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {slug ? `royalvacation.com/blog/${slug}` : "Auto-generated from the title."}
          </p>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<Link href="/blogs" />}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || creating}>
            {creating ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <ArrowRight data-icon="inline-end" />
            )}
            Continue to editor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewBlogPostPage() {
  return (
    <PermissionGuard module="blog" action="create">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/blogs"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Blog posts
          </Link>
          <h1 className="text-2xl font-semibold text-navy">New post</h1>
          <p className="text-sm text-muted-foreground">
            Create a new article for the customer site.
          </p>
        </div>

        <NewBlogPostForm />
      </div>
    </PermissionGuard>
  );
}
