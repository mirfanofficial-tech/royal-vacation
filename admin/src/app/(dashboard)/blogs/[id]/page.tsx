"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Blog posts are edited in the full-screen Content Studio-style editor —
// this route only exists so old links/bookmarks to /blogs/{id} still land
// somewhere real, mirroring the CMS content-page redirect pattern.
export default function EditBlogPostRedirect() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/blogs/${id}/editor`);
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
