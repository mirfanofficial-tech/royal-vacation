import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { mockBlogPosts } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogPostEditor } from "@/components/blog-post-editor";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = mockBlogPosts.find((p) => p.id === id);

  return (
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
          {post ? `Editing "${post.title}".` : "Post not found."}
        </p>
      </div>

      {post ? (
        <BlogPostEditor initial={post} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Post not found</CardTitle>
            <CardDescription>
              The post you are trying to edit does not exist in the demo
              data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link href="/blogs" />}>
              Back to blog posts
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
