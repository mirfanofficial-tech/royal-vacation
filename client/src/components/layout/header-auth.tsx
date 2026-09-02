"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Gem,
  Heart,
  LogOut,
  Luggage,
  Star,
  UserRound,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/api";
import { getSession, type ClientSession } from "@/lib/auth";

const ACCOUNT_LINKS: { href: string; label: string; icon: typeof UserRound }[] = [
  { href: "/account", label: "My account", icon: UserRound },
  { href: "/account/trips", label: "Bookings & Trips", icon: Luggage },
  { href: "/account/rewards", label: "Genius loyalty programme", icon: Gem },
  { href: "/account/rewards", label: "Rewards & Wallet", icon: Wallet },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/saved", label: "Saved", icon: Heart },
  { href: "/account/business", label: "Activate business account", icon: Building2 },
];

function initialsOf(name: string) {
  return (
    name
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RV"
  );
}

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

  // ---- mobile ----------------------------------------------------------
  if (variant === "mobile") {
    if (session) {
      return (
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-2 px-1 py-2">
            <Avatar className="size-8">
              <AvatarFallback className="bg-navy text-[11px] font-semibold text-white">
                {initialsOf(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
              <p className="text-xs font-medium text-gold">Genius Level 1</p>
            </div>
          </div>
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
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

  // ---- desktop --------------------------------------------------------
  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Your account"
          className="flex items-center gap-2 rounded-full p-0.5 outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-navy text-[11px] font-semibold text-white">
              {initialsOf(session.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-sm font-semibold text-foreground">Your account</span>
            <span className="block text-xs font-medium text-gold">Genius Level 1</span>
          </span>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground lg:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" alignOffset={-4} className="w-64">
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
            <p className="truncate text-xs text-muted-foreground">{session.email}</p>
          </div>
          <DropdownMenuSeparator />
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem key={label} render={<Link href={href} />}>
              <Icon />
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
