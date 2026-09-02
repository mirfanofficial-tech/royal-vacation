"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getSession } from "@/lib/auth";

/** Redirects to /login when there's no client session. Renders nothing. */
export function AccountAuthGuard() {
  const router = useRouter();
  useEffect(() => {
    if (!getSession()) router.replace("/login");
  }, [router]);
  return null;
}
