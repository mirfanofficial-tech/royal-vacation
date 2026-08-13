"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useCmsPages } from "@/lib/cms";
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

function NewCmsPageForm() {
  const router = useRouter();
  const { createPage } = useCmsPages();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setCreating(true);
    try {
      const page = await createPage({
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        content: "",
        status: "draft",
      });
      router.push(`/cms/pages/${page.id}/builder`);
    } catch (err) {
      setError(errorMessage(err, "Failed to create page."));
      setCreating(false);
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Name your page</CardTitle>
        <CardDescription>
          You&apos;ll design the layout next in the Content Studio builder — everything else
          (SEO, translations, publishing) can be set from there too.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <label className={fieldLabel} htmlFor="new-page-title">
            Title
          </label>
          <Input
            id="new-page-title"
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="e.g. About Us"
            className="h-10 text-base"
            onKeyDown={(e) => {
              if (e.key === "Enter" && title.trim() && !creating) handleCreate();
            }}
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="new-page-slug">
            URL slug
          </label>
          <Input
            id="new-page-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            placeholder="about-us"
            className="font-mono text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {slug ? `royalvacation.com/pages/${slug}` : "Auto-generated from the title."}
          </p>
        </div>

        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" render={<Link href="/cms/pages" />}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim() || creating}>
            {creating ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <ArrowRight data-icon="inline-end" />
            )}
            Continue to builder
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function NewCmsPagePage() {
  return (
    <PermissionGuard module="cms" action="create">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/cms/pages"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Pages
          </Link>
          <h1 className="text-2xl font-semibold text-navy">New page</h1>
          <p className="text-sm text-muted-foreground">
            Create a new page for the customer website.
          </p>
        </div>

        <NewCmsPageForm />
      </div>
    </PermissionGuard>
  );
}
