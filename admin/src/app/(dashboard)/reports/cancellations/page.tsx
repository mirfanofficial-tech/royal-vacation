"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { ReportView } from "@/components/report-view";

export default function CancellationReportPage() {
  return (
    <PermissionGuard module="reports">
      <ReportView reportKey="cancellations" />
    </PermissionGuard>
  );
}
