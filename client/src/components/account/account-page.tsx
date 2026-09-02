import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { AccountAuthGuard } from "@/components/account/account-auth-guard";

export function AccountPage({
  title,
  crumbs,
  wide = false,
  children,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
  /** Drop the readable 3xl cap — for wide content like the invoice document. */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <Header />
      <AccountAuthGuard />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-24">
          <Breadcrumb
            items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, ...crumbs]}
          />
          <h1 className="mt-2 font-heading text-2xl font-bold text-navy">{title}</h1>
          <div className={wide ? "mt-4" : "mt-4 max-w-3xl"}>{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}
