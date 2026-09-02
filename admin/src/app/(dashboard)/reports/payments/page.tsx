"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { ReportView } from "@/components/report-view";

export default function PaymentReportPage() {
  return (
    <PermissionGuard module="reports">
      <ReportView reportKey="payments" />
    </PermissionGuard>
  );
}
