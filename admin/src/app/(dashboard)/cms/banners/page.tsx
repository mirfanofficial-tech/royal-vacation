"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ImagePlus,
  Monitor,
  Pause,
  Pencil,
  Play,
  Plus,
  Smartphone,
  Trash2,
} from "lucide-react";

import {
  bannerGroupsSeed,
  slidesSeed,
  type BannerGroup,
  type Slide,
  type SlideTranslationValue,
} from "@/lib/mock-data";
import { useLanguages } from "@/lib/reference";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const fieldLabel = "mb-1.5 block text-xs font-medium text-muted-foreground";
const EMPTY_TRANSLATION: SlideTranslationValue = { eyebrow: "", headline: "", buttonLabel: "" };

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors outline-none",
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short" });
}

function slideStatus(slide: Slide, today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);
  if (!slide.isActive) {
    return {
      status: "draft" as const,
      label: slide.startDate && slide.endDate
        ? `${formatDate(slide.startDate)} — ${formatDate(slide.endDate)}`
        : "Not scheduled",
    };
  }
  if (!slide.startDate || !slide.endDate) {
    return { status: "live" as const, label: "Always on" };
  }
  if (todayStr < slide.startDate) {
    return {
      status: "scheduled" as const,
      label: `${formatDate(slide.startDate)} — ${formatDate(slide.endDate)}`,
    };
  }
  if (todayStr > slide.endDate) {
    return {
      status: "expired" as const,
      label: `Ended ${formatDate(slide.endDate)}`,
    };
  }
  return { status: "live" as const, label: `Now — ${formatDate(slide.endDate)}` };
}

const statusStyles: Record<string, string> = {
  live: "bg-rating/10 text-rating",
  scheduled: "bg-sky-100 text-sky-600",
  draft: "bg-muted text-muted-foreground",
  expired: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = {
  live: "Live",
  scheduled: "Scheduled",
  draft: "Draft",
  expired: "Expired",
};

function SlidePreview({
  slide,
  language,
  device,
}: {
  slide: Slide;
  language: string;
  device: "desktop" | "mobile";
}) {
  const t = slide.translations[language] ?? slide.translations.en ?? EMPTY_TRANSLATION;
  return (
    <div
      className={cn(
        "relative mx-auto flex flex-col justify-center overflow-hidden rounded-xl bg-navy px-8 py-10 text-white transition-all",
        device === "mobile" ? "h-64 max-w-sm px-5 py-6" : "h-64 w-full",
        slide.textPosition === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      <div className="absolute inset-0 bg-black" style={{ opacity: slide.overlayOpacity / 100 }} aria-hidden />
      <div className="relative space-y-3">
        <p className="text-xs font-semibold tracking-wide text-gold">{t.eyebrow}</p>
        <h2 className="max-w-xl text-2xl font-semibold text-white sm:text-3xl">{t.headline}</h2>
        {t.buttonLabel && (
          <span className="inline-block rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy">
            {t.buttonLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function BannersCatalog() {
  const { languages } = useLanguages();
  const activeLanguages = useMemo(() => languages.filter((l) => l.is_active), [languages]);

  const [groups] = useState<BannerGroup[]>(bannerGroupsSeed);
  const [slides, setSlides] = useState<Slide[]>(slidesSeed);
  const [selectedGroupId, setSelectedGroupId] = useState(bannerGroupsSeed[0]?.id ?? "");
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [language, setLanguage] = useState("en");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [playing, setPlaying] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [interval, setIntervalSec] = useState(6);
  const [autoplay, setAutoplay] = useState(true);
  const [pauseOnHover, setPauseOnHover] = useState(true);
  const [showDots, setShowDots] = useState(true);
  const [showArrows, setShowArrows] = useState(false);

  const groupSlides = useMemo(
    () =>
      slides.filter((s) => s.groupId === selectedGroupId).sort((a, b) => a.sortOrder - b.sortOrder),
    [slides, selectedGroupId]
  );
  const liveSlides = groupSlides.filter((s) => s.isActive);

  const selectedSlide = groupSlides.find((s) => s.id === selectedSlideId) ?? groupSlides[0] ?? null;
  const previewSlide = playing && liveSlides.length > 0
    ? liveSlides[previewIndex % liveSlides.length]
    : selectedSlide;

  useEffect(() => {
    setPreviewIndex(0);
    setPlaying(false);
  }, [selectedGroupId]);

  useEffect(() => {
    if (!playing || !autoplay) return;
    if (hovering && pauseOnHover) return;
    if (liveSlides.length === 0) return;
    const id = window.setInterval(() => {
      setPreviewIndex((i) => (i + 1) % liveSlides.length);
    }, interval * 1000);
    return () => window.clearInterval(id);
  }, [playing, autoplay, hovering, pauseOnHover, interval, liveSlides.length]);

  function selectSlide(id: string) {
    setSelectedSlideId(id);
    setPlaying(false);
    setLanguage("en");
  }

  function updateSlide(id: string, patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function updateTranslation(id: string, patch: Partial<SlideTranslationValue>) {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const current = s.translations[language] ?? EMPTY_TRANSLATION;
        return { ...s, translations: { ...s.translations, [language]: { ...current, ...patch } } };
      })
    );
  }

  function handleAddSlide() {
    const id = `slide_new_${Date.now()}`;
    const newSlide: Slide = {
      id,
      groupId: selectedGroupId,
      backgroundLabel: "untitled-slide.jpg",
      width: 1440,
      height: 620,
      sizeKb: 0,
      buttonLink: "#",
      textPosition: "left",
      overlayOpacity: 50,
      isActive: false,
      sortOrder: groupSlides.length,
      translations: { en: { eyebrow: "", headline: "New slide", buttonLabel: "" } },
    };
    setSlides((prev) => [...prev, newSlide]);
    selectSlide(id);
  }

  function handleDeleteSlide(id: string) {
    if (!window.confirm("Delete this slide?")) return;
    setSlides((prev) => prev.filter((s) => s.id !== id));
    if (selectedSlideId === id) setSelectedSlideId(null);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const ids = groupSlides.map((s) => s.id);
    const [moved] = ids.splice(dragIndex, 1);
    const adjusted = dragIndex < targetIndex ? targetIndex - 1 : targetIndex;
    ids.splice(adjusted, 0, moved);
    setSlides((prev) => {
      const others = prev.filter((s) => s.groupId !== selectedGroupId);
      const reordered = ids
        .map((id, index) => {
          const s = prev.find((x) => x.id === id);
          return s ? { ...s, sortOrder: index } : null;
        })
        .filter((s): s is Slide => Boolean(s));
      return [...others, ...reordered];
    });
    setDragIndex(null);
  }

  function handleImageChange(id: string, file: File) {
    updateSlide(id, { backgroundLabel: file.name, sizeKb: Math.round(file.size / 1024) });
  }

  const liveCount = groupSlides.filter((s) => slideStatus(s).status === "live").length;
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Banners & Sliders</h1>
          <p className="text-sm text-muted-foreground">
            {liveCount} slide{liveCount === 1 ? "" : "s"} live on {selectedGroup?.name ?? "this group"}
          </p>
        </div>
        <Button size="sm" onClick={handleAddSlide}>
          <Plus data-icon="inline-start" />
          New slide
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {groups.map((group) => {
          const count = slides.filter((s) => s.groupId === group.id).length;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setSelectedGroupId(group.id);
                setSelectedSlideId(null);
              }}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
                selectedGroupId === group.id
                  ? "border-navy text-navy"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {group.name}
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {selectedSlide ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {playing ? `Rotation preview` : `Slide preview`}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-white p-0.5">
                      <button
                        type="button"
                        aria-label="Desktop preview"
                        onClick={() => setDevice("desktop")}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md",
                          device === "desktop" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Monitor className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Mobile preview"
                        onClick={() => setDevice("mobile")}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md",
                          device === "mobile" ? "bg-navy text-white" : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Smartphone className="size-3.5" />
                      </button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={liveSlides.length === 0}
                      onClick={() => setPlaying((p) => !p)}
                    >
                      {playing ? <Pause data-icon="inline-start" /> : <Play data-icon="inline-start" />}
                      {playing ? "Stop" : "Preview rotation"}
                    </Button>
                  </div>
                </div>

                <div
                  onMouseEnter={() => setHovering(true)}
                  onMouseLeave={() => setHovering(false)}
                  className="relative"
                >
                  {previewSlide && <SlidePreview slide={previewSlide} language={language} device={device} />}
                  {showArrows && liveSlides.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous slide"
                        onClick={() =>
                          setPreviewIndex((i) => (i - 1 + liveSlides.length) % liveSlides.length)
                        }
                        className="absolute top-1/2 left-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next slide"
                        onClick={() => setPreviewIndex((i) => (i + 1) % liveSlides.length)}
                        className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy shadow"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </>
                  )}
                  {showDots && liveSlides.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {liveSlides.map((s, i) => (
                        <span
                          key={s.id}
                          className={cn(
                            "size-1.5 rounded-full",
                            (playing ? i === previewIndex % liveSlides.length : s.id === selectedSlide.id)
                              ? "bg-gold"
                              : "bg-white/40"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {selectedSlide && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>
                      {selectedSlide.width} × {selectedSlide.height} · {selectedSlide.backgroundLabel}
                      {selectedSlide.sizeKb > 0 && ` · ${selectedSlide.sizeKb} KB`}
                    </span>
                    <label className="cursor-pointer font-medium text-navy hover:text-navy/70">
                      Replace image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageChange(selectedSlide.id, file);
                        }}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2 pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">Slides in rotation</p>
                  <button type="button" onClick={handleAddSlide} className="text-xs font-medium text-navy hover:text-navy/70">
                    + Add slide
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border border-border">
                  {groupSlides.map((slide, index) => {
                    const { status, label } = slideStatus(slide);
                    const t = slide.translations.en ?? EMPTY_TRANSLATION;
                    return (
                      <div
                        key={slide.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(index)}
                        className={cn(
                          "flex items-center gap-2.5 border-b border-border bg-white px-3 py-2.5 last:border-b-0 hover:bg-muted/40",
                          selectedSlide?.id === slide.id && "bg-muted/60"
                        )}
                      >
                        <GripVertical className="size-3.5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-medium text-navy">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => selectSlide(slide.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-sm font-medium text-foreground">{t.headline}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.buttonLabel || "No button"} → {slide.buttonLink}
                          </p>
                        </button>
                        <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
                        <Badge variant="outline" className={cn("shrink-0 border-transparent", statusStyles[status])}>
                          {statusLabels[status]}
                        </Badge>
                        <Toggle
                          checked={slide.isActive}
                          onChange={(v) => updateSlide(slide.id, { isActive: v })}
                        />
                        <button
                          type="button"
                          onClick={() => selectSlide(slide.id)}
                          aria-label="Edit slide"
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(slide.id)}
                          aria-label="Delete slide"
                          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {selectedSlide && (
              <Card>
                <CardContent className="space-y-4 pt-4">
                  <p className="text-sm font-semibold text-foreground">Slide settings</p>

                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-3">
                      {["en", ...activeLanguages.filter((l) => l.code !== "en").map((l) => l.code)].map(
                        (code) => {
                          const lang = activeLanguages.find((l) => l.code === code);
                          const hasContent =
                            code === "en" ? true : Boolean(selectedSlide.translations[code]?.headline);
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => setLanguage(code)}
                              className={cn(
                                "flex items-center gap-1.5 text-xs font-medium",
                                language === code ? "text-navy" : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <span
                                className={cn("size-1.5 rounded-full", hasContent ? "bg-rating" : "bg-border")}
                              />
                              {code === "en" ? "EN" : (lang?.code ?? code).toUpperCase()}
                            </button>
                          );
                        }
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Text and button label are per language. Image and schedule are shared across all
                      languages.
                    </p>
                  </div>

                  <div>
                    <label className={fieldLabel}>Eyebrow text</label>
                    <Input
                      value={(selectedSlide.translations[language] ?? EMPTY_TRANSLATION).eyebrow}
                      onChange={(e) => updateTranslation(selectedSlide.id, { eyebrow: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Headline</label>
                    <Input
                      value={(selectedSlide.translations[language] ?? EMPTY_TRANSLATION).headline}
                      onChange={(e) => updateTranslation(selectedSlide.id, { headline: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Button label</label>
                    <Input
                      value={(selectedSlide.translations[language] ?? EMPTY_TRANSLATION).buttonLabel}
                      onChange={(e) => updateTranslation(selectedSlide.id, { buttonLabel: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Button link</label>
                    <Input
                      value={selectedSlide.buttonLink}
                      onChange={(e) => updateSlide(selectedSlide.id, { buttonLink: e.target.value })}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className={fieldLabel}>Text position</label>
                    <Select
                      value={selectedSlide.textPosition}
                      onValueChange={(v) =>
                        updateSlide(selectedSlide.id, { textPosition: (v as "left" | "center") ?? "left" })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left aligned</SelectItem>
                        <SelectItem value="center">Centered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={fieldLabel}>Start date</label>
                      <Input
                        type="date"
                        value={selectedSlide.startDate ?? ""}
                        onChange={(e) => updateSlide(selectedSlide.id, { startDate: e.target.value || undefined })}
                      />
                    </div>
                    <div>
                      <label className={fieldLabel}>End date</label>
                      <Input
                        type="date"
                        value={selectedSlide.endDate ?? ""}
                        onChange={(e) => updateSlide(selectedSlide.id, { endDate: e.target.value || undefined })}
                      />
                    </div>
                  </div>

                  {language !== "en" && (
                    <div>
                      <label className={fieldLabel}>
                        {activeLanguages.find((l) => l.code === language)?.native_name ?? language} artwork
                        override
                      </label>
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <ImagePlus className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate text-xs text-foreground">
                          {selectedSlide.translations[language]?.imageOverrideLabel ??
                            "Using shared image"}
                        </span>
                        <label className="shrink-0 cursor-pointer text-xs font-medium text-navy hover:text-navy/70">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file)
                                updateTranslation(selectedSlide.id, { imageOverrideLabel: file.name });
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="space-y-4 pt-4">
                <p className="text-sm font-semibold text-foreground">Rotation</p>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className={fieldLabel + " mb-0"}>Slide interval</span>
                    <span className="text-xs text-muted-foreground">{interval.toFixed(1)}s</span>
                  </div>
                  <Slider
                    min={2}
                    max={12}
                    step={0.5}
                    value={[interval]}
                    onValueChange={(v) => setIntervalSec(Array.isArray(v) ? v[0] : v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Auto-play</span>
                  <Toggle checked={autoplay} onChange={setAutoplay} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Pause on hover</span>
                  <Toggle checked={pauseOnHover} onChange={setPauseOnHover} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Show navigation dots</span>
                  <Toggle checked={showDots} onChange={setShowDots} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Show arrows</span>
                  <Toggle checked={showArrows} onChange={setShowArrows} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted-foreground">
          No slides in this group yet — add one to get started.
        </p>
      )}
    </div>
  );
}

export default function CmsBannersPage() {
  return (
    <PermissionGuard module="cms">
      <BannersCatalog />
    </PermissionGuard>
  );
}
