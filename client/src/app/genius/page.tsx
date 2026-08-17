import type { Metadata } from "next";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { GeniusWelcomeBanner } from "@/components/genius/genius-welcome-banner";
import { TierComparison } from "@/components/genius/tier-comparison";
import { QualifyingStays } from "@/components/genius/qualifying-stays";
import { GeniusPropertyGrid } from "@/components/genius/genius-property-grid";
import { HowGeniusWorks } from "@/components/genius/how-genius-works";

export const metadata: Metadata = {
  title: "Genius Loyalty | Royal Vacation",
  description:
    "Track your Genius level, qualifying stays and member-only prices with Royal Vacation.",
};

export default function GeniusPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-white">
          <div className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
            <GeniusWelcomeBanner />
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
            <TierComparison />
          </div>
        </div>

        <div className="bg-muted/40">
          <div className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
            <QualifyingStays />
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
            <GeniusPropertyGrid />
          </div>
        </div>

        <div className="bg-muted/40">
          <div className="mx-auto max-w-[1400px] px-10 py-10 lg:px-24">
            <HowGeniusWorks />
          </div>
        </div>

        <div className="bg-white">
          <div className="mx-auto max-w-[1400px] px-10 pb-10 lg:px-24">
            <TrustBadgesRow variant="plain" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
