import Link from "next/link";
import {
  Crown,
  Bed,
  Plane,
  Car,
  FerrisWheel,
  CarTaxiFront,
  CircleHelp,
  Menu,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

const navIcons = {
  bed: Bed,
  plane: Plane,
  car: Car,
  ticket: FerrisWheel,
  taxi: CarTaxiFront,
};

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-10 py-3 sm:px-10 lg:gap-6 lg:px-24">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Crown className="h-7 w-7 text-gold sm:h-8 sm:w-8" strokeWidth={1.75} />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-lg font-bold tracking-wide text-navy sm:text-xl">
              ROYAL
            </span>
            <span className="text-[9px] font-semibold tracking-[0.3em] text-gold sm:text-[10px]">
              VACATION
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navLinks.map((link, index) => {
            const Icon = navIcons[link.icon];
            const active = index === 0;
            return (
              <Link
                key={link.id}
                href="#"
                className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${
                  active ? "text-navy" : "text-muted-foreground hover:text-navy"
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                {link.label}
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
                  <Crown className="h-6 w-6 text-gold" strokeWidth={1.75} />
                  <span className="flex flex-col leading-none">
                    <span className="font-heading text-base font-bold text-navy">
                      ROYAL
                    </span>
                    <span className="text-[8px] font-semibold tracking-[0.3em] text-gold">
                      VACATION
                    </span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {navLinks.map((link, index) => {
                  const Icon = navIcons[link.icon];
                  const active = index === 0;
                  return (
                    <SheetClose
                      key={link.id}
                      nativeButton={false}
                      render={
                        <Link
                          href="#"
                          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            active
                              ? "bg-navy/10 text-navy"
                              : "text-foreground hover:bg-muted"
                          }`}
                        />
                      }
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                      {link.label}
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
                <SheetClose
                  nativeButton={false}
                  render={
                    <Button
                      render={<Link href="/login" />}
                      nativeButton={false}
                      className="w-full rounded-full bg-navy text-white hover:bg-navy-light"
                    />
                  }
                >
                  Sign in
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
