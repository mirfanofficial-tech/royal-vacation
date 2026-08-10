"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hotel } from "lucide-react";

import { isAuthenticated } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-navy text-gold">
            <Hotel className="size-6" />
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-navy" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
