"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useCmsBlockQuery } from "@/lib/cms";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CmsBlockEditor } from "@/components/cms-block-editor";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function EditCmsBlockPage() {
  const { id } = useParams<{ id: string }>();
  const { data: block, isLoading, error } = useCmsBlockQuery(id);

  return (
    <PermissionGuard module="cms" action="edit">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/cms/blocks"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Blocks
          </Link>
          <h1 className="text-2xl font-semibold text-navy">Edit block</h1>
          <p className="text-sm text-muted-foreground">
            {block ? `Editing "${block.name}".` : "Loading…"}
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && error && (
          <Card>
            <CardHeader>
              <CardTitle>Couldn&apos;t load this block</CardTitle>
              <CardDescription>{errorMessage(error, "Something went wrong.")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/cms/blocks" />}>
                Back to blocks
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !block && (
          <Card>
            <CardHeader>
              <CardTitle>Block not found</CardTitle>
              <CardDescription>This block may have been deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/cms/blocks" />}>
                Back to blocks
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && block && <CmsBlockEditor key={block.id} initial={block} />}
      </div>
    </PermissionGuard>
  );
}
