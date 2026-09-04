"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";
import { AdminThemeProvider } from "@/lib/admin-theme";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <AdminThemeProvider>
        <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
          <div className="print:hidden">
            <AdminSidebar collapsed={collapsed} />
          </div>
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden print:block print:overflow-visible">
            <div className="print:hidden">
              <AdminTopbar
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((c) => !c)}
              />
            </div>
            <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible print:block print:h-auto">{children}</main>
          </div>
        </div>
      </AdminThemeProvider>
    </AuthGuard>
  );
}
