import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { WishlistView } from "@/components/wishlist/wishlist-view";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export const metadata: Metadata = {
  title: "My Wishlist | Royal Vacation",
  description: "Save your favorite properties and book them later.",
};

export default function WishlistPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 lg:px-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />

          <ScrollReveal>
            <div className="mt-4">
              <WishlistView />
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  );
}
