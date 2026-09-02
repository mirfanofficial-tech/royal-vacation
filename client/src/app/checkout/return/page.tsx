"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { bookings } from "@/lib/api";
import { LAST_CHECKOUT_KEY } from "@/components/checkout/checkout-form-sections";
import { CheckoutHeader } from "@/components/checkout/checkout-header";

export default function CheckoutReturnPage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    let stored: { id: string; token: string } | null = null;
    try {
      const raw = sessionStorage.getItem(LAST_CHECKOUT_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }

    if (!stored?.id) {
      setFailed(true);
      return;
    }

    bookings
      .sync(stored.id, stored.token)
      .catch(() => undefined)
      .finally(() => {
        router.replace(
          `/booking/${stored.id}?t=${encodeURIComponent(stored.token)}`,
        );
      });
  }, [router]);

  return (
    <>
      <CheckoutHeader />
      <main className="flex flex-1 items-center justify-center bg-white p-10">
        {failed ? (
          <div className="max-w-sm text-center">
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t automatically load your booking on this device. Check
              your email for the confirmation, or view your bookings.
            </p>
            <Link
              href="/bookings"
              className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
            >
              My bookings
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Confirming your payment…</p>
          </div>
        )}
      </main>
    </>
  );
}
