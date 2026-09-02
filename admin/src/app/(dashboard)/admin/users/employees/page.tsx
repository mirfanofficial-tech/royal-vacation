"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { UsersDirectory } from "@/components/users-directory";
import { userSegments } from "@/lib/user-segments";

export default function EmployeesPage() {
  return (
    <PermissionGuard module="roles">
      <UsersDirectory segment={userSegments.employees} />
    </PermissionGuard>
  );
}
