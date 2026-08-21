import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { HomeContent } from "@/components/home/home-content";
import { getRouteSeo, mergeRouteSeoMetadata } from "@/lib/cms-seo";

const DEFAULT_METADATA: Metadata = {
  title: "Royal Vacation | Find Your Perfect Stay",
  description:
    "Search hotels, apartments, resorts, villas and more with Royal Vacation. No booking fees, best price guarantee.",
};

export async function generateMetadata(): Promise<Metadata> {
  const routeSeo = await getRouteSeo("/");
  return mergeRouteSeoMetadata(routeSeo, DEFAULT_METADATA);
}

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <HomeContent />
      </main>
      <Footer />
    </>
  );
}
