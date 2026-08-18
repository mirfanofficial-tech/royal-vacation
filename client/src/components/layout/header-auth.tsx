"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api";
import { getSession, type ClientSession } from "@/lib/auth";

export function HeaderAuth({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const router = useRouter();
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, []);

  async function handleSignOut() {
    await logout();
    setSession(null);
    router.push("/");
  }

  if (variant === "mobile") {
    if (session) {
      return (
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-border py-2.5 text-sm font-medium text-foreground hover:border-navy"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      );
    }
    return (
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="w-full rounded-full bg-navy text-white hover:bg-navy-light"
      >
        Sign in
      </Button>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm font-medium text-foreground lg:inline">
          Hi, {session.name}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <Link
        href="/register"
        className="hidden text-sm font-medium text-foreground hover:text-navy lg:inline"
      >
        Register
      </Link>
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="hidden rounded-full bg-navy px-6 text-white hover:bg-navy-light sm:inline-flex"
      >
        Sign in
      </Button>
    </>
  );
}
