import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { PropertyTypes } from "@/components/home/property-types";
import { PropertyCarouselSection } from "@/components/home/property-carousel-section";
import { Attractions } from "@/components/home/attractions";
import { GeniusBanner } from "@/components/home/genius-banner";
import { Destinations } from "@/components/home/destinations";
import { Blogs } from "@/components/home/blogs";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { featuredProperties, homesGuestsLove } from "@/lib/mock-data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <PropertyTypes />
        <PropertyCarouselSection title="Featured Properties" properties={featuredProperties} />
        <PropertyCarouselSection title="Homes guests love" properties={homesGuestsLove} />
        <Attractions />
        <GeniusBanner />
        <Destinations />
        <Blogs />
        <div className="mx-auto max-w-[1400px] px-6 pb-10 lg:px-10">
          <TrustBadgesRow variant="plain" />
        </div>
      </main>
      <Footer />
    </>
  );
}
