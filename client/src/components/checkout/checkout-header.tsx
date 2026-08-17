import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/icons/logo";

export function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-2 text-right">
          <ShieldCheck className="h-6 w-6 shrink-0 text-rating" />
          <div className="leading-tight">
            <p className="text-sm font-semibold text-foreground">Secure booking</p>
            <p className="text-xs text-muted-foreground">Your data is protected</p>
          </div>
        </div>
      </div>
    </header>
  );
}
