import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { RegisterForm } from "@/components/register/register-form";
import { RegisterPromoPanel } from "@/components/register/register-promo-panel";
import { NewsletterBar } from "@/components/register/newsletter-bar";

export const metadata: Metadata = {
  title: "Create Your Account | Royal Vacation",
  description: "Join Royal Vacation and unlock a world of amazing travel experiences.",
};

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-muted/40">
        <div className="mx-auto max-w-[1400px] px-10 py-6 lg:px-24">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Register" }]} />

          <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_480px]">
            <RegisterForm />
            <RegisterPromoPanel />
          </div>
        </div>

        <div className="mt-8">
          <NewsletterBar />
        </div>
      </main>
      <Footer />
    </>
  );
}
