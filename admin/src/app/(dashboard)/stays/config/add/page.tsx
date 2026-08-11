"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, Languages, Loader2, Save, SlidersHorizontal } from "lucide-react";

import type { StaySettingType } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useLanguages } from "@/lib/reference";
import { staySettingTypes, useStaySettings } from "@/lib/stays";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function AddStaySettingPage() {
  const router = useRouter();
  const { createSetting } = useStaySettings();
  const { languages } = useLanguages();

  const [settingType, setSettingType] = useState<StaySettingType>("stay_amenity");
  const [name, setName] = useState("");
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // English is the base translation, already captured by the Name field above.
  const activeLanguages = languages.filter((l) => l.is_active && l.code !== "en");

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      const created = await createSetting({
        setting_type: settingType,
        name: name.trim(),
        translations: Object.fromEntries(
          Object.entries(translations).filter(([, v]) => v.trim() !== "")
        ),
      });
      router.push(`/stays/config/${created.id}`);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to add setting."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground"
            render={<Link href="/stays/config" />}
          >
            <ArrowLeft data-icon="inline-start" />
            Back to Stays Config
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-navy">Add Setting</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a new stay/room configuration value.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Save Setting
          </Button>
          {saveError && (
            <p className="flex items-center gap-1.5 text-xs text-destructive">
              <AlertTriangle className="size-3.5 shrink-0" />
              {saveError}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={fieldLabel} htmlFor="setting-type">
              Setting Type
            </label>
            <select
              id="setting-type"
              value={settingType}
              onChange={(e) => setSettingType(e.target.value as StaySettingType)}
              className={selectClass}
            >
              {staySettingTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel} htmlFor="setting-name">
              Name
            </label>
            <Input
              id="setting-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter setting name"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              English name (used as base translation)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Languages className="size-4 text-muted-foreground" />
            Translations
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {activeLanguages.map((lang) => (
            <div key={lang.code}>
              <label className={fieldLabel} htmlFor={`translation-${lang.code}`}>
                {lang.name} <span className="text-muted-foreground/70">({lang.code})</span>
              </label>
              <Input
                id={`translation-${lang.code}`}
                value={translations[lang.code] ?? ""}
                onChange={(e) =>
                  setTranslations((prev) => ({ ...prev, [lang.code]: e.target.value }))
                }
                placeholder="Enter translation"
              />
            </div>
          ))}
          {activeLanguages.length === 0 && (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              No active languages configured yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
