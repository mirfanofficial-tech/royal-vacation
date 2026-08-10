import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { PropertyTypes } from "@/components/home/property-types";
import { PropertyCarouselSection } from "@/components/home/property-carousel-section";
import { GeniusBanner } from "@/components/home/genius-banner";
import { Destinations } from "@/components/home/destinations";
import { Blogs } from "@/components/home/blogs";
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
        <GeniusBanner />
        <Destinations />
        <Blogs />
      </main>
      <Footer />
    </>
  );
}
