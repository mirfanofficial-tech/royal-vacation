"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useBlogPostQuery } from "@/lib/blog";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogEditor } from "@/components/blog-editor/blog-editor";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function BlogPostEditorRoute() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = useBlogPostQuery(id);

  return (
    <PermissionGuard module="blog" action="edit">
      {isLoading && (
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (error || !post) && (
        <div className="flex h-screen items-center justify-center p-6">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>{error ? "Couldn't load this post" : "Post not found"}</CardTitle>
              <CardDescription>
                {error ? errorMessage(error, "Something went wrong.") : "This post may have been deleted."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/blogs" />}>
                <ArrowLeft data-icon="inline-start" />
                Back to blog posts
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && post && <BlogEditor key={post.id} post={post} />}
    </PermissionGuard>
  );
}
