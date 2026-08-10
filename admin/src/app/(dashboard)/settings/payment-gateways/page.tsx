"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Plus,
  Power,
  Star,
  Wrench,
} from "lucide-react";

import { usePaymentGateways } from "@/lib/payment-gateways";
import type {
  GatewayCallbacks,
  GatewayCredentials,
  PaymentGateway,
  PaymentGatewayStatus,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const statusVariant: Record<
  PaymentGatewayStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  test: "secondary",
  inactive: "outline",
};

const statusBadgeLabel: Record<PaymentGatewayStatus, string> = {
  active: "Active",
  test: "Test mode",
  inactive: "Inactive",
};

const currencyOptions = [
  "AED",
  "USD",
  "EUR",
  "GBP",
  "SAR",
  "KWD",
  "QAR",
  "OMR",
  "BHD",
  "EGP",
];

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputWithEyeClass =
  "h-8 w-full rounded-lg border border-input bg-transparent pr-9 pl-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function SecretInput({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={revealed ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className={inputWithEyeClass}
        />
        <button
          type="button"
          aria-label={revealed ? "Hide value" : "Show value"}
          onClick={() => setRevealed((v) => !v)}
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

function GatewayCard({
  gateway,
  setStatus,
  setDefault,
  updateGateway,
}: {
  gateway: PaymentGateway;
  setStatus: (id: string, status: PaymentGatewayStatus) => void;
  setDefault: (id: string) => void;
  updateGateway: (id: string, patch: Partial<PaymentGateway>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const [credentials, setCredentials] = useState<GatewayCredentials>(
    gateway.credentials
  );
  const [callbacks, setCallbacks] = useState<GatewayCallbacks>(
    gateway.callbacks
  );

  const dirty =
    JSON.stringify(credentials) !== JSON.stringify(gateway.credentials) ||
    JSON.stringify(callbacks) !== JSON.stringify(gateway.callbacks);

  function handleSaveCredentials() {
    updateGateway(gateway.id, { credentials, callbacks });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(callbacks.webhookUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  const mode = gateway.status === "test" ? "test mode" : "live mode";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
            <CreditCard className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{gateway.name}</p>
              <Badge variant={statusVariant[gateway.status]}>
                {statusBadgeLabel[gateway.status]}
              </Badge>
              {gateway.isDefault && (
                <Badge variant="outline" className="text-gold">
                  <Star data-icon="inline-start" className="size-3" />
                  Default
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {gateway.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {gateway.currencies.map((currency) => (
            <span
              key={currency}
              className="rounded-md border border-border bg-muted/40 px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {currency}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="inline-flex items-center gap-2">
            <KeyRound className="size-4 text-muted-foreground" />
            API keys & callbacks
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                  <KeyRound className="size-4 text-muted-foreground" />
                  API keys
                </h3>
                <span className="text-xs text-muted-foreground">
                  {mode === "test mode"
                    ? "Testing — keys are for test transactions."
                    : "Production — keys are for real payments."}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className={fieldLabel}
                    htmlFor={`${gateway.id}-public-key`}
                  >
                    Public key
                  </label>
                  <Input
                    id={`${gateway.id}-public-key`}
                    value={credentials.publicKey}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        publicKey: e.target.value,
                      })
                    }
                    className="font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <SecretInput
                  id={`${gateway.id}-secret-key`}
                  label="Secret key"
                  value={credentials.secretKey}
                  onChange={(value) =>
                    setCredentials({ ...credentials, secretKey: value })
                  }
                />
                <div>
                  <label
                    className={fieldLabel}
                    htmlFor={`${gateway.id}-merchant-id`}
                  >
                    Merchant ID
                  </label>
                  <Input
                    id={`${gateway.id}-merchant-id`}
                    value={credentials.merchantId}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        merchantId: e.target.value,
                      })
                    }
                    className="font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
                <SecretInput
                  id={`${gateway.id}-webhook-secret`}
                  label="Webhook secret"
                  value={credentials.webhookSecret}
                  onChange={(value) =>
                    setCredentials({ ...credentials, webhookSecret: value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Secret keys are stored encrypted and only shown to admins with
                payment permissions.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <Link2 className="size-4 text-muted-foreground" />
                Callback URLs
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label
                    className={fieldLabel}
                    htmlFor={`${gateway.id}-success-url`}
                  >
                    Success URL
                  </label>
                  <Input
                    id={`${gateway.id}-success-url`}
                    value={callbacks.successUrl}
                    onChange={(e) =>
                      setCallbacks({
                        ...callbacks,
                        successUrl: e.target.value,
                      })
                    }
                    className="font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label
                    className={fieldLabel}
                    htmlFor={`${gateway.id}-cancel-url`}
                  >
                    Cancel URL
                  </label>
                  <Input
                    id={`${gateway.id}-cancel-url`}
                    value={callbacks.cancelUrl}
                    onChange={(e) =>
                      setCallbacks({
                        ...callbacks,
                        cancelUrl: e.target.value,
                      })
                    }
                    className="font-mono text-xs"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <label
                    className={fieldLabel}
                    htmlFor={`${gateway.id}-webhook-url`}
                  >
                    Webhook URL
                  </label>
                  <div className="relative">
                    <Input
                      id={`${gateway.id}-webhook-url`}
                      value={callbacks.webhookUrl}
                      onChange={(e) =>
                        setCallbacks({
                          ...callbacks,
                          webhookUrl: e.target.value,
                        })
                      }
                      className="pr-9 font-mono text-xs"
                      spellCheck={false}
                    />
                    <button
                      type="button"
                      aria-label="Copy webhook URL"
                      onClick={copyWebhook}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {copied ? (
                        <Check className="size-4 text-emerald-600" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tell {gateway.name} where to redirect guests after payment and
                where to deliver webhook events.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <BadgeCheck className="size-4" />
                  Saved
                </span>
              )}
              <Button
                size="sm"
                onClick={handleSaveCredentials}
                disabled={!dirty}
              >
                Save credentials
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              value={gateway.status}
              onChange={(e) =>
                setStatus(gateway.id, e.target.value as PaymentGatewayStatus)
              }
              className={selectClass}
              aria-label={`${gateway.name} status`}
            >
              <option value="active">Active</option>
              <option value="test">Test mode</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {gateway.isDefault ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="size-4 text-gold" />
              Used for bookings
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDefault(gateway.id)}
            >
              <Power data-icon="inline-start" />
              Make default
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PaymentGatewaysSettingsPage() {
  const { gateways, addGateway, updateGateway, setStatus, setDefault } =
    usePaymentGateways();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gatewayStatus, setGatewayStatus] =
    useState<PaymentGatewayStatus>("test");
  const [currencies, setCurrencies] = useState<string[]>(["AED"]);
  const [makeDefault, setMakeDefault] = useState(false);

  function openCreate() {
    setName("");
    setDescription("");
    setGatewayStatus("test");
    setCurrencies(["AED"]);
    setMakeDefault(false);
    setSheetOpen(true);
  }

  function toggleCurrency(currency: string) {
    setCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  }

  function handleSave() {
    const trimmedName = name.trim();
    if (!trimmedName || currencies.length === 0) return;
    addGateway({
      id: `gateway_${Date.now().toString(36)}`,
      name: trimmedName,
      description: description.trim() || "Custom payment gateway.",
      status: makeDefault ? "active" : gatewayStatus,
      isDefault: makeDefault,
      currencies,
      credentials: {
        publicKey: "",
        secretKey: "",
        merchantId: "",
        webhookSecret: "",
      },
      callbacks: {
        successUrl: "",
        cancelUrl: "",
        webhookUrl: "",
      },
    });
    setSheetOpen(false);
  }

  const defaultGateway = gateways.find((g) => g.isDefault);
  const activeCount = gateways.filter((g) => g.status === "active").length;
  const testCount = gateways.filter((g) => g.status === "test").length;

  const stats = [
    { label: "Total gateways", value: gateways.length, icon: CreditCard },
    { label: "Active", value: activeCount, icon: CheckCircle2 },
    { label: "In test mode", value: testCount, icon: Wrench },
    {
      label: "Default",
      value: defaultGateway?.name ?? "—",
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Payment Gateways</h1>
          <p className="text-sm text-muted-foreground">
            Manage payment providers, their API keys and callback URLs.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          Add gateway
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="truncate text-2xl font-semibold">
                {typeof value === "string" && value !== "—"
                  ? value
                  : String(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {gateways.map((gateway) => (
          <GatewayCard
            key={gateway.id}
            gateway={gateway}
            setStatus={setStatus}
            setDefault={setDefault}
            updateGateway={updateGateway}
          />
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add gateway</SheetTitle>
            <SheetDescription>
              Register a new payment provider for bookings. You can add API
              keys and callbacks after saving.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 px-4">
            <div>
              <label className={fieldLabel} htmlFor="gateway-name">
                Name
              </label>
              <Input
                id="gateway-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Adyen"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="gateway-description">
                Description
              </label>
              <Input
                id="gateway-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Payments platform with broad global coverage."
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="gateway-status">
                Status
              </label>
              <select
                id="gateway-status"
                value={gatewayStatus}
                onChange={(e) =>
                  setGatewayStatus(e.target.value as PaymentGatewayStatus)
                }
                className={selectClass}
              >
                <option value="test">Test mode</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <span className={fieldLabel}>Supported currencies</span>
              <div className="flex flex-wrap gap-1.5">
                {currencyOptions.map((currency) => {
                  const selected = currencies.includes(currency);
                  return (
                    <button
                      key={currency}
                      type="button"
                      onClick={() => toggleCurrency(currency)}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        selected
                          ? "border-navy bg-navy text-white"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {currency}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {currencies.length === 0
                  ? "Select at least one currency."
                  : `${currencies.length} selected.`}
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={makeDefault}
                onChange={(e) => setMakeDefault(e.target.checked)}
                className="size-4 accent-navy"
              />
              Set as default gateway for bookings
            </label>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim() || currencies.length === 0}
            >
              Add gateway
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
