"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import type {
  GeniusBenefitInput,
  GeniusLevelOut,
  GeniusLevelUpdate,
} from "@royal-vacation/api-client";
import { ApiError } from "@/lib/api";
import { useGeniusLevels } from "@/lib/genius";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Lucide icon names the public /genius page knows how to render for a benefit. */
const BENEFIT_ICONS = [
  "Check",
  "BedDouble",
  "Tag",
  "TrendingUp",
  "Coffee",
  "Headset",
  "ArrowUpCircle",
  "Clock",
  "CalendarCheck",
  "Wallet2",
  "Car",
  "Sparkles",
  "Percent",
  "ShieldCheck",
  "Gift",
];

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputBox =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

type BenefitRow = GeniusBenefitInput & { _key: string };

type Draft = {
  tier: number;
  name: string;
  stays_required: number;
  discount_percent: number;
  description: string;
  is_active: boolean;
  benefits: BenefitRow[];
};

function toDraft(level: GeniusLevelOut): Draft {
  return {
    tier: level.tier,
    name: level.name,
    stays_required: level.stays_required,
    discount_percent: Number(level.discount_percent),
    description: level.description ?? "",
    is_active: level.is_active,
    benefits: level.benefits.map((b) => ({
      _key: b.id,
      id: b.id,
      label: b.label,
      description: b.description ?? "",
      icon: b.icon ?? "Check",
      is_active: b.is_active,
    })),
  };
}

function draftToPayload(d: Draft): GeniusLevelUpdate {
  return {
    tier: d.tier,
    name: d.name.trim(),
    stays_required: d.stays_required,
    discount_percent: d.discount_percent,
    description: d.description.trim() || null,
    is_active: d.is_active,
    benefits: d.benefits
      .filter((b) => b.label.trim().length > 0)
      .map((b, i) => ({
        id: b.id,
        label: b.label.trim(),
        description: (b.description ?? "").toString().trim() || null,
        icon: b.icon || null,
        sort_order: i,
        is_active: b.is_active ?? true,
      })),
  };
}

let keySeq = 0;
const newKey = () => `new-${Date.now()}-${keySeq++}`;

function BenefitEditor({
  rows,
  onChange,
  disabled,
}: {
  rows: BenefitRow[];
  onChange: (next: BenefitRow[]) => void;
  disabled: boolean;
}) {
  function patch(key: string, patchObj: Partial<BenefitRow>) {
    onChange(rows.map((r) => (r._key === key ? { ...r, ...patchObj } : r)));
  }
  return (
    <div className="space-y-2">
      {rows.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
          No benefits yet. Add the perks members get at this level.
        </p>
      )}
      {rows.map((row) => (
        <div
          key={row._key}
          className="flex flex-wrap items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5"
        >
          <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground/50" />
          <div className="flex min-w-[180px] flex-1 flex-col gap-2">
            <Input
              value={row.label}
              onChange={(e) => patch(row._key, { label: e.target.value })}
              placeholder="Benefit, e.g. 10% off selected stays"
              disabled={disabled}
              className="h-9"
            />
            <Input
              value={row.description ?? ""}
              onChange={(e) => patch(row._key, { description: e.target.value })}
              placeholder="Short description (optional)"
              disabled={disabled}
              className="h-9"
            />
          </div>
          <select
            value={row.icon ?? "Check"}
            onChange={(e) => patch(row._key, { icon: e.target.value })}
            disabled={disabled}
            className={cn(inputBox, "w-36")}
            aria-label="Benefit icon"
          >
            {BENEFIT_ICONS.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <label className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={row.is_active ?? true}
              onChange={(e) => patch(row._key, { is_active: e.target.checked })}
              disabled={disabled}
              className="size-4 rounded border-input"
            />
            Active
          </label>
          <button
            type="button"
            onClick={() => onChange(rows.filter((r) => r._key !== row._key))}
            disabled={disabled}
            aria-label="Remove benefit"
            className="mt-1 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() =>
          onChange([
            ...rows,
            { _key: newKey(), label: "", description: "", icon: "Check", is_active: true },
          ])
        }
      >
        <Plus data-icon="inline-start" />
        Add benefit
      </Button>
    </div>
  );
}

function LevelFields({
  draft,
  setDraft,
  disabled,
}: {
  draft: Draft;
  setDraft: (next: Draft) => void;
  disabled: boolean;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className={fieldLabel}>Tier</label>
          <Input
            type="number"
            min={1}
            value={draft.tier}
            onChange={(e) => setDraft({ ...draft, tier: Number(e.target.value) })}
            disabled={disabled}
            className="h-9"
          />
        </div>
        <div>
          <label className={fieldLabel}>Qualifying stays</label>
          <Input
            type="number"
            min={0}
            value={draft.stays_required}
            onChange={(e) => setDraft({ ...draft, stays_required: Number(e.target.value) })}
            disabled={disabled}
            className="h-9"
          />
        </div>
        <div>
          <label className={fieldLabel}>Discount %</label>
          <Input
            type="number"
            min={0}
            max={100}
            step="0.5"
            value={draft.discount_percent}
            onChange={(e) => setDraft({ ...draft, discount_percent: Number(e.target.value) })}
            disabled={disabled}
            className="h-9"
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={draft.is_active}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              disabled={disabled}
              className="size-4 rounded border-input"
            />
            Active
          </label>
        </div>
      </div>
      <div>
        <label className={fieldLabel}>Level name</label>
        <Input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Level 1"
          disabled={disabled}
          className="h-9"
        />
      </div>
      <div>
        <label className={fieldLabel}>Description</label>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          rows={2}
          disabled={disabled}
          placeholder="Shown on the public Genius page."
          className={cn(inputBox, "h-auto py-2")}
        />
      </div>
      <div>
        <label className={fieldLabel}>Benefits</label>
        <BenefitEditor
          rows={draft.benefits}
          onChange={(benefits) => setDraft({ ...draft, benefits })}
          disabled={disabled}
        />
      </div>
    </>
  );
}

function LevelCard({
  level,
  onSave,
  onDelete,
  busy,
  canEdit,
  canDelete,
}: {
  level: GeniusLevelOut;
  onSave: (id: string, body: GeniusLevelUpdate) => Promise<void>;
  onDelete: (level: GeniusLevelOut) => Promise<void>;
  busy: boolean;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(level));
  const [savedFlash, setSavedFlash] = useState(false);

  const pristine = useMemo(() => JSON.stringify(draft) === JSON.stringify(toDraft(level)), [draft, level]);
  const disabled = busy || !canEdit;

  async function handleSave() {
    await onSave(level.id, draftToPayload(draft));
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2500);
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-sm font-bold text-navy">
              {level.tier}
            </span>
            <span className="min-w-0">
              <CardTitle className="truncate">{level.name}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {Number(level.discount_percent)}% off · {level.stays_required} stays ·{" "}
                {level.benefits.length} benefit{level.benefits.length === 1 ? "" : "s"}
              </span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "rounded-full",
                level.is_active ? "bg-rating/10 text-rating" : "bg-muted text-muted-foreground",
              )}
            >
              {level.is_active ? "Active" : "Inactive"}
            </Badge>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Collapse" : "Expand"}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </button>
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-4 pt-4">
          <LevelFields draft={draft} setDraft={setDraft} disabled={disabled} />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
            {canDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => onDelete(level)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 data-icon="inline-start" />
                Delete level
              </Button>
            ) : (
              <span />
            )}
            {canEdit && (
              <div className="flex items-center gap-2">
                {!pristine && !busy && (
                  <span className="text-xs text-muted-foreground">Unsaved changes</span>
                )}
                <Button type="button" size="sm" onClick={handleSave} disabled={disabled || pristine}>
                  {busy ? (
                    <Loader2 data-icon="inline-start" className="animate-spin" />
                  ) : (
                    <Save data-icon="inline-start" />
                  )}
                  Save changes
                  {savedFlash && <BadgeCheck className="ml-1 size-4 text-gold" />}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function GeniusConfig() {
  const { levels, isLoading, createLevel, updateLevel, deleteLevel, isMutating } =
    useGeniusLevels();
  const { can } = usePermissions();
  const canEdit = can("settings", "edit");
  const canCreate = can("settings", "create");
  const canDelete = can("settings", "delete");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newLevel, setNewLevel] = useState<Draft | null>(null);

  function flash(msg: string) {
    setNotice(msg);
    setError("");
    window.setTimeout(() => setNotice(""), 5000);
  }
  function flashError(msg: string) {
    setError(msg);
    setNotice("");
  }

  const benefitCount = levels.reduce((n, l) => n + l.benefits.length, 0);
  const activeCount = levels.filter((l) => l.is_active).length;

  function startCreate() {
    const nextTier = levels.length ? Math.max(...levels.map((l) => l.tier)) + 1 : 1;
    setNewLevel({
      tier: nextTier,
      name: `Level ${nextTier}`,
      stays_required: 0,
      discount_percent: 0,
      description: "",
      is_active: true,
      benefits: [],
    });
    setCreating(true);
  }

  async function handleSave(id: string, body: GeniusLevelUpdate) {
    try {
      await updateLevel(id, body);
      flash("Level saved.");
    } catch (err) {
      flashError(errorMessage(err, "Couldn't save this level."));
      throw err;
    }
  }

  async function handleDelete(level: GeniusLevelOut) {
    if (!window.confirm(`Delete "${level.name}"? This removes its benefits too.`)) return;
    try {
      await deleteLevel(level.id);
      flash(`${level.name} deleted.`);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't delete this level."));
    }
  }

  async function handleCreate() {
    if (!newLevel) return;
    try {
      const { benefits, ...rest } = draftToPayload(newLevel);
      await createLevel({
        tier: rest.tier!,
        name: rest.name!,
        stays_required: rest.stays_required,
        discount_percent: rest.discount_percent,
        description: rest.description,
        is_active: rest.is_active,
        benefits,
      });
      flash("Level created.");
      setCreating(false);
      setNewLevel(null);
    } catch (err) {
      flashError(errorMessage(err, "Couldn't create this level."));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-navy">
            <Sparkles className="size-5 text-gold" />
            Genius Loyalty
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure loyalty tiers, the stays needed to reach each, the member discount and the
            benefits shown on the public Genius page.
          </p>
        </div>
        {canCreate && !creating && (
          <Button onClick={startCreate}>
            <Plus data-icon="inline-start" />
            Add level
          </Button>
        )}
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <BadgeCheck className="size-4 shrink-0" />
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Levels", value: levels.length },
          { label: "Active", value: activeCount },
          { label: "Benefits configured", value: benefitCount },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
              <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Sparkles className="size-4" />
              </span>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold tracking-tight">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {creating && newLevel && (
            <Card className="border-navy/40">
              <CardHeader className="border-b">
                <CardTitle>New level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <LevelFields draft={newLevel} setDraft={setNewLevel} disabled={isMutating} />
                <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCreating(false);
                      setNewLevel(null);
                    }}
                    disabled={isMutating}
                  >
                    Cancel
                  </Button>
                  <Button type="button" size="sm" onClick={handleCreate} disabled={isMutating}>
                    {isMutating ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <Plus data-icon="inline-start" />
                    )}
                    Create level
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {levels.map((level) => (
            <LevelCard
              key={level.id}
              level={level}
              onSave={handleSave}
              onDelete={handleDelete}
              busy={isMutating}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}

          {levels.length === 0 && !creating && (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No Genius levels configured yet.
                {canCreate && " Use “Add level” to create the first tier."}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}

export default function GeniusSettingsPage() {
  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <GeniusConfig />
      </div>
    </PermissionGuard>
  );
}
