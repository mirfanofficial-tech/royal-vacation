"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Languages,
  Loader2,
  Save,
  SlidersHorizontal,
} from "lucide-react";

import type { LanguageOut, StaySettingOut, StaySettingUpdate } from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useLanguages } from "@/lib/reference";
import { staySettingTypes, useStaySettings } from "@/lib/stays";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const selectClass =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

function typeLabel(value: string) {
  return staySettingTypes.find((t) => t.value === value)?.label ?? value;
}

export default function StaySettingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { settings, isLoading, error, updateSetting } = useStaySettings();
  const { languages } = useLanguages();
  const setting = settings.find((s) => s.id === id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-destructive">
            {errorMessage(error, "Failed to load setting.")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!setting) {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
            Setting not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <StaySettingDetailView
      key={setting.id}
      setting={setting}
      languages={languages}
      updateSetting={updateSetting}
    />
  );
}

function StaySettingDetailView({
  setting,
  languages,
  updateSetting,
}: {
  setting: StaySettingOut;
  languages: LanguageOut[];
  updateSetting: (id: string, body: StaySettingUpdate) => Promise<StaySettingOut>;
}) {
  const [name, setName] = useState(setting.name);
  const [isActive, setIsActive] = useState(setting.is_active);
  const [translations, setTranslations] = useState<Record<string, string>>(setting.translations);

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const activeLanguages = languages.filter((l) => l.is_active && l.code !== "en");

  async function handleSave() {
    setSaveError("");
    setSaving(true);
    try {
      await updateSetting(setting.id, {
        name: name.trim(),
        is_active: isActive,
        translations,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save setting."));
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
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-navy">{setting.name}</h1>
              <Badge variant="secondary">{typeLabel(setting.setting_type)}</Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Save data-icon="inline-start" />
            )}
            Update Setting
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

      <Card>
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive settings are hidden from stay/room configuration pickers.
            </p>
          </div>
          <select
            value={isActive ? "active" : "inactive"}
            onChange={(e) => setIsActive(e.target.value === "active")}
            className="h-8 w-32 shrink-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </CardContent>
      </Card>

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
            <select id="setting-type" value={setting.setting_type} disabled className={selectClass}>
              <option value={setting.setting_type}>{typeLabel(setting.setting_type)}</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              Setting type can&apos;t be changed after creation.
            </p>
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
