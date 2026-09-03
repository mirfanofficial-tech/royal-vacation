import Link from "next/link";
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GeniusInlineBanner() {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl bg-navy/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-gold sm:mt-0" />
        <p className="text-sm text-foreground">
          <span className="font-semibold text-navy">Unlock exclusive discounts with Loyality</span>{" "}
          <span className="ml-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-bold text-navy-dark">
            Loyality
          </span>
          <br className="hidden sm:block" />
          Sign in and save up to 20% on selected properties in Dubai
        </p>
      </div>
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="w-full shrink-0 rounded-lg bg-navy text-white hover:bg-navy-light sm:w-auto"
      >
        Sign in / Register
      </Button>
    </div>
  );
}
