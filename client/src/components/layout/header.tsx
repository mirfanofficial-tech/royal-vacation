import Link from "next/link";
import {
  Bed,
  Plane,
  Car,
  FerrisWheel,
  CarTaxiFront,
  CircleHelp,
  Menu,
  Heart,
} from "lucide-react";
import { Logo } from "@/components/icons/logo";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { navLinks } from "@/lib/mock-data";
import { WishlistLink } from "@/components/layout/wishlist-link";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { HeaderAuth } from "@/components/layout/header-auth";
import { api } from "@/lib/api";

// CMS menu items have no icon field, so icons are matched by label. Any
// admin-added item whose label isn't recognized falls back to CircleHelp.
const iconsByLabel: Record<string, typeof Bed> = {
  stays: Bed,
  flights: Plane,
  cars: Car,
  attractions: FerrisWheel,
  "airport taxis": CarTaxiFront,
};

function iconFor(label: string) {
  return iconsByLabel[label.toLowerCase()] ?? CircleHelp;
}

export async function Header() {
  const menu = await api.cms.menus.get("header-main").catch(() => null);
  const items = menu
    ? menu.items.map((item) => ({
        id: item.id,
        label: item.label,
        href: item.page_slug ? `/pages/${item.page_slug}` : (item.url ?? "#"),
      }))
    : navLinks.map((link) => ({ id: link.id, label: link.label, href: "#" }));

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-10 py-3 sm:px-10 lg:gap-6 lg:px-24">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-8 w-auto sm:h-10" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {items.map((item, index) => {
            const Icon = iconFor(item.label);
            const active = index === 0;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  active ? "text-navy" : "text-muted-foreground hover:text-navy"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {item.label}
                <span
                  className={`h-1 w-1 rounded-full ${active ? "bg-navy" : "bg-transparent"}`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0 sm:gap-3 lg:gap-4">
          <div className="hidden md:flex">
            <LocaleSwitcher />
          </div>
          <WishlistLink />
          {/* <Link
            href="#"
            className="hidden text-sm font-medium text-foreground hover:text-navy xl:inline"
          >
            List your property
          </Link> */}
          <HeaderAuth />

          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy hover:border-navy lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-xs">
              <SheetHeader className="border-b border-border">
                <SheetTitle className="flex items-center gap-2">
                  <Logo className="h-6 w-auto" />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {items.map((item, index) => {
                  const Icon = iconFor(item.label);
                  const active = index === 0;
                  return (
                    <SheetClose
                      key={item.id}
                      nativeButton={false}
                      render={
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-navy/10 text-navy"
                              : "text-foreground hover:bg-muted"
                          }`}
                        />
                      }
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                      {item.label}
                    </SheetClose>
                  );
                })}
              </nav>

              <div className="mt-2 flex flex-col gap-1 border-t border-border px-4 pt-4">
                <div className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground">
                  <span>Language &amp; currency</span>
                  <LocaleSwitcher />
                </div>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="#"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  List your property
                </SheetClose>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/register"
                      className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  Register
                </SheetClose>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="#"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  <CircleHelp className="h-4 w-4" /> Help
                </SheetClose>
                <SheetClose
                  nativeButton={false}
                  render={
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                    />
                  }
                >
                  <Heart className="h-4 w-4" /> Wishlist
                </SheetClose>
              </div>

              <div className="mt-auto border-t border-border p-4">
                <HeaderAuth variant="mobile" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
