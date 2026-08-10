"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  ChevronRight,
  HelpCircle,
  LogOut,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, getSession, type AdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const initialNotifications: NavNotification[] = [
  {
    id: "n1",
    title: "New booking received",
    body: "Booking #BK-2048 · Marina Suite, Dubai",
    time: "2m ago",
    read: false,
  },
  {
    id: "n2",
    title: "Payment gateway offline",
    body: "Stripe production environment is unreachable.",
    time: "26m ago",
    read: false,
  },
  {
    id: "n3",
    title: "Guest checked in",
    body: "Sarah Mitchell · Palm Jumeirah Villa",
    time: "1h ago",
    read: true,
  },
  {
    id: "n4",
    title: "API key updated",
    body: "Amadeus test credentials were rotated.",
    time: "3h ago",
    read: true,
  },
];

const segmentLabels: Record<string, string> = {
  "": "Home",
  properties: "Properties",
  bookings: "Bookings",
  guests: "Guests",
  modules: "Modules",
  cms: "CMS",
  pages: "Pages",
  menus: "Menus",
  blogs: "Blog",
  categories: "Categories",
  reports: "Reports",
  finance: "Finance",
  occupancy: "Occupancy",
  payouts: "Payouts",
  payments: "Payments",
  transactions: "Transactions",
  invoices: "Invoices",
  refunds: "Refunds",
  admin: "Administration",
  users: "Users",
  roles: "Roles & Permissions",
  settings: "Settings",
  general: "General",
  currency: "Currency",
  language: "Language",
  countries: "Countries",
  "payment-gateways": "Payment Gateways",
};

function useBreadcrumb(pathname: string) {
  const crumbs: { href: string; label: string }[] = [];
  let acc = "";
  for (const seg of pathname.split("/").filter(Boolean)) {
    const label = segmentLabels[seg];
    if (!label) continue;
    acc += "/" + seg;
    crumbs.push({ href: acc, label });
  }
  return crumbs;
}

export function AdminTopbar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const crumbs = useBreadcrumb(pathname);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [notifications, setNotifications] =
    useState<NavNotification[]>(initialNotifications);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSession(getSession());
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-white/80 px-3 backdrop-blur sm:gap-3 sm:px-5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={onToggleCollapse}
        className="text-muted-foreground"
      >
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      </Button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 sm:flex">
        {crumbs.length === 0 ? (
          <span className="truncate text-sm font-medium text-foreground">Dashboard</span>
        ) : (
          crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex min-w-0 items-center gap-1">
              {i > 0 && (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/60" />
              )}
              {i === crumbs.length - 1 ? (
                <span className="truncate text-sm font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="truncate text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search properties, bookings…"
            aria-label="Search"
            className="h-8 w-56 pl-8 lg:w-72"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Quick actions"
            className="outline-none"
          >
            <Button variant="outline" size="sm">
              <Plus data-icon="inline-start" />
              <span className="hidden lg:inline">New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-8} className="w-52">
            <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
            <DropdownMenuItem
              render={<Link href="/blogs/new" />}
            >
              <Newspaper />
              New blog post
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/admin/roles/new" />}
            >
              <ShieldCheck />
              New role
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/admin/users" />}
            >
              <Users />
              Invite user
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              render={<Link href="/settings" />}
            >
              <Settings2 />
              Site settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Notifications (${unread} unread)`}
            className="relative inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Bell className="size-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 flex size-2 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-gold ring-2 ring-white" />
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-8} className="w-80">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary outline-none hover:underline focus-visible:underline"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all as read
                </button>
              )}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-2.5 rounded-md px-2 py-2",
                    !n.read && "bg-muted/60"
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.read ? "bg-muted-foreground/30" : "bg-gold"
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/70">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Help"
          className="text-muted-foreground"
        >
          <HelpCircle />
        </Button>

        <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Avatar className="size-8">
              <AvatarFallback className="bg-navy text-[11px] font-semibold text-gold">
                {session
                  ? session.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "RV"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" alignOffset={-8} className="w-56">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.name ?? "Administrator"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.email ?? "admin@royalvacation.com"}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/users" />}>
              <UserRound />
              My profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>
              <Settings2 />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
