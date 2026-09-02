"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, BadgeCheck, Loader2, RotateCcw, Save } from "lucide-react";

import type { AdminCornerStyle } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import {
  applyAdminTheme,
  CORNER_RADIUS,
  type AdminThemeFields,
} from "@/lib/admin-theme";
import { PermissionGuard } from "@/components/permission-guard";
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

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

type ColorKey = Exclude<keyof AdminThemeFields, "admin_corner_style">;

const COLOR_FIELDS: {
  key: ColorKey;
  label: string;
  description: string;
  fallback: string;
}[] = [
  {
    key: "admin_sidebar_color",
    label: "Sidebar background",
    description: "The main sidebar panel colour.",
    fallback: "#14284b",
  },
  {
    key: "admin_sidebar_text_color",
    label: "Sidebar text",
    description: "Labels and icons inside the sidebar.",
    fallback: "#f4f7fb",
  },
  {
    key: "admin_primary_color",
    label: "Brand · buttons & links",
    description: "Primary buttons, headings and link colour across the panel.",
    fallback: "#14284b",
  },
  {
    key: "admin_accent_color",
    label: "Accent",
    description: "Gold highlight used for badges and small accents.",
    fallback: "#c9973c",
  },
];

const CORNER_OPTIONS: { value: AdminCornerStyle; label: string }[] = [
  { value: "sharp", label: "Sharp" },
  { value: "soft", label: "Soft" },
  { value: "round", label: "Round" },
];

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const emptyDraft: AdminThemeFields = {
  admin_sidebar_color: null,
  admin_sidebar_text_color: null,
  admin_primary_color: null,
  admin_accent_color: null,
  admin_corner_style: null,
};

export default function AdminAppearancePage() {
  const { theme, isLoading, error, updateTheme, isSaving } = useTheme();

  const [draft, setDraft] = useState<AdminThemeFields>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (theme && !hydrated) {
    setDraft({
      admin_sidebar_color: theme.admin_sidebar_color ?? null,
      admin_sidebar_text_color: theme.admin_sidebar_text_color ?? null,
      admin_primary_color: theme.admin_primary_color ?? null,
      admin_accent_color: theme.admin_accent_color ?? null,
      admin_corner_style: theme.admin_corner_style ?? null,
    });
    setHydrated(true);
  }

  // Live preview: push the working draft onto the panel; restore the saved
  // theme when leaving without saving.
  useEffect(() => {
    if (!hydrated) return;
    applyAdminTheme(document.documentElement, draft);
    return () => applyAdminTheme(document.documentElement, theme);
  }, [draft, hydrated, theme]);

  function setField<K extends keyof AdminThemeFields>(key: K, value: AdminThemeFields[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setSaved(false);
  }

  const invalidHex = COLOR_FIELDS.some(({ key }) => {
    const v = draft[key];
    return v != null && !HEX_RE.test(v);
  });

  async function handleSave() {
    setSaveError("");
    try {
      await updateTheme(draft);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save appearance."));
    }
  }

  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">Admin Appearance</h1>
            <p className="text-sm text-muted-foreground">
              Colours for the admin panel itself. The public website&apos;s look lives on{" "}
              <Link href="/settings/themes" className="font-medium text-navy underline">
                Themes
              </Link>
              .
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button onClick={handleSave} disabled={isSaving || isLoading || invalidHex}>
              {isSaving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              Save appearance
              {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
            </Button>
            {saveError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="size-3.5 shrink-0" />
                {saveError}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
            {errorMessage(error, "Failed to load theme.")}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Colours</CardTitle>
                  <CardDescription>
                    Each colour falls back to the built-in dark-blue default when cleared.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {COLOR_FIELDS.map(({ key, label, description, fallback }) => {
                    const value = draft[key];
                    const current = value ?? fallback;
                    const bad = value != null && !HEX_RE.test(value);
                    return (
                      <div key={key} className="flex flex-wrap items-center gap-3">
                        <span
                          className="size-9 shrink-0 rounded-lg border border-border"
                          style={{ background: HEX_RE.test(current) ? current : fallback }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                        <input
                          type="color"
                          aria-label={`${label} colour picker`}
                          value={HEX_RE.test(current) ? current : fallback}
                          onChange={(e) => setField(key, e.target.value)}
                          className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-input bg-transparent p-1"
                        />
                        <Input
                          value={value ?? ""}
                          placeholder={fallback}
                          onChange={(e) => setField(key, e.target.value || null)}
                          aria-label={`${label} hex value`}
                          aria-invalid={bad}
                          className="h-9 w-28 font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Reset ${label}`}
                          disabled={value == null}
                          onClick={() => setField(key, null)}
                        >
                          <RotateCcw />
                        </Button>
                      </div>
                    );
                  })}
                  {invalidHex && (
                    <p className="text-xs text-destructive">
                      Hex values must look like <code className="font-mono">#1a2b3c</code>.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Corner style</CardTitle>
                  <CardDescription>Roundness of buttons, cards and inputs.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {CORNER_OPTIONS.map(({ value, label }) => {
                      const active = (draft.admin_corner_style ?? "soft") === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setField("admin_corner_style", value)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                            active
                              ? "border-navy bg-navy/[0.06] font-medium text-navy"
                              : "border-border text-muted-foreground hover:border-navy/40"
                          )}
                          style={{ borderRadius: CORNER_RADIUS[value] }}
                        >
                          {label}
                        </button>
                      );
                    })}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={draft.admin_corner_style == null}
                      onClick={() => setField("admin_corner_style", null)}
                    >
                      <RotateCcw data-icon="inline-start" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="h-fit lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="text-base">Preview</CardTitle>
                <CardDescription>Live — the whole panel updates as you edit.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="flex">
                    <div className="w-24 shrink-0 space-y-1 bg-sidebar p-2 text-sidebar-foreground">
                      <div className="rounded-md bg-sidebar-accent px-2 py-1 text-[11px] font-semibold text-sidebar-accent-foreground">
                        Dashboard
                      </div>
                      <div className="px-2 py-1 text-[11px] text-sidebar-foreground/70">Bookings</div>
                      <div className="px-2 py-1 text-[11px] text-sidebar-foreground/70">Reports</div>
                    </div>
                    <div className="flex-1 space-y-2 bg-background p-3">
                      <p className="text-sm font-semibold text-navy">Heading</p>
                      <p className="text-xs text-muted-foreground">
                        Body text with a{" "}
                        <span className="font-medium text-primary underline">link</span>.
                      </p>
                      <div className="flex gap-2">
                        <Button size="sm">Primary</Button>
                        <Button size="sm" variant="outline">
                          Outline
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
