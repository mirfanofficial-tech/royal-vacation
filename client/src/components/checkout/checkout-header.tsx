import Link from "next/link";
import { Crown, ShieldCheck } from "lucide-react";

export function CheckoutHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="h-8 w-8 text-gold" strokeWidth={1.75} />
          <span className="flex flex-col leading-none">
            <span className="font-heading text-xl font-bold tracking-wide text-navy">ROYAL</span>
            <span className="text-[10px] font-semibold tracking-[0.3em] text-gold">VACATION</span>
          </span>
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
