"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFavorites } from "@/components/providers/favorites-provider";
import { getAllWishlistableProperties, type WishlistCategory } from "@/lib/wishlist-mock-data";
import { WishlistSidebar } from "@/components/wishlist/wishlist-sidebar";
import { WishlistPropertyCard } from "@/components/wishlist/wishlist-property-card";

const categoryLabels: Record<WishlistCategory, string> = {
  hotels: "Hotels",
  apartments: "Apartments",
  resorts: "Resorts",
};

const sortOptions = [
  { value: "newest", label: "Date added (Newest)" },
  { value: "oldest", label: "Date added (Oldest)" },
  { value: "price-low", label: "Price (low to high)" },
  { value: "price-high", label: "Price (high to low)" },
  { value: "rating", label: "Guest rating" },
];

export function WishlistView() {
  const { favoriteEntries, clearFavorites } = useFavorites();
  const [activeCategory, setActiveCategory] = useState<"all" | WishlistCategory>("all");
  const [sortValue, setSortValue] = useState("newest");
  const [copied, setCopied] = useState(false);

  const allProperties = useMemo(() => getAllWishlistableProperties(), []);

  const items = useMemo(() => {
    const byId = new Map(allProperties.map((property) => [property.id, property]));
    return favoriteEntries
      .map((entry) => {
        const property = byId.get(entry.id);
        return property ? { property, addedAt: entry.addedAt } : null;
      })
      .filter((item): item is { property: (typeof allProperties)[number]; addedAt: number } =>
        item !== null
      );
  }, [favoriteEntries, allProperties]);

  const categoryCounts = useMemo(() => {
    const counts: Record<WishlistCategory, number> = { hotels: 0, apartments: 0, resorts: 0 };
    items.forEach((item) => {
      counts[item.property.category] += 1;
    });
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const filtered =
      activeCategory === "all"
        ? items
        : items.filter((item) => item.property.category === activeCategory);

    const sorted = [...filtered];
    switch (sortValue) {
      case "oldest":
        sorted.sort((a, b) => a.addedAt - b.addedAt);
        break;
      case "price-low":
        sorted.sort((a, b) => a.property.price - b.property.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.property.price - a.property.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.property.rating - a.property.rating);
        break;
      default:
        sorted.sort((a, b) => b.addedAt - a.addedAt);
    }
    return sorted;
  }, [items, activeCategory, sortValue]);

  const destinationCount = useMemo(
    () => new Set(items.map((item) => item.property.location)).size,
    [items]
  );
  const averageRating = useMemo(() => {
    if (items.length === 0) return null;
    return items.reduce((sum, item) => sum + item.property.rating, 0) / items.length;
  }, [items]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/wishlist`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — no-op
    }
  };

  const categories: { id: "all" | WishlistCategory; label: string; count: number }[] = [
    { id: "all", label: "All", count: items.length },
    ...(Object.keys(categoryCounts) as WishlistCategory[])
      .filter((id) => categoryCounts[id] > 0)
      .map((id) => ({ id, label: categoryLabels[id], count: categoryCounts[id] })),
  ];

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-heading text-2xl font-bold text-navy">My Wishlist</h1>
            <p className="text-sm text-muted-foreground">
              Save your favorite properties and book them later.
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" onClick={handleShare} className="gap-1.5 rounded-lg">
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Link copied" : "Share wishlist"}
            </Button>
            <Button
              onClick={clearFavorites}
              className="rounded-lg bg-navy text-white hover:bg-navy-light"
            >
              Remove all
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-white py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
            <Heart className="h-6 w-6" />
          </span>
          <p className="text-base font-semibold text-foreground">Your wishlist is empty</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Tap the heart icon on any property to save it here and come back to it later.
          </p>
          <Button
            render={<Link href="/search" />}
            nativeButton={false}
            className="mt-2 rounded-lg bg-navy text-white hover:bg-navy-light"
          >
            Browse properties
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <WishlistSidebar
            totalProperties={items.length}
            destinationCount={destinationCount}
            averageRating={averageRating}
          />

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? "border-navy text-navy"
                        : "border-transparent text-muted-foreground hover:text-navy"
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>

              <Select
                value={sortValue}
                onValueChange={(value) => value && setSortValue(value)}
              >
                <SelectTrigger className="w-full rounded-lg bg-white sm:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredItems.map((item) => (
                <WishlistPropertyCard
                  key={item.property.id}
                  property={item.property}
                  addedAt={item.addedAt}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
