import { ShieldCheck } from "lucide-react";

export function ThankYouNote() {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-navy/5 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-navy" />
      <div>
        <p className="text-sm font-semibold text-navy">Thank you for choosing Royal Vacation!</p>
        <p className="text-sm text-muted-foreground">
          We hope you had a wonderful stay. We look forward to welcoming you again.
        </p>
      </div>
    </div>
  );
}
