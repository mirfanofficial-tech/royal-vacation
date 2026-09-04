"use client";

import Link from "next/link";
import { Download, Printer, Share2 } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";

export function InvoiceHeader() {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Logo className="h-10 w-auto" />
      </Link>

      {/* <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" className="gap-1.5 rounded-lg">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="gap-1.5 rounded-lg"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button className="gap-1.5 rounded-lg bg-navy text-white hover:bg-navy-light">
          <Share2 className="h-4 w-4" />
          Share Invoice
        </Button>
      </div> */}
    </div>
  );
}
