import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import { CmsBlockEditor } from "@/components/cms-block-editor";

export default function NewCmsBlockPage() {
  return (
    <PermissionGuard module="cms" action="create">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <Link
            href="/cms/blocks"
            className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Blocks
          </Link>
          <h1 className="text-2xl font-semibold text-navy">New block</h1>
          <p className="text-sm text-muted-foreground">
            Create a reusable content snippet.
          </p>
        </div>

        <CmsBlockEditor />
      </div>
    </PermissionGuard>
  );
}
