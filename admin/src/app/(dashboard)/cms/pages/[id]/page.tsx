"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useCmsPageQuery } from "@/lib/cms";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CmsPageEditor } from "@/components/cms-page-editor";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function EditCmsPagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: page, isLoading, error } = useCmsPageQuery(id);

  // Content pages are edited in the Content Studio builder — this plain
  // metadata form is only for system (SEO-only) pages, which have no block
  // content to design. Redirect here so no page ends up with two separate
  // editing surfaces.
  useEffect(() => {
    if (page && page.page_type === "content") {
      router.replace(`/cms/pages/${page.id}/builder`);
    }
  }, [page, router]);

  const redirecting = Boolean(page && page.page_type === "content");

  return (
    <PermissionGuard module="cms" action="edit">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/cms/pages"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Pages
          </Link>
          <h1 className="text-2xl font-semibold text-navy">Edit page</h1>
          <p className="text-sm text-muted-foreground">
            {page ? `Editing "${page.title}".` : "Loading…"}
          </p>
        </div>

        {(isLoading || redirecting) && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && error && (
          <Card>
            <CardHeader>
              <CardTitle>Couldn&apos;t load this page</CardTitle>
              <CardDescription>{errorMessage(error, "Something went wrong.")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/cms/pages" />}>
                Back to pages
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !page && (
          <Card>
            <CardHeader>
              <CardTitle>Page not found</CardTitle>
              <CardDescription>This page may have been deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/cms/pages" />}>
                Back to pages
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && page && !redirecting && <CmsPageEditor key={page.id} initial={page} />}
      </div>
    </PermissionGuard>
  );
}
