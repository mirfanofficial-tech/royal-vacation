import { User } from "lucide-react";

export function GuestDetailsCard({
  guestName,
  email,
  phone,
  country,
}: {
  guestName: string;
  email: string;
  phone: string;
  country: string;
}) {
  const rows = [
    { label: "Guest Name", value: guestName },
    { label: "Email", value: email },
    { label: "Phone", value: phone },
    { label: "Country / Region", value: country },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy">
        <User className="h-4 w-4" />
        Guest Details
      </h2>
      <dl className="flex flex-col gap-2.5 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">{row.label}</dt>
            <dd className="font-medium text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
