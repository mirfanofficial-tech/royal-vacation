"use client";

import { PermissionGuard } from "@/components/permission-guard";
import { ReportView } from "@/components/report-view";

export default function BookingReportPage() {
  return (
    <PermissionGuard module="reports">
      <ReportView reportKey="bookings" />
    </PermissionGuard>
  );
}
