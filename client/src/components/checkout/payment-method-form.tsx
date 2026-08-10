"use client";

import { useEffect, useState } from "react";
import { CreditCard, Wallet, Landmark, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { paymentMethods, type PaymentMethod } from "@/lib/checkout-mock-data";

const methodIcons: Record<PaymentMethod["icon"], typeof CreditCard> = {
  card: CreditCard,
  easypaisa: Wallet,
  jazzcash: Wallet,
  bank: Landmark,
};

const methodAccents: Record<PaymentMethod["icon"], string> = {
  card: "text-navy",
  easypaisa: "text-rating",
  jazzcash: "text-red-600",
  bank: "text-navy",
};

export function PaymentMethodForm({
  onMethodChange,
}: {
  onMethodChange?: (methodId: string) => void;
}) {
  const [selected, setSelected] = useState("card");

  useEffect(() => {
    onMethodChange?.(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectMethod = (id: string) => {
    setSelected(id);
    onMethodChange?.(id);
  };

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <h2 className="text-base font-semibold text-navy">Payment Method</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Choose a payment method and complete your payment securely.
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {paymentMethods.map((method) => {
          const Icon = methodIcons[method.icon];
          const isActive = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => selectMethod(method.id)}
              className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors ${
                isActive ? "border-navy ring-1 ring-navy" : "border-border hover:border-navy/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${methodAccents[method.icon]}`} />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {method.title}
                </span>
                <span className="block text-xs text-muted-foreground">{method.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>

      {selected === "card" && (
        <div className="mt-5 border-t border-border pt-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Card Details</h3>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="cardNumber" className="text-sm font-medium text-foreground">
              Card number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Input
                id="cardNumber"
                inputMode="numeric"
                autoComplete="off"
                placeholder="4242 4242 4242 4242"
                defaultValue="4242 4242 4242 4242"
                className="pr-24"
              />
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1 text-[10px] font-bold">
                <span className="rounded bg-[#1a1f71] px-1.5 py-0.5 text-white">VISA</span>
                <span className="rounded bg-[#eb001b] px-1.5 py-0.5 text-white">MC</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="expiry" className="text-sm font-medium text-foreground">
                Expiry date <span className="text-destructive">*</span>
              </label>
              <Input id="expiry" placeholder="MM / YY" autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="cvv"
                className="flex items-center gap-1 text-sm font-medium text-foreground"
              >
                CVV <span className="text-destructive">*</span>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
              </label>
              <Input id="cvv" inputMode="numeric" placeholder="123" autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cardName" className="text-sm font-medium text-foreground">
                Name on card <span className="text-destructive">*</span>
              </label>
              <Input id="cardName" placeholder="ALI KHAN" autoComplete="off" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
