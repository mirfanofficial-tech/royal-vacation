"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { ReportView } from "@/components/report-view";

export default function RevenueReportPage() {
  return (
    <PermissionGuard module="reports">
      <ReportView reportKey="revenue" />
    </PermissionGuard>
  );
}
