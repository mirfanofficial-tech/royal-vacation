"use client";

import { useState } from "react";
import { BadgeCheck, Languages, Save } from "lucide-react";

import { useSiteSettings } from "@/lib/site-settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function LanguageSettingsPage() {
  const { settings, update, toggleLanguage } = useSiteSettings();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  const defaultLanguageLabel =
    settings.languages.find((l) => l.code === settings.defaultLanguage)
      ?.label ?? "English";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Language</h1>
          <p className="text-sm text-muted-foreground">
            Manage the languages available to guests.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save data-icon="inline-start" />
          Save changes
          {saved && <BadgeCheck className="ml-1 size-4 text-gold" />}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" />
            Language settings
          </CardTitle>
          <CardDescription>
            Default language and which languages guests can use.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-w-md space-y-5">
          <div>
            <label className={fieldLabel} htmlFor="settings-language">
              Default language
            </label>
            <select
              id="settings-language"
              value={settings.defaultLanguage}
              onChange={(e) => update({ defaultLanguage: e.target.value })}
              className={selectClass}
            >
              {settings.languages
                .filter((language) => language.enabled)
                .map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Currently: {defaultLanguageLabel}.
            </p>
          </div>

          <div>
            <span className={fieldLabel}>Supported languages</span>
            <div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
              {settings.languages.map((language) => {
                const isDefault = language.code === settings.defaultLanguage;
                return (
                  <div
                    key={language.code}
                    className="flex items-center justify-between gap-3 bg-muted/30 px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">
                      {language.label}
                      {isDefault && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          default
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={language.enabled}
                      aria-label={`Toggle ${language.label}`}
                      disabled={isDefault}
                      onClick={() => toggleLanguage(language.code)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
                        language.enabled ? "bg-navy" : "bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
                          language.enabled
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The default language can&apos;t be disabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
