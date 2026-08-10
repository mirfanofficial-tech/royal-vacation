"use client";

import { useMemo, useState } from "react";
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
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  Star,
  Trash2,
  Wrench,
} from "lucide-react";

import type {
  PaymentGatewayOut,
  PaymentGatewayStatus,
  PaymentGatewayUpdate,
} from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { usePaymentGateways } from "@/lib/payment-gateways";
import { useCurrencies } from "@/lib/reference";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const statusBadge: Record<PaymentGatewayStatus, string> = {
  active: "bg-rating/10 text-rating",
  test: "bg-amber-600/10 text-amber-600",
  inactive: "bg-muted text-muted-foreground",
};

const statusBadgeLabel: Record<PaymentGatewayStatus, string> = {
  active: "Active",
  test: "Test mode",
  inactive: "Inactive",
};

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputWithEyeClass =
  "h-8 w-full rounded-lg border border-input bg-transparent pr-9 pl-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

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
  onUpdate,
  onDelete,
  onSetDefault,
  isMutating,
  canEdit,
  canDelete,
}: {
  gateway: PaymentGatewayOut;
  onUpdate: (id: string, body: PaymentGatewayUpdate) => Promise<unknown>;
  onDelete: (gateway: PaymentGatewayOut) => void;
  onSetDefault: (gateway: PaymentGatewayOut) => void;
  isMutating: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [publicKey, setPublicKey] = useState(gateway.credentials.public_key ?? "");
  const [merchantId, setMerchantId] = useState(gateway.credentials.merchant_id ?? "");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [successUrl, setSuccessUrl] = useState(gateway.success_url ?? "");
  const [cancelUrl, setCancelUrl] = useState(gateway.cancel_url ?? "");
  const [webhookUrl, setWebhookUrl] = useState(gateway.webhook_url ?? "");

  const dirty =
    publicKey !== (gateway.credentials.public_key ?? "") ||
    merchantId !== (gateway.credentials.merchant_id ?? "") ||
    secretKey !== "" ||
    webhookSecret !== "" ||
    successUrl !== (gateway.success_url ?? "") ||
    cancelUrl !== (gateway.cancel_url ?? "") ||
    webhookUrl !== (gateway.webhook_url ?? "");

  async function handleSaveCredentials() {
    try {
      await onUpdate(gateway.id, {
        credentials: {
          public_key: publicKey,
          merchant_id: merchantId,
          ...(secretKey ? { secret_key: secretKey } : {}),
          ...(webhookSecret ? { webhook_secret: webhookSecret } : {}),
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
        webhook_url: webhookUrl,
      });
      setSecretKey("");
      setWebhookSecret("");
      setSaved(true);
      setError("");
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save credentials."));
    }
  }

  async function handleStatusChange(status: PaymentGatewayStatus) {
    try {
      await onUpdate(gateway.id, { status });
      setError("");
    } catch (err) {
      setError(errorMessage(err, "Couldn't update status."));
    }
  }

  async function copyWebhook() {
    try {
      await navigator.clipboard.writeText(webhookUrl);
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
              <Badge className={cn("rounded-full", statusBadge[gateway.status])}>
                {statusBadgeLabel[gateway.status]}
              </Badge>
              {gateway.is_default && (
                <Badge variant="outline" className="text-gold">
                  <Star data-icon="inline-start" className="size-3" />
                  Default
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{gateway.description}</p>
          </div>
          {canDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`${gateway.name} actions`}
                className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" alignOffset={-8}>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(gateway)}>
                  <Trash2 />
                  Delete gateway
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
            className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
          />
        </button>

        {expanded && (
          <div className="space-y-5">
            {error && (
              <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            )}
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
                  <label className={fieldLabel} htmlFor={`${gateway.id}-public-key`}>
                    Public key
                  </label>
                  <Input
                    id={`${gateway.id}-public-key`}
                    value={publicKey}
                    onChange={(e) => setPublicKey(e.target.value)}
                    className="font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={!canEdit}
                  />
                </div>
                <SecretInput
                  id={`${gateway.id}-secret-key`}
                  label="Secret key"
                  value={secretKey}
                  placeholder={
                    gateway.credentials.secret_key_preview
                      ? `Currently: ${gateway.credentials.secret_key_preview}`
                      : "Not set"
                  }
                  onChange={setSecretKey}
                />
                <div>
                  <label className={fieldLabel} htmlFor={`${gateway.id}-merchant-id`}>
                    Merchant ID
                  </label>
                  <Input
                    id={`${gateway.id}-merchant-id`}
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    className="font-mono text-xs"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={!canEdit}
                  />
                </div>
                <SecretInput
                  id={`${gateway.id}-webhook-secret`}
                  label="Webhook secret"
                  value={webhookSecret}
                  placeholder={
                    gateway.credentials.webhook_secret_preview
                      ? `Currently: ${gateway.credentials.webhook_secret_preview}`
                      : "Not set"
                  }
                  onChange={setWebhookSecret}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Secret keys are stored encrypted and never shown in full — leave a field blank
                to keep the current value.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
                <Link2 className="size-4 text-muted-foreground" />
                Callback URLs
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={fieldLabel} htmlFor={`${gateway.id}-success-url`}>
                    Success URL
                  </label>
                  <Input
                    id={`${gateway.id}-success-url`}
                    value={successUrl}
                    onChange={(e) => setSuccessUrl(e.target.value)}
                    className="font-mono text-xs"
                    spellCheck={false}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={fieldLabel} htmlFor={`${gateway.id}-cancel-url`}>
                    Cancel URL
                  </label>
                  <Input
                    id={`${gateway.id}-cancel-url`}
                    value={cancelUrl}
                    onChange={(e) => setCancelUrl(e.target.value)}
                    className="font-mono text-xs"
                    spellCheck={false}
                    disabled={!canEdit}
                  />
                </div>
                <div>
                  <label className={fieldLabel} htmlFor={`${gateway.id}-webhook-url`}>
                    Webhook URL
                  </label>
                  <div className="relative">
                    <Input
                      id={`${gateway.id}-webhook-url`}
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="pr-9 font-mono text-xs"
                      spellCheck={false}
                      disabled={!canEdit}
                    />
                    <button
                      type="button"
                      aria-label="Copy webhook URL"
                      onClick={copyWebhook}
                      className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tell {gateway.name} where to redirect guests after payment and where to deliver
                webhook events.
              </p>
            </div>

            {canEdit && (
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                    <BadgeCheck className="size-4" />
                    Saved
                  </span>
                )}
                <Button size="sm" onClick={handleSaveCredentials} disabled={!dirty || isMutating}>
                  {isMutating && <Loader2 data-icon="inline-start" className="animate-spin" />}
                  Save credentials
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <select
              value={gateway.status}
              onChange={(e) => handleStatusChange(e.target.value as PaymentGatewayStatus)}
              className={selectClass}
              aria-label={`${gateway.name} status`}
              disabled={!canEdit || isMutating}
            >
              <option value="active">Active</option>
              <option value="test">Test mode</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          {gateway.is_default ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BadgeCheck className="size-4 text-gold" />
              Used for bookings
            </span>
          ) : (
            canEdit && (
              <Button variant="outline" size="sm" onClick={() => onSetDefault(gateway)} disabled={isMutating}>
                <Power data-icon="inline-start" />
                Make default
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentGatewaysCatalog() {
  const {
    gateways,
    isLoading,
    createGateway,
    updateGateway,
    deleteGateway,
    setDefaultGateway,
    isMutating,
  } = usePaymentGateways();
  const { currencies } = useCurrencies();
  const { can } = usePermissions();

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [codeTouched, setCodeTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [gatewayStatus, setGatewayStatus] = useState<PaymentGatewayStatus>("test");
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(["AED"]);
  const [makeDefault, setMakeDefault] = useState(false);

  const currencyOptions = useMemo(
    () => currencies.filter((c) => c.is_active).map((c) => c.code),
    [currencies]
  );

  function flash(message: string) {
    setNotice(message);
    setError("");
    window.setTimeout(() => setNotice(""), 5000);
  }

  function flashError(message: string) {
    setError(message);
    setNotice("");
  }

  function openCreate() {
    setName("");
    setCode("");
    setCodeTouched(false);
    setDescription("");
    setGatewayStatus("test");
    setSelectedCurrencies(["AED"]);
    setMakeDefault(false);
    setSheetOpen(true);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!codeTouched) setCode(slugify(value));
  }

  function toggleCurrency(currency: string) {
    setSelectedCurrencies((prev) =>
      prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency]
    );
  }

  async function handleSave() {
    const trimmedName = name.trim();
    const trimmedCode = code.trim();
    if (!trimmedName || !trimmedCode || selectedCurrencies.length === 0) return;
    try {
      await createGateway({
        code: trimmedCode,
        name: trimmedName,
        description: description.trim() || "Custom payment gateway.",
        status: makeDefault ? "active" : gatewayStatus,
        is_default: makeDefault,
        currencies: selectedCurrencies,
      });
      flash(`${trimmedName} added to your payment gateways.`);
      setSheetOpen(false);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't add this gateway."));
    }
  }

  async function handleDelete(gateway: PaymentGatewayOut) {
    if (!window.confirm(`Delete "${gateway.name}"? This cannot be undone.`)) return;
    try {
      await deleteGateway(gateway.id);
      flash(`${gateway.name} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this gateway."));
    }
  }

  async function handleSetDefault(gateway: PaymentGatewayOut) {
    try {
      await setDefaultGateway(gateway.id);
      flash(`${gateway.name} is now the default gateway.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't set this gateway as default."));
    }
  }

  const defaultGateway = gateways.find((g) => g.is_default);
  const activeCount = gateways.filter((g) => g.status === "active").length;
  const testCount = gateways.filter((g) => g.status === "test").length;

  const stats = [
    { label: "Total gateways", value: gateways.length, icon: CreditCard },
    { label: "Active", value: activeCount, icon: CheckCircle2 },
    { label: "In test mode", value: testCount, icon: Wrench },
    { label: "Default", value: defaultGateway?.name ?? "—", icon: Star },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Payment Gateways</h1>
          <p className="text-sm text-muted-foreground">
            Manage payment providers, their API keys and callback URLs.
          </p>
        </div>
        {can("settings", "create") && (
          <Button onClick={openCreate}>
            <Plus data-icon="inline-start" />
            Add gateway
          </Button>
        )}
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm break-words text-emerald-800">
          <BadgeCheck className="size-4 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="truncate text-2xl font-semibold tracking-tight">
                {typeof value === "string" && value !== "—" ? value : String(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {gateways.map((gateway) => (
            <GatewayCard
              key={gateway.id}
              gateway={gateway}
              onUpdate={updateGateway}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isMutating={isMutating}
              canEdit={can("settings", "edit")}
              canDelete={can("settings", "delete")}
            />
          ))}
          {gateways.length === 0 && (
            <Card className="lg:col-span-2">
              <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
                No payment gateways yet — add one to start accepting payments.
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add gateway</SheetTitle>
            <SheetDescription>
              Register a new payment provider for bookings. You can add API keys and callbacks
              after saving.
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
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Adyen"
              />
            </div>
            <div>
              <label className={fieldLabel} htmlFor="gateway-code">
                Code
              </label>
              <Input
                id="gateway-code"
                value={code}
                onChange={(e) => {
                  setCodeTouched(true);
                  setCode(slugify(e.target.value));
                }}
                placeholder="adyen"
                className="font-mono text-sm"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                A unique identifier — auto-filled from the name, editable.
              </p>
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
                onChange={(e) => setGatewayStatus(e.target.value as PaymentGatewayStatus)}
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
                  const selected = selectedCurrencies.includes(currency);
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
                {selectedCurrencies.length === 0
                  ? "Select at least one currency."
                  : `${selectedCurrencies.length} selected.`}
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
              disabled={!name.trim() || !code.trim() || selectedCurrencies.length === 0 || isMutating}
            >
              {isMutating && <Loader2 data-icon="inline-start" className="animate-spin" />}
              Add gateway
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function PaymentGatewaysSettingsPage() {
  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <PaymentGatewaysCatalog />
      </div>
    </PermissionGuard>
  );
}
