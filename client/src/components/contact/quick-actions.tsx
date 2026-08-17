import Link from "next/link";
import { ArrowUpRight, Calendar, FileText, RefreshCcw, ShieldAlert } from "lucide-react";

const actions = [
  {
    id: "manage-booking",
    icon: Calendar,
    title: "Change or cancel a booking",
    description: "Manage dates, guests and rooms",
  },
  {
    id: "track-refund",
    icon: RefreshCcw,
    title: "Track a refund",
    description: "Most refunds land in 5—7 days",
  },
  {
    id: "invoice",
    icon: FileText,
    title: "Get an invoice or receipt",
    description: "Download VAT-ready documents",
  },
  {
    id: "report-issue",
    icon: ShieldAlert,
    title: "Report a problem with a stay",
    description: "We'll open a case within 1 hour",
  },
];

export function QuickActions() {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-navy">Faster than writing to us</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Most requests can be handled instantly from your account.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.id}
            href="/login"
            className="group flex flex-col gap-3 rounded-xl border border-border bg-white p-5 transition-colors hover:border-navy"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy">
                <action.icon className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-navy" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{action.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
