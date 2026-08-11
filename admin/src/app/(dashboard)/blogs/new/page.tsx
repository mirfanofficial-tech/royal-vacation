import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import { BlogPostEditor } from "@/components/blog-post-editor";

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
            Write a new article for the customer site.
          </p>
        </div>

        <BlogPostEditor />
      </div>
    </PermissionGuard>
  );
}
