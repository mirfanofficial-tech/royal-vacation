import type { Metadata } from "next";
import { Clock, Headset, Languages, ShieldCheck } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";
import { ContactChannels } from "@/components/contact/contact-channels";
import { ContactForm } from "@/components/contact/contact-form";
import { OfficeLocations } from "@/components/contact/office-locations";
import { QuickActions } from "@/components/contact/quick-actions";
import { ScrollReveal } from "@/components/shared/scroll-reveal";

export const metadata: Metadata = {
  title: "Contact Us | Royal Vacation",
  description:
    "Questions about a booking, a property, or planning something ambitious? Talk to the Royal Vacation concierge team.",
};

const trustPills = [
  { id: "reply-time", icon: Clock, label: "Avg. reply in 2 hours" },
  { id: "phone-support", icon: Headset, label: "24/7 phone support" },
  { id: "languages", icon: Languages, label: "12 languages" },
  { id: "secure", icon: ShieldCheck, label: "Secure & confidential" },
];

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="bg-white">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 lg:px-24">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Help centre" },
                { label: "Contact us" },
              ]}
            />

            <div className="mt-4 max-w-2xl">
              <h1 className="font-heading text-4xl font-bold text-navy">
                Talk to a travel concierge
              </h1>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Questions about a booking, a property, or planning something ambitious? Our team
                answers in under two hours, every day of the year.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 pb-2">
              {trustPills.map((pill) => (
                <span
                  key={pill.id}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-medium text-foreground"
                >
                  <pill.icon className="h-3.5 w-3.5 text-navy" />
                  {pill.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <ScrollReveal>
          <div className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 lg:px-24">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
                <ContactChannels />
                <ContactForm />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 lg:px-24">
              <OfficeLocations />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 py-10 lg:px-24">
              <QuickActions />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="bg-white">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 pb-10 lg:px-24">
              <TrustBadgesRow variant="plain" />
            </div>
          </div>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
