"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Bug,
  FlaskConical,
  Info,
  KeyRound,
  Loader2,
  Percent,
  Receipt,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import { useModules, testModuleConnection } from "@/lib/modules";
import type {
  MarkupType,
  ModuleEnvironment,
  TaxType,
  ThirdPartyModule,
} from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const statusVariant = {
  active: "default",
  inactive: "outline",
} as const;

const environmentVariant = {
  development: "outline",
  staging: "secondary",
  production: "default",
} as const;

const baseCurrencyOptions = [
  "AED - United Arab Emirates",
  "EUR - United Kingdom",
  "GBP - United Kingdom",
  "USD - United States",
  "SAR - Saudi Arabia",
  "QAR - Qatar",
  "KWD - Kuwait",
  "OMR - Oman",
];

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const inputClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const tabs = [
  { id: "general", label: "General", icon: SlidersHorizontal },
  { id: "markup-tax", label: "Markup & Tax", icon: Percent },
  { id: "credentials", label: "API Credentials", icon: KeyRound },
  { id: "testing", label: "API Testing", icon: FlaskConical },
] as const;

type TabId = (typeof tabs)[number]["id"];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked ? "bg-navy" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function ModuleConfigView({
  providerModule,
  updateModule,
}: {
  providerModule: ThirdPartyModule;
  updateModule: (id: string, patch: Partial<ThirdPartyModule>) => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const [status, setStatus] = useState<"active" | "inactive">(
    providerModule.status
  );
  const [aiEnabled, setAiEnabled] = useState(providerModule.aiEnabled);
  const [environment, setEnvironment] = useState<ModuleEnvironment>(
    providerModule.environment
  );
  const [b2bType, setB2bType] = useState<MarkupType>(
    providerModule.markupB2B.type
  );
  const [b2bValue, setB2bValue] = useState(
    String(providerModule.markupB2B.value)
  );
  const [b2cType, setB2cType] = useState<MarkupType>(
    providerModule.markupB2C.type
  );
  const [b2cValue, setB2cValue] = useState(
    String(providerModule.markupB2C.value)
  );
  const [baseCurrency, setBaseCurrency] = useState(
    providerModule.baseCurrency
  );
  const [taxType, setTaxType] = useState<TaxType>(providerModule.tax.type);
  const [taxValue, setTaxValue] = useState(String(providerModule.tax.value));
  const [credentials, setCredentials] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      providerModule.credentialFields.map((field) => [field.key, field.value])
    )
  );
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState<"idle" | "testing" | "success" | "error">(
    "idle"
  );
  const [testMessage, setTestMessage] = useState("");

  const currencyCode = baseCurrency.split(" ")[0] ?? baseCurrency;

  function buildDraft(): ThirdPartyModule {
    return {
      ...providerModule,
      status,
      aiEnabled,
      environment,
      markupB2B: { type: b2bType, value: Number(b2bValue) || 0 },
      markupB2C: { type: b2cType, value: Number(b2cValue) || 0 },
      baseCurrency,
      tax: { type: taxType, value: Number(taxValue) || 0 },
      credentialFields: providerModule.credentialFields.map((field) => ({
        ...field,
        value: credentials[field.key] ?? field.value,
      })),
    };
  }

  function handleSave() {
    const draft = buildDraft();
    updateModule(providerModule.id, {
      status,
      aiEnabled,
      environment,
      markupB2B: draft.markupB2B,
      markupB2C: draft.markupB2C,
      baseCurrency,
      tax: draft.tax,
      credentialFields: draft.credentialFields,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    setTest("testing");
    setTestMessage("");
    const result = await testModuleConnection(buildDraft());
    setTest(result.ok ? "success" : "error");
    setTestMessage(result.message);
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/modules" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Modules
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-navy">
                {providerModule.name} Configuration
              </h1>
              <Badge variant="secondary">{providerModule.category}</Badge>
              <Badge variant="outline">ID: {providerModule.moduleId}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Provider: <span className="font-mono">{providerModule.provider}</span>
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save data-icon="inline-start" />
          Save Configuration
          {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/30 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              activeTab === tab.id
                ? "bg-navy text-white shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Module Status</CardTitle>
                <CardDescription>
                  Control availability, AI assistance and the environment this
                  module runs against.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Module Status</p>
                    <p className="text-xs text-muted-foreground">
                      {status === "active"
                        ? "This module is live and available for bookings."
                        : "This module is paused and hidden from checkout."}
                    </p>
                  </div>
                  <Toggle
                    checked={status === "active"}
                    onChange={(checked) =>
                      setStatus(checked ? "active" : "inactive")
                    }
                    label="Module status"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">AI Enabled</p>
                    <p className="text-xs text-muted-foreground">
                      Let AI help guests pick{" "}
                      {providerModule.category.toLowerCase()}s.
                    </p>
                  </div>
                  <Toggle
                    checked={aiEnabled}
                    onChange={setAiEnabled}
                    label="AI enabled"
                  />
                </div>
                <div>
                  <label className={fieldLabel} htmlFor="module-environment">
                    Environment
                  </label>
                  <select
                    id="module-environment"
                    value={environment}
                    onChange={(e) =>
                      setEnvironment(e.target.value as ModuleEnvironment)
                    }
                    className={selectClass}
                  >
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Keys are used from the credential set for this environment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "markup-tax" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Percent className="size-4 text-muted-foreground" />
                    Pricing Configuration
                  </CardTitle>
                  <CardDescription>
                    Margin applied on top of the provider&apos;s prices for each
                    channel and the base currency.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel} htmlFor="module-b2b-type">
                        Markup Type B2B
                      </label>
                      <select
                        id="module-b2b-type"
                        value={b2bType}
                        onChange={(e) => setB2bType(e.target.value as MarkupType)}
                        className={selectClass}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat amount</option>
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabel} htmlFor="module-b2b-value">
                        Markup Value
                      </label>
                      <div className="relative">
                        <Input
                          id="module-b2b-value"
                          type="number"
                          min={0}
                          value={b2bValue}
                          onChange={(e) => setB2bValue(e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                          {b2bType === "percentage" ? "%" : currencyCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={fieldLabel} htmlFor="module-b2c-type">
                        Markup Type B2C
                      </label>
                      <select
                        id="module-b2c-type"
                        value={b2cType}
                        onChange={(e) => setB2cType(e.target.value as MarkupType)}
                        className={selectClass}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat amount</option>
                      </select>
                    </div>
                    <div>
                      <label className={fieldLabel} htmlFor="module-b2c-value">
                        Markup Value
                      </label>
                      <div className="relative">
                        <Input
                          id="module-b2c-value"
                          type="number"
                          min={0}
                          value={b2cValue}
                          onChange={(e) => setB2cValue(e.target.value)}
                          className="pr-8"
                        />
                        <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                          {b2cType === "percentage" ? "%" : currencyCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={fieldLabel} htmlFor="module-base-currency">
                      Base Currency
                    </label>
                    <select
                      id="module-base-currency"
                      value={baseCurrency}
                      onChange={(e) => setBaseCurrency(e.target.value)}
                      className={selectClass}
                    >
                      {baseCurrencyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-muted-foreground">
                      The provider&apos;s prices are converted from this
                      currency.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Receipt className="size-4 text-muted-foreground" />
                    Tax Configuration
                  </CardTitle>
                  <CardDescription>
                    Tax applied on top of the marked-up price at checkout.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabel} htmlFor="module-tax-type">
                      Tax Type
                    </label>
                    <select
                      id="module-tax-type"
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value as TaxType)}
                      className={selectClass}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat amount</option>
                    </select>
                  </div>
                  <div>
                    <label className={fieldLabel} htmlFor="module-tax-value">
                      Tax Value
                    </label>
                    <div className="relative">
                      <Input
                        id="module-tax-value"
                        type="number"
                        min={0}
                        value={taxValue}
                        onChange={(e) => setTaxValue(e.target.value)}
                        className="pr-8"
                      />
                      <span className="absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                        {taxType === "percentage" ? "%" : currencyCode}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "credentials" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="size-4 text-muted-foreground" />
                  API Credentials
                </CardTitle>
                <CardDescription>
                  Credentials used to authenticate with {providerModule.name}.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {providerModule.credentialFields.map((field) => (
                  <div key={field.key}>
                    <label
                      className={fieldLabel}
                      htmlFor={`${providerModule.id}-${field.key}`}
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-destructive"> *</span>
                      )}
                    </label>
                    <input
                      id={`${providerModule.id}-${field.key}`}
                      type={field.secret ? "password" : "text"}
                      value={credentials[field.key] ?? ""}
                      onChange={(e) =>
                        setCredentials((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      autoComplete="off"
                      spellCheck={false}
                      className={cn(inputClass, "font-mono text-xs")}
                    />
                    {field.secret && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Stored encrypted — never shown in plain text.
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "testing" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FlaskConical className="size-4 text-muted-foreground" />
                  API Testing
                </CardTitle>
                <CardDescription>
                  Test your API credentials to ensure connectivity.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  variant="outline"
                  onClick={handleTest}
                  disabled={test === "testing"}
                >
                  {test === "testing" ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Bug data-icon="inline-start" />
                  )}
                  Test API Connection
                </Button>
                {test === "testing" && (
                  <p className="text-sm text-muted-foreground">
                    Contacting provider… this may take a few seconds.
                  </p>
                )}
                {test !== "idle" && test !== "testing" && (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
                      test === "success"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-destructive/20 bg-destructive/10 text-destructive"
                    )}
                  >
                    {test === "success" ? (
                      <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                    ) : (
                      <Bug className="mt-0.5 size-4 shrink-0" />
                    )}
                    <span>{testMessage}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="size-4 text-muted-foreground" />
                Module Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Module ID</span>
                <span className="font-mono">{providerModule.moduleId}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium">{providerModule.category}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-mono">{providerModule.provider}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={statusVariant[status]}>
                  {status === "active" ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant={environmentVariant[environment]}>
                  {environment}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="size-4 text-muted-foreground" />
                Help & Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {providerModule.helpText}
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={
                    <a href="#" onClick={(e) => e.preventDefault()} />
                  }
                >
                  <BookOpen data-icon="inline-start" />
                  API documentation
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  render={
                    <a href="#" onClick={(e) => e.preventDefault()} />
                  }
                >
                  <Bug data-icon="inline-start" />
                  Webhook reference
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get support or a sandbox account from the{" "}
                <span className="font-medium">{providerModule.provider}</span>{" "}
                partner portal.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ModuleConfigPage() {
  const { id } = useParams<{ id: string }>();
  const { modules, updateModule } = useModules();
  const providerModule = modules.find((m) => m.id === id);

  if (!providerModule) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Module not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ModuleConfigView
      key={providerModule.id}
      providerModule={providerModule}
      updateModule={updateModule}
    />
  );
}
