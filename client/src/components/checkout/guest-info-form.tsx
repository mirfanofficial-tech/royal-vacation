"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { countryOptions } from "@/lib/checkout-mock-data";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ARRIVAL_TIMES = [
  { value: "", label: "I don't know" },
  ...Array.from({ length: 24 }, (_, h) => {
    const from = String(h).padStart(2, "0");
    const to = String((h + 1) % 24).padStart(2, "0");
    return { value: `${from}:00`, label: `${from}:00 – ${to}:00` };
  }),
];

export interface GuestInfoValues {
  firstName: string;
  lastName: string;
  email: string;
  dialCode: string;
  phone: string;
  country: string;
  whatsappUpdates: boolean;
  bookingFor: "main_guest" | "someone_else";
  arrivalTime: string;
  specialRequests: string;
  childAges: number[];
}

const selectClass =
  "h-10 rounded-lg border border-input bg-white px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function GuestInfoForm({
  adults,
  childrenCount,
  initialChildAges = [],
  onValuesChange,
}: {
  adults: number;
  childrenCount: number;
  initialChildAges?: number[];
  onValuesChange?: (values: GuestInfoValues, isValid: boolean) => void;
}) {
  const children = childrenCount;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState("+92");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("PK");
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);
  const [bookingFor, setBookingFor] = useState<"main_guest" | "someone_else">("main_guest");
  const [arrivalTime, setArrivalTime] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [childAges, setChildAges] = useState<number[]>(() =>
    Array.from({ length: childrenCount }, (_, i) => initialChildAges[i] ?? 8),
  );

  // Keep the child-age array length in sync with the search party.
  useEffect(() => {
    setChildAges((prev) => {
      if (prev.length === childrenCount) return prev;
      const next = prev.slice(0, childrenCount);
      while (next.length < childrenCount) next.push(initialChildAges[next.length] ?? 8);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenCount]);

  const touchedEmail = email.length > 0;
  const emailValid = EMAIL_RE.test(email.trim());
  const phoneValid = phone.replace(/\D/g, "").length >= 6;
  const childAgesOk =
    children <= 0 ||
    (childAges.length === children && childAges.every((a) => a >= 0 && a <= 17));

  const missing = useMemo(() => {
    const m: string[] = [];
    if (firstName.trim().length === 0) m.push("first name");
    if (lastName.trim().length === 0) m.push("last name");
    if (!emailValid) m.push("a valid email");
    if (!phoneValid) m.push("phone number");
    if (country.length === 0) m.push("country");
    if (!childAgesOk) m.push("children's ages");
    return m;
  }, [firstName, lastName, emailValid, phoneValid, country, childAgesOk]);

  const isValid = missing.length === 0;

  const childAgesKey = childAges.join(",");
  useEffect(() => {
    onValuesChange?.(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        dialCode,
        phone: phone.trim(),
        country,
        whatsappUpdates,
        bookingFor,
        arrivalTime,
        specialRequests: specialRequests.trim(),
        childAges,
      },
      isValid,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firstName,
    lastName,
    email,
    dialCode,
    phone,
    country,
    whatsappUpdates,
    bookingFor,
    arrivalTime,
    specialRequests,
    childAgesKey,
    isValid,
  ]);

  const fieldError = "text-xs text-destructive";

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-navy">Guest Information</h2>
          <p className="text-sm text-muted-foreground">
            Enter the details for the person checking in.
          </p>
        </div>
        <p className="text-sm text-muted-foreground sm:shrink-0">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Party summary — reflects the search */}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>
          This booking is for <strong>{adults}</strong> adult{adults > 1 ? "s" : ""}
          {children > 0 && (
            <>
              {" "}
              and <strong>{children}</strong> child{children > 1 ? "ren" : ""}
            </>
          )}
          .
        </span>
      </div>

      {/* Who's checking in */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        {(
          [
            ["main_guest", "I'm the main guest"],
            ["someone_else", "I'm booking for someone else"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="bookingFor"
              checked={bookingFor === value}
              onChange={() => setBookingFor(value)}
              className="accent-navy"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-medium text-foreground">
            First name <span className="text-destructive">*</span>
          </label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ali"
          />
          {firstName.length > 0 && firstName.trim().length === 0 && (
            <span className={fieldError}>First name is required</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-medium text-foreground">
            Last name <span className="text-destructive">*</span>
          </label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Khan"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email address <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ali.khan@email.com"
          />
          {touchedEmail && !emailValid && (
            <span className={fieldError}>Enter a valid email address</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone number <span className="text-destructive">*</span>
          </label>
          <div className="flex gap-2">
            <select
              aria-label="Dial code"
              value={dialCode}
              onChange={(e) => setDialCode(e.target.value)}
              className={`${selectClass} w-24 shrink-0`}
            >
              {countryOptions.map((c) => (
                <option key={c.value} value={c.dialCode}>
                  {c.dialCode}
                </option>
              ))}
            </select>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="300 1234567"
              className="flex-1"
            />
          </div>
          {phone.length > 0 && !phoneValid && (
            <span className={fieldError}>Enter a valid phone number</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-sm font-medium text-foreground">
            Country / Region <span className="text-destructive">*</span>
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={`${selectClass} w-full`}
          >
            {countryOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {children > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            Age of children at check-out <span className="text-destructive">*</span>
          </p>
          <div className="flex flex-wrap gap-3">
            {childAges.map((age, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label htmlFor={`child-age-${i}`} className="text-xs text-muted-foreground">
                  Child {i + 1}
                </label>
                <select
                  id={`child-age-${i}`}
                  value={age}
                  onChange={(e) =>
                    setChildAges((prev) =>
                      prev.map((a, idx) => (idx === i ? Number(e.target.value) : a)),
                    )
                  }
                  className={`${selectClass} w-28`}
                >
                  {Array.from({ length: 18 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "< 1 year" : `${n} year${n > 1 ? "s" : ""}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="arrivalTime" className="text-sm font-medium text-foreground">
            Estimated arrival time
          </label>
          <select
            id="arrivalTime"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            className={`${selectClass} w-full`}
          >
            {ARRIVAL_TIMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            Your room will be ready from 3:00 PM.
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="specialRequests" className="text-sm font-medium text-foreground">
            Special requests <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            id="specialRequests"
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            maxLength={1000}
            placeholder="e.g. high floor, early check-in, extra bed…"
            className="min-h-[40px]"
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <Checkbox
          checked={whatsappUpdates}
          onCheckedChange={(checked) => setWhatsappUpdates(checked === true)}
        />
        Receive booking confirmation and trip updates on WhatsApp
      </label>

      {missing.length > 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Still needed to continue: {missing.join(", ")}.
        </p>
      )}
    </div>
  );
}
