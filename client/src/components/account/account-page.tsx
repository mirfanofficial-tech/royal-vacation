import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { AccountAuthGuard } from "@/components/account/account-auth-guard";

export function AccountPage({
  title,
  crumbs,
  wide = false,
  action,
  children,
}: {
  title: string;
  crumbs: { label: string; href?: string }[];
  /** Drop the readable 3xl cap — for wide content like the invoice document. */
  wide?: boolean;
  /** Rendered opposite the breadcrumb (top-right) — e.g. invoice actions. */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <AccountAuthGuard />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-24 print:max-w-none print:p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
            <Breadcrumb
              items={[{ label: "Home", href: "/" }, { label: "My account", href: "/account" }, ...crumbs]}
            />
            {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
          </div>
          <h1 className="mt-2 font-heading text-2xl font-bold text-navy print:hidden">{title}</h1>
          <div className={wide ? "mt-4 print:mt-0 print:p-0" : "mt-4 max-w-3xl print:mt-0 print:p-0"}>{children}</div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
