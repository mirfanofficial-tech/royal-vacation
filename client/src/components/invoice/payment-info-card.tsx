import { CreditCard } from "lucide-react";

export function PaymentInfoCard({
  paymentMethodLabel,
  paidOn,
  transactionId,
  amountPaid,
  currency,
}: {
  paymentMethodLabel: string;
  paidOn: string;
  transactionId: string;
  amountPaid: number;
  currency: string;
}) {
  const columns = [
    { label: "Payment Method", value: paymentMethodLabel },
    { label: "Paid On", value: paidOn },
    { label: "Transaction ID", value: transactionId },
    { label: "Amount Paid", value: `${currency} ${amountPaid.toLocaleString()}` },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-navy">
        <CreditCard className="h-4 w-4" />
        Payment Information
      </h2>
      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        {columns.map((col) => (
          <div key={col.label}>
            <p className="text-xs text-muted-foreground">{col.label}</p>
            <p className="font-semibold text-foreground">{col.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
