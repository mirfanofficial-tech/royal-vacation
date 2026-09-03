"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
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

const GENIUS_LABEL = "Genius Level 1";

const ACCOUNT_LINKS: { href: string; label: string; icon: typeof UserRound }[] = [
  { href: "/account", label: "My account", icon: UserRound },
  { href: "/account/trips", label: "Bookings & Trips", icon: Luggage },
  { href: "/genius", label: "Genius loyalty programme", icon: Gem },
  { href: "/account/rewards", label: "Rewards & Wallet", icon: Wallet },
  { href: "/account/reviews", label: "Reviews", icon: Star },
  { href: "/account/saved", label: "Saved", icon: Heart },
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
          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-3"
          >
            <Avatar className="size-11 border border-border">
              <AvatarFallback className="bg-navy text-xs font-semibold text-white">
                {initialsOf(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-dark">
                <Gem className="h-3 w-3" />
                {GENIUS_LABEL}
              </span>
            </div>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
          <div className="my-1 h-px bg-border" />
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
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
          className="group/hauth flex items-center gap-2 rounded-full border border-transparent py-0.5 pr-1 pl-0.5 outline-none transition-colors hover:border-border hover:bg-muted data-[popup-open]:border-border data-[popup-open]:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 lg:pr-2"
        >
          <Avatar className="size-8 border border-border">
            <AvatarFallback className="bg-navy text-[11px] font-semibold text-white">
              {initialsOf(session.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-left leading-tight lg:block">
            <span className="block text-sm font-semibold text-foreground">Your account</span>
            <span className="block text-xs font-medium text-gold">{GENIUS_LABEL}</span>
          </span>
          <ChevronDown className="hidden size-4 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/hauth:rotate-180 lg:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" alignOffset={-4} sideOffset={10} className="w-72 p-1.5">
          <DropdownMenuItem
            render={<Link href="/account" />}
            className="gap-3 rounded-lg p-2"
          >
            <Avatar className="size-10 border border-border">
              <AvatarFallback className="bg-navy text-xs font-semibold text-white">
                {initialsOf(session.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{session.name}</p>
              <p className="truncate text-xs text-muted-foreground">{session.email}</p>
            </div>
            <ChevronRight className="shrink-0 text-muted-foreground" />
          </DropdownMenuItem>
          <span className="mx-2 mt-1.5 mb-0.5 flex w-fit items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-navy-dark">
            <Gem className="h-3 w-3" />
            {GENIUS_LABEL}
          </span>
          <DropdownMenuSeparator />
          {ACCOUNT_LINKS.map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem
              key={label}
              render={<Link href={href} />}
              className="gap-2.5 px-2 py-2"
            >
              <Icon className="text-muted-foreground" />
              {label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleSignOut}
            className="gap-2.5 px-2 py-2"
          >
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
