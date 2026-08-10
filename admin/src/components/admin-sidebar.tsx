"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarCheck,
  ChevronDown,
  Coins,
  CreditCard,
  FileText,
  Globe2,
  Hotel,
  Languages,
  LayoutDashboard,
  List,
  LogOut,
  Newspaper,
  PanelsTopLeft,
  Plug,
  ReceiptText,
  Settings,
  ShieldCheck,
  Undo2,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { clearSession, getSession, type AdminSession } from "@/lib/auth";
import { usePermissions } from "@/lib/roles";
import type { ModuleKey } from "@/lib/mock-data";

interface NavChild {
  href: string;
  label: string;
  icon: LucideIcon;
  module: ModuleKey;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  module: ModuleKey;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/properties", label: "Properties", icon: Building2, module: "properties" },
  { href: "/bookings", label: "Bookings", icon: CalendarCheck, module: "bookings" },
  { href: "/guests", label: "Guests", icon: Users, module: "guests" },
  { href: "/modules", label: "Modules", icon: Plug, module: "modules" },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    module: "reports",
    children: [
      { href: "/reports/finance", label: "Finance", icon: BarChart3, module: "reports" },
      { href: "/reports/occupancy", label: "Occupancy", icon: Hotel, module: "reports" },
      { href: "/reports/payouts", label: "Payouts", icon: Coins, module: "reports" },
    ],
  },
  {
    href: "/payments",
    label: "Payments",
    icon: Wallet,
    module: "payments",
    children: [
      { href: "/payments/transactions", label: "Transactions", icon: CreditCard, module: "payments" },
      { href: "/payments/invoices", label: "Invoices", icon: ReceiptText, module: "payments" },
      { href: "/payments/refunds", label: "Refunds", icon: Undo2, module: "payments" },
    ],
  },
  {
    href: "/cms",
    label: "CMS",
    icon: PanelsTopLeft,
    module: "cms",
    children: [
      { href: "/cms/pages", label: "Pages", icon: FileText, module: "cms" },
      { href: "/cms/menus", label: "Menus", icon: List, module: "cms" },
    ],
  },
  {
    href: "/blogs",
    label: "Blog",
    icon: Newspaper,
    module: "blog",
    children: [
      { href: "/blogs", label: "Posts", icon: Newspaper, module: "blog" },
      { href: "/blogs/categories", label: "Categories", icon: Newspaper, module: "blog" },
    ],
  },
  {
    href: "/admin",
    label: "Administration",
    icon: UserCog,
    module: "roles",
    children: [
      { href: "/admin/users", label: "User Management", icon: Users, module: "roles" },
      { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, module: "roles" },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    module: "settings",
    children: [
      { href: "/settings", label: "General", icon: Settings, module: "settings" },
      { href: "/settings/currency", label: "Currency", icon: Coins, module: "settings" },
      { href: "/settings/language", label: "Language", icon: Languages, module: "settings" },
      { href: "/settings/countries", label: "Countries", icon: Globe2, module: "settings" },
      { href: "/settings/payment-gateways", label: "Payment Gateways", icon: CreditCard, module: "settings" },
    ],
  },
];

const linkClass =
  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

export function AdminSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [session, setSession] = useState<AdminSession | null>(null);
  const { can } = usePermissions();

  useEffect(() => {
    setSession(getSession());
  }, []);

  const visibleNav = navItems.filter((item) =>
    item.children
      ? item.children.some((child) => can(child.module, "view"))
      : can(item.module, "view")
  );

  const initials = session
    ? session.name
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "RV";

  function handleSignOut() {
    clearSession();
    router.push("/login");
  }

  function isActive(href: string) {
    return href === "/"
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
  }

  function hasActiveChild(item: NavItem) {
    return item.children?.some((child) => isActive(child.href)) ?? false;
  }

  function toggle(item: NavItem) {
    setExpanded((prev) => ({ ...prev, [item.href]: !(prev[item.href] ?? hasActiveChild(item)) }));
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-white transition-[width] duration-200",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-border px-5 py-4",
          collapsed && "justify-center px-0"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy text-gold">
          <Hotel className="size-5" />
        </span>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-navy">Royal Vacation</p>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-3")}>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active =
            item.children?.length
              ? isActive(item.href) || hasActiveChild(item)
              : isActive(item.href);
          const open =
            expanded[item.href] ?? hasActiveChild(item);

          if (!item.children) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  linkClass,
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-navy text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          }

          if (collapsed) {
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  linkClass,
                  "justify-center px-0",
                  active
                    ? "bg-navy/10 text-navy"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
              </Link>
            );
          }

          return (
            <div key={item.href}>
              <div className="flex items-center gap-1">
                <Link
                  href={item.href}
                  className={cn(
                    linkClass,
                    "flex-1",
                    active
                      ? "bg-navy/10 text-navy"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  aria-expanded={open}
                  aria-label={open ? "Collapse" : "Expand"}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                    active && "text-navy hover:bg-navy/10 hover:text-navy"
                  )}
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform duration-200",
                      open && "rotate-180"
                    )}
                  />
                </button>
              </div>
              <div
                className={cn(
                  "grid transition-[grid-template-rows,opacity] duration-200 ease-out",
                  open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <div className="ml-2 mt-1 space-y-0.5 rounded-lg border border-border/70 bg-muted/40 p-1.5">
                    {item.children
                      .filter((child) => can(child.module, "view"))
                      .map((child) => {
                      const ChildIcon = child.icon;
                      const childActive = isActive(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                            childActive
                              ? "bg-navy text-white shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <ChildIcon
                            className={cn("size-4", childActive && "text-gold")}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className={cn("border-t border-border", collapsed ? "p-2" : "p-3")}>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-2 py-2",
            collapsed && "justify-center px-0"
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {session?.email ?? "admin@royalvacation.com"}
              </p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={cn(
            "mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
