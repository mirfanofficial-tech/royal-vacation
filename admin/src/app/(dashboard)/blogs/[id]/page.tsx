"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import { ApiError } from "@/lib/api";
import { useBlogPostQuery } from "@/lib/blog";
import { PermissionGuard } from "@/components/permission-guard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogPostEditor } from "@/components/blog-post-editor";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function EditBlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = useBlogPostQuery(id);

  return (
    <PermissionGuard module="blog" action="edit">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/blogs"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Blog posts
          </Link>
          <h1 className="text-2xl font-semibold text-navy">Edit post</h1>
          <p className="text-sm text-muted-foreground">
            {post ? `Editing "${post.title}".` : "Loading…"}
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
              <CardTitle>Couldn&apos;t load this post</CardTitle>
              <CardDescription>{errorMessage(error, "Something went wrong.")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/blogs" />}>
                Back to blog posts
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && !post && (
          <Card>
            <CardHeader>
              <CardTitle>Post not found</CardTitle>
              <CardDescription>This post may have been deleted.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" render={<Link href="/blogs" />}>
                Back to blog posts
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && post && <BlogPostEditor key={post.id} initial={post} />}
      </div>
    </PermissionGuard>
  );
}
