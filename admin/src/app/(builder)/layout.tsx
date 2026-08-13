"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function BuilderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <div className="h-screen overflow-hidden">{children}</div>
    </AuthGuard>
  );
}
