"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useCmsPageQuery, useCmsPagesQuery } from "@/lib/cms";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageBuilder } from "@/components/page-builder/page-builder";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function CmsPageBuilderRoute() {
  const { id } = useParams<{ id: string }>();
  const { data: page, isLoading, error } = useCmsPageQuery(id);
  const { data: allPages } = useCmsPagesQuery();

  return (
    <PermissionGuard module="cms" action="edit">
      {isLoading && (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (error || !page) && (
        <div className="flex h-screen items-center justify-center p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{error ? "Couldn't load this page" : "Page not found"}</CardTitle>
              <CardDescription>
                {error ? errorMessage(error, "Something went wrong.") : "This page may have been deleted."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/cms/pages" />}>
                <ArrowLeft data-icon="inline-start" />
                Back to pages
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && page && (
        <PageBuilder
          key={page.id}
          page={page}
          parentOptions={(allPages ?? []).filter((p) => p.id !== page.id)}
        />
      )}
    </PermissionGuard>
  );
}
