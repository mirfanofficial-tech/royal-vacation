"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminTopbar } from "@/components/admin-topbar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <AdminSidebar collapsed={collapsed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((c) => !c)}
          />
          <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
