"use client";

import { createContext, useContext, useRef, useState } from "react";

import type { BookingOut } from "@royal-vacation/api-client";

type Ctx = {
  booking: BookingOut | null;
  setBooking: React.Dispatch<React.SetStateAction<BookingOut | null>>;
  docRef: React.RefObject<HTMLDivElement | null>;
};

const BookingInvoiceContext = createContext<Ctx | null>(null);

export function BookingInvoiceProvider({ children }: { children: React.ReactNode }) {
  const [booking, setBooking] = useState<BookingOut | null>(null);
  const docRef = useRef<HTMLDivElement>(null);

  return (
    <BookingInvoiceContext.Provider value={{ booking, setBooking, docRef }}>
      {children}
    </BookingInvoiceContext.Provider>
  );
}

export function useBookingInvoice(): Ctx {
  const ctx = useContext(BookingInvoiceContext);
  if (!ctx) throw new Error("useBookingInvoice must be used within BookingInvoiceProvider");
  return ctx;
}
