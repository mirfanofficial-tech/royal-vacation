"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarX,
  ChevronDown,
  Coins,
  CreditCard,
  FileText,
  GalleryHorizontal,
  Globe2,
  Hotel,
  HelpCircle,
  Images,
  Languages,
  LayoutDashboard,
  Layers,
  Link2,
  List,
  LogOut,
  Luggage,
  Mail,
  MessageSquare,
  Newspaper,
  Paintbrush,
  PanelsTopLeft,
  Palette,
  Plug,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingUp,
  Truck,
  Undo2,
  UserCog,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { logout, resolveAssetUrl } from "@/lib/api";
import { getSession, type AdminSession } from "@/lib/auth";
import { usePermissions } from "@/lib/roles";
import { useThemeQuery } from "@/lib/theme";
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
  /** Only highlight the parent row on an exact path match, not sub-paths. */
  exact?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  {
    href: "/stays",
    label: "Stays",
    icon: Hotel,
    module: "stays",
    children: [
      { href: "/stays/config", label: "Stays Config", icon: SlidersHorizontal, module: "stays" },
      { href: "/stays/property-types", label: "Property Types", icon: Building2, module: "stays" },
      { href: "/hotel-mapping", label: "Hotel Mapping", icon: Link2, module: "stays" },
    ],
  },
  // { href: "/properties", label: "Properties", icon: Building2, module: "properties" },
  {
    href: "/bookings",
    label: "Bookings",
    icon: CalendarCheck,
    module: "bookings",
    children: [
      { href: "/bookings", label: "Hotel Bookings", icon: Hotel, module: "bookings" },
      // Flight Bookings — added here once the flights module lands.
    ],
  },
  // { href: "/guests", label: "Guests", icon: Users, module: "guests" },
  
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    module: "reports",
    children: [
      { href: "/reports/bookings", label: "Booking Report", icon: FileText, module: "reports" },
      { href: "/reports/cancellations", label: "Cancellation Report", icon: CalendarX, module: "reports" },
      { href: "/reports/payments", label: "Payment Report", icon: CreditCard, module: "reports" },
      { href: "/reports/revenue", label: "Revenue Report", icon: TrendingUp, module: "reports" },
      { href: "/reports/refunds", label: "Refund Report", icon: Undo2, module: "reports" },
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
      { href: "/payments/promo-codes", label: "Promo Codes", icon: Tag, module: "payments" },
    ],
  },
  {
    href: "/cms",
    label: "CMS",
    icon: PanelsTopLeft,
    module: "cms",
    children: [
      { href: "/cms/pages", label: "Pages", icon: FileText, module: "cms" },
      { href: "/cms/media", label: "Media Library", icon: Images, module: "cms" },
      { href: "/cms/blocks", label: "Blocks", icon: Layers, module: "cms" },
      { href: "/cms/menus", label: "Menus", icon: List, module: "cms" },
      { href: "/cms/translations", label: "Translations", icon: Languages, module: "cms" },
      { href: "/cms/banners", label: "Banners & Sliders", icon: GalleryHorizontal, module: "cms" },
      { href: "/cms/faqs", label: "FAQs", icon: HelpCircle, module: "cms" },
      { href: "/cms/seo", label: "SEO Manager", icon: Search, module: "cms" },
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
      { href: "/blogs/comments", label: "Comments", icon: MessageSquare, module: "blog" },
    ],
  },
  {
    href: "/admin/users/travelers",
    label: "Users",
    icon: Users,
    module: "roles",
    children: [
      { href: "/admin/users/travelers", label: "Travelers", icon: Luggage, module: "roles" },
      { href: "/admin/users/property-agents", label: "Property Agents", icon: Building2, module: "roles" },
      { href: "/admin/users/employees", label: "Employees", icon: Briefcase, module: "roles" },
      { href: "/admin/users/suppliers", label: "Suppliers", icon: Truck, module: "roles" },
      { href: "/admin/users/admins", label: "Admin Users", icon: ShieldCheck, module: "roles" },
    ],
  },
  {
    href: "/admin",
    label: "Administration",
    icon: UserCog,
    module: "roles",
    exact: true,
    children: [
      { href: "/admin/roles", label: "Roles & Permissions", icon: ShieldCheck, module: "roles" },
      { href: "/admin/partners", label: "Partners", icon: Building2, module: "roles" },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    module: "settings",
    children: [
      { href: "/settings", label: "General", icon: Settings, module: "settings" },
      { href: "/modules", label: "Modules", icon: Plug, module: "modules" },
      { href: "/settings/currency", label: "Currency", icon: Coins, module: "settings" },
      { href: "/settings/language", label: "Language", icon: Languages, module: "settings" },
      { href: "/settings/countries", label: "Countries", icon: Globe2, module: "settings" },
      { href: "/settings/payment-gateways", label: "Payment Gateways", icon: CreditCard, module: "settings" },
      { href: "/settings/genius", label: "Genius Loyalty", icon: Sparkles, module: "settings" },
      { href: "/settings/themes", label: "Themes", icon: Palette, module: "settings" },
      { href: "/settings/appearance", label: "Admin Appearance", icon: Paintbrush, module: "settings" },
    ],
  },
  { href: "/contact", label: "Contact Messages", icon: Mail, module: "contact" },
];

const activeRow = "bg-sidebar-accent text-sidebar-accent-foreground font-semibold";
const inactiveRow =
  "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground";

export function AdminSidebar({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const { data: theme } = useThemeQuery();
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

  async function handleSignOut() {
    await logout();
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
        "flex h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 py-4",
          collapsed && "flex-col gap-2.5 px-2.5"
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-navy text-gold shadow-sm">
          {theme?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveAssetUrl(theme.logo_url)}
              alt="Logo"
              className="size-full object-contain"
            />
          ) : (
            <Hotel className="size-5" />
          )}
        </span>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Royal Vacation</p>
            <p className="truncate text-xs text-sidebar-foreground/60">Admin Panel</p>
          </div>
        )}
      </div>

      <div className="mx-4 border-t border-sidebar-border" />

      <nav className={cn("scrollbar-thin flex-1 space-y-0.5 overflow-y-auto py-3", collapsed ? "px-2.5" : "px-3")}>
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const selfActive = item.exact ? pathname === item.href : isActive(item.href);
            const active =
              item.children?.length
                ? selfActive || hasActiveChild(item)
                : selfActive;
            const open = expanded[item.href] ?? hasActiveChild(item);

            if (!item.children) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    collapsed && "justify-center px-0",
                    active ? activeRow : inactiveRow
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
                    "flex items-center justify-center rounded-xl px-0 py-2.5 text-sm transition-colors",
                    active ? activeRow : inactiveRow
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                </Link>
              );
            }

            return (
              <div key={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-xl transition-colors",
                    active && activeRow
                  )}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      !active && inactiveRow
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggle(item)}
                    aria-expanded={open}
                    aria-label={open ? "Collapse" : "Expand"}
                    className={cn(
                      "mr-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                      active && "text-sidebar-accent-foreground hover:bg-sidebar-accent"
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
                    <div className="mt-0.5 ml-5 space-y-0.5 border-l border-sidebar-border py-0.5 pl-3">
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
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                              childActive ? activeRow : inactiveRow
                            )}
                          >
                            <ChildIcon className="size-3.5 shrink-0" />
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

        <div className={cn("mt-auto p-3", collapsed ? "px-2.5" : "px-3")}>
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-2",
              collapsed && "justify-center"
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-gold shadow-sm">
              {initials}
            </span>
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-sidebar-foreground">
                    {session?.name ?? "Admin"}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    {session?.email ?? "admin@royalvacation.com"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors outline-none hover:bg-sidebar-accent hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <LogOut className="size-4" />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out"
              className="mt-1.5 flex w-full items-center justify-center rounded-xl py-2 text-sidebar-foreground/70 transition-colors outline-none hover:bg-sidebar-accent/60 hover:text-destructive focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
    </aside>
  );
}
