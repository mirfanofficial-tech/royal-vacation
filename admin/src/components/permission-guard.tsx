"use client";

import { Loader2, ShieldX } from "lucide-react";

import { usePermissions } from "@/lib/roles";
import type { ModuleKey, PermissionAction } from "@/lib/mock-data";

export function PermissionGuard({
  module,
  action = "view",
  children,
}: {
  module: ModuleKey;
  action?: PermissionAction;
  children: React.ReactNode;
}) {
  const { can, role, isLoading } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!can(module, action)) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldX className="size-6" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-navy">Access denied</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your role
            {role ? ` (${role.name})` : ""} doesn&apos;t have permission to
            access this area. Contact a Super Admin if you need access.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
