import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LoginForm } from "@/components/login/login-form";
import { LoginPromoPanel } from "@/components/login/login-promo-panel";
import { TrustBadgesRow } from "@/components/login/trust-badges-row";

export const metadata: Metadata = {
  title: "Sign In | Royal Vacation",
  description: "Sign in to your Royal Vacation account to access exclusive deals and manage bookings.",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-10">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-white shadow-sm lg:grid-cols-[1fr_1.15fr]">
            <LoginPromoPanel />
            <LoginForm />
          </div>

          <div className="mt-6">
            <TrustBadgesRow />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
