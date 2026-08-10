import { CheckCircle2, FileText, Calendar, Mail } from "lucide-react";

export function InvoiceTitleRow({
  invoiceNumber,
  invoiceDate,
  paidOnLabel,
}: {
  invoiceNumber: string;
  invoiceDate: string;
  paidOnLabel: string;
}) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-navy">Invoice</h1>
        <span className="flex items-center gap-1 rounded-full bg-rating/10 px-2.5 py-1 text-xs font-semibold text-rating">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Paid
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-4 w-4" />
          Invoice Number
          <span className="font-semibold text-foreground">{invoiceNumber}</span>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Invoice Date
          <span className="font-semibold text-foreground">{invoiceDate}</span>
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          Payment Status
          <span className="font-semibold text-rating">{paidOnLabel}</span>
        </span>
      </div>
    </div>
  );
}
