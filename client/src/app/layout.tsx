import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { FavoritesProvider } from "@/components/providers/favorites-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Vacation | Find Your Perfect Stay",
  description:
    "Search hotels, apartments, resorts, villas and more with Royal Vacation. No booking fees, best price guarantee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <QueryProvider>
          <FavoritesProvider>{children}</FavoritesProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
