"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { ReportView } from "@/components/report-view";

export default function RefundReportPage() {
  return (
    <PermissionGuard module="reports">
      <ReportView reportKey="refunds" />
    </PermissionGuard>
  );
}
