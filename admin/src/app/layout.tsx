import type { Metadata } from "next";
import { Outfit } from "next/font/google";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Vacation | Admin Panel",
  description: "Manage properties, bookings and guests for Royal Vacation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-screen flex-col bg-muted/40 text-foreground">
        {children}
      </body>
    </html>
  );
}
