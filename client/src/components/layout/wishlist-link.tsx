"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";

export function WishlistLink() {
  const { favoriteEntries } = useFavorites();
  const count = favoriteEntries.length;

  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="relative hidden h-6 w-6 items-center justify-center text-muted-foreground hover:text-navy md:flex"
    >
      <Heart className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-navy text-[9px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
