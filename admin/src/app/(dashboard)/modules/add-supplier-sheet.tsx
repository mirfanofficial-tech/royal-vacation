"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import type { ThirdPartyModuleCreate } from "@royal-vacation/api-client";
import { useModules } from "@/lib/modules";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const fieldInput =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type CredentialRow = { key: string; label: string; secret: boolean; required: boolean };

const EMPTY_ROW: CredentialRow = { key: "", label: "", secret: true, required: true };

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function AddSupplierSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { createModule, isCreating } = useModules();

  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [providerTouched, setProviderTouched] = useState(false);
  const [category, setCategory] = useState("Hotels Module");
  const [environment, setEnvironment] = useState<"development" | "staging" | "production">(
    "development"
  );
  const [helpText, setHelpText] = useState("");
  const [credentialRows, setCredentialRows] = useState<CredentialRow[]>([{ ...EMPTY_ROW }]);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setProvider("");
    setProviderTouched(false);
    setCategory("Hotels Module");
    setEnvironment("development");
    setHelpText("");
    setCredentialRows([{ ...EMPTY_ROW }]);
    setError(null);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!providerTouched) setProvider(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const slug = slugify(provider);
    if (!slug || !name.trim() || !category.trim()) {
      setError("Name, provider slug, and category are required.");
      return;
    }

    const credential_schema = credentialRows
      .filter((row) => row.key.trim() && row.label.trim())
      .map((row) => ({
        key: row.key.trim(),
        label: row.label.trim(),
        secret: row.secret,
        required: row.required,
      }));

    const body: ThirdPartyModuleCreate = {
      provider: slug,
      module_id: slug,
      name: name.trim(),
      category: category.trim(),
      status: "inactive",
      environment,
      credential_schema,
      help_text: helpText.trim() || undefined,
    };

    try {
      const created = await createModule(body);
      reset();
      onOpenChange(false);
      router.push(`/modules/${created.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create the supplier. Try again."
      );
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <SheetContent className="overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          <SheetHeader>
            <SheetTitle>Add supplier</SheetTitle>
            <SheetDescription>
              Creates an inactive provider row — configure its API connection and credentials
              from the detail page afterward, then flip it active once test-connection succeeds.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 space-y-4 px-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className={fieldLabel} htmlFor="supplier-name">
                Name
              </label>
              <Input
                id="supplier-name"
                placeholder="RateHawk"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={fieldLabel} htmlFor="supplier-provider">
                Provider slug
              </label>
              <Input
                id="supplier-provider"
                placeholder="ratehawk"
                value={provider}
                onChange={(e) => {
                  setProviderTouched(true);
                  setProvider(e.target.value);
                }}
                onBlur={() => setProvider((v) => slugify(v))}
                className="font-mono text-xs"
                required
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Unique, lowercase — used as the internal identifier and admin-panel route.
              </p>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="supplier-category">
                Category
              </label>
              <Input
                id="supplier-category"
                placeholder="Hotels Module"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div>
              <label className={fieldLabel} htmlFor="supplier-environment">
                Environment
              </label>
              <select
                id="supplier-environment"
                value={environment}
                onChange={(e) =>
                  setEnvironment(e.target.value as "development" | "staging" | "production")
                }
                className={fieldInput}
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className={fieldLabel} htmlFor="supplier-help">
                Help text
              </label>
              <textarea
                id="supplier-help"
                rows={3}
                placeholder="What this provider is for, auth notes, docs link…"
                value={helpText}
                onChange={(e) => setHelpText(e.target.value)}
                className={`${fieldInput} h-auto resize-none py-2`}
              />
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <div>
                <p className="text-sm font-medium">Credential fields</p>
                <p className="text-xs text-muted-foreground">
                  What this provider needs to authenticate — filled in with real values from the
                  detail page later.
                </p>
              </div>
              {credentialRows.map((row, index) => (
                <div key={index} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      aria-label="Credential key"
                      placeholder="key_id"
                      value={row.key}
                      onChange={(e) =>
                        setCredentialRows((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, key: e.target.value } : r))
                        )
                      }
                      className="font-mono text-xs"
                    />
                    <Input
                      aria-label="Credential label"
                      placeholder="Key ID"
                      value={row.label}
                      onChange={(e) =>
                        setCredentialRows((prev) =>
                          prev.map((r, i) => (i === index ? { ...r, label: e.target.value } : r))
                        )
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove field"
                      onClick={() =>
                        setCredentialRows((prev) => prev.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <label className="flex items-center gap-1.5">
                      <Checkbox
                        checked={row.secret}
                        onCheckedChange={(checked) =>
                          setCredentialRows((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, secret: checked === true } : r
                            )
                          )
                        }
                      />
                      Secret
                    </label>
                    <label className="flex items-center gap-1.5">
                      <Checkbox
                        checked={row.required}
                        onCheckedChange={(checked) =>
                          setCredentialRows((prev) =>
                            prev.map((r, i) =>
                              i === index ? { ...r, required: checked === true } : r
                            )
                          )
                        }
                      />
                      Required
                    </label>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCredentialRows((prev) => [...prev, { ...EMPTY_ROW }])}
              >
                <Plus data-icon="inline-start" />
                Add field
              </Button>
            </div>
          </div>

          <SheetFooter>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating…" : "Create supplier"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
