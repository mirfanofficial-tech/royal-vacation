"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Clock, MapPin, Phone } from "lucide-react";

type Office = {
  id: string;
  city: string;
  isHeadOffice?: boolean;
  address: string;
  phone: string;
  timezone: string;
  hoursLabel: string;
  openDays: number[]; // 0 = Sun … 6 = Sat
  openMinutes: number;
  closeMinutes: number;
};

const offices: Office[] = [
  {
    id: "dubai",
    city: "Dubai",
    isHeadOffice: true,
    address: "Marina Plaza, Level 14, Dubai Marina, UAE",
    phone: "+971 4 555 0199",
    timezone: "Asia/Dubai",
    hoursLabel: "Sun — Thu, 9:00 — 18:00 GST",
    openDays: [0, 1, 2, 3, 4],
    openMinutes: 9 * 60,
    closeMinutes: 18 * 60,
  },
  {
    id: "london",
    city: "London",
    address: "22 Bishopsgate, London EC2N 4BQ, UK",
    phone: "+44 20 7946 0810",
    timezone: "Europe/London",
    hoursLabel: "Mon — Fri, 9:00 — 17:30 GMT",
    openDays: [1, 2, 3, 4, 5],
    openMinutes: 9 * 60,
    closeMinutes: 17 * 60 + 30,
  },
  {
    id: "singapore",
    city: "Singapore",
    address: "1 Raffles Place, #40-02, Singapore 048616",
    phone: "+65 6812 4400",
    timezone: "Asia/Singapore",
    hoursLabel: "Mon — Fri, 9:00 — 18:00 SGT",
    openDays: [1, 2, 3, 4, 5],
    openMinutes: 9 * 60,
    closeMinutes: 18 * 60,
  },
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function isOfficeOpen(office: Office, now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: office.timezone,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const dayIndex = WEEKDAYS.indexOf(weekday);
  const minutesNow = hour * 60 + minute;
  return (
    office.openDays.includes(dayIndex) &&
    minutesNow >= office.openMinutes &&
    minutesNow < office.closeMinutes
  );
}

function nextOpenHour(office: Office): string {
  const hour = Math.floor(office.openMinutes / 60);
  const minute = office.openMinutes % 60;
  return minute === 0 ? `${hour}:00` : `${hour}:${String(minute).padStart(2, "0")}`;
}

export function OfficeLocations() {
  const [openStatus, setOpenStatus] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    function refresh() {
      const now = new Date();
      const status: Record<string, boolean> = {};
      for (const office of offices) status[office.id] = isOfficeOpen(office, now);
      setOpenStatus(status);
    }
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, []);

  const headOffice = offices.find((o) => o.isHeadOffice) ?? offices[0]!;
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(headOffice.address)}`;

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy">Visit an office</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Walk-ins welcome for bookings, visas and group planning.
          </p>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-navy hover:bg-muted sm:flex"
        >
          <MapPin className="h-3.5 w-3.5" />
          Open in maps
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="relative min-h-[280px] overflow-hidden rounded-2xl bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=900&q=80"
            alt="Aerial view of the Dubai coastline"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold text-navy">Head office · Dubai Marina</p>
              <p className="text-xs text-muted-foreground">Marina Plaza, Level 14</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-border rounded-2xl border border-border bg-white">
          {offices.map((office) => {
            const isOpen = openStatus?.[office.id];
            return (
              <div key={office.id} className="flex flex-col gap-1.5 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-semibold text-navy">
                    {office.city}
                    {office.isHeadOffice && (
                      <span className="text-xs font-normal text-muted-foreground">
                        · Head office
                      </span>
                    )}
                    {openStatus && (
                      <span
                        className={`flex items-center gap-1 text-xs font-medium ${
                          isOpen ? "text-rating" : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isOpen ? "bg-rating" : "bg-muted-foreground"}`}
                        />
                        {isOpen ? "Open now" : `Closed · opens ${nextOpenHour(office)}`}
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-navy">
                    <Phone className="h-3.5 w-3.5" />
                    {office.phone}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{office.address}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {office.hoursLabel}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
