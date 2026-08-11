"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  ChevronDown,
  Crown,
  Globe2,
  Heart,
  ImagePlus,
  Loader2,
  Palette,
  Phone,
  Save,
  Search,
  Star,
  Type,
} from "lucide-react";

import type {
  FontFamilyOption,
  FontSizeOption,
  FooterVariant,
  HeaderVariant,
} from "@royal-vacation/api-client";
import { ApiError, resolveAssetUrl } from "@/lib/api";
import { useTheme } from "@/lib/theme";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

const fontFamilies: { value: FontFamilyOption; label: string; sample: string }[] = [
  { value: "outfit", label: "Outfit", sample: "font-sans" },
  { value: "inter", label: "Inter", sample: "font-sans" },
  { value: "poppins", label: "Poppins", sample: "font-sans" },
  { value: "playfair_display", label: "Playfair Display", sample: "font-serif" },
  { value: "roboto", label: "Roboto", sample: "font-sans" },
];

const fontSizes: { value: FontSizeOption; label: string; previewClass: string }[] = [
  { value: "sm", label: "Small", previewClass: "text-sm" },
  { value: "md", label: "Medium", previewClass: "text-base" },
  { value: "lg", label: "Large", previewClass: "text-lg" },
  { value: "xl", label: "Extra Large", previewClass: "text-xl" },
];

const cardBase =
  "relative w-full rounded-xl border p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
const cardSelected = "border-navy ring-2 ring-navy/20";
const cardUnselected = "border-border hover:border-navy/40";

function SelectedBadge() {
  return (
    <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-navy text-white">
      <BadgeCheck className="size-3.5" />
    </span>
  );
}

// ---- Header variant preview mockups (real designs, thumbnail-scale) -----

function HeaderPreviewDefault() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-[10px]">
      <span className="flex items-center gap-1 font-bold">
        <Crown className="size-3 text-gold" />
        <span className="text-navy">ROYAL</span>
        <span className="text-gold">VACATION</span>
      </span>
      <span className="hidden gap-2 text-navy/70 sm:flex">
        <span className="text-navy underline underline-offset-2">Stays</span>
        <span>Flights</span>
        <span>Cars</span>
      </span>
      <span className="flex items-center gap-1.5 text-navy/80">
        <span className="flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5">
          <Globe2 className="size-2.5" /> EN · USD <ChevronDown className="size-2.5" />
        </span>
        <span className="hidden text-navy/60 md:inline">Register</span>
        <span className="rounded-full bg-navy px-2 py-0.5 text-white">Sign in</span>
      </span>
    </div>
  );
}

function HeaderPreviewClassic() {
  return (
    <div className="flex items-center justify-between rounded-lg bg-navy px-3 py-2 text-[10px]">
      <span className="flex items-center gap-1 font-bold text-gold">
        <Crown className="size-3" /> ROYAL VACATION
      </span>
      <span className="hidden gap-2 text-white/80 sm:flex">
        <span className="text-gold underline underline-offset-2">Stays</span>
        <span>Flights</span>
        <span>Cars</span>
      </span>
      <span className="flex items-center gap-1.5 text-white/90">
        <span>Register</span>
        <span className="rounded-full border border-gold px-2 py-0.5 text-gold">Sign in</span>
      </span>
    </div>
  );
}

function HeaderPreviewVariant2() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-[10px]">
      <span className="flex items-center gap-1 font-bold text-gold">
        <Crown className="size-3" /> ROYAL VACATION
      </span>
      <span className="hidden gap-2 text-navy/70 sm:flex">
        <span className="text-gold underline underline-offset-2">Stays</span>
        <span>Flights</span>
        <span>Cars</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Search className="size-3 rounded-full border border-border p-0.5 text-muted-foreground" />
        <span className="hidden text-muted-foreground md:inline">List your property</span>
        <span className="rounded-full bg-gold px-2 py-0.5 text-white">Sign in</span>
      </span>
    </div>
  );
}

function HeaderPreviewVariant3() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white px-3 py-2 text-[10px]">
      <span className="flex items-center gap-1 font-semibold text-navy">
        <Crown className="size-3" strokeWidth={1.5} /> Royal Vacation
      </span>
      <span className="hidden gap-2 text-navy/70 sm:flex">
        <span className="text-gold underline underline-offset-2">Stays</span>
        <span>Flights</span>
      </span>
      <span className="flex items-center gap-1">
        <Search className="size-3 rounded-full border border-border p-0.5 text-muted-foreground" />
        <Heart className="size-3 rounded-full border border-border p-0.5 text-muted-foreground" />
        <Bell className="size-3 rounded-full border border-border p-0.5 text-muted-foreground" />
        <span className="flex size-3.5 items-center justify-center rounded-full bg-navy text-[7px] text-white">
          JD
        </span>
        <span className="rounded-full bg-gold px-2 py-0.5 text-white">Book Now</span>
      </span>
    </div>
  );
}

function HeaderPreviewVariant4() {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f4f1ea] px-3 py-2 text-[10px]">
      <span className="flex items-center gap-1 font-bold text-navy">
        <Crown className="size-3" /> ROYAL VACATION
      </span>
      <span className="hidden gap-2 text-navy/70 sm:flex">
        <span className="text-gold underline underline-offset-2">Stays</span>
        <span>Flights</span>
      </span>
      <span className="flex items-center gap-1.5">
        <Phone className="size-3 rounded-full border border-border bg-white p-0.5 text-muted-foreground" />
        <span className="text-navy/70">Sign in</span>
        <span className="rounded-full bg-navy px-2 py-0.5 text-white">List property</span>
      </span>
    </div>
  );
}

function HeaderPreviewVariant5() {
  return (
    <div className="rounded-lg border-b-2 border-gold bg-white px-3 py-2 text-[10px]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1 font-bold text-navy">
          <Crown className="size-3" /> ROYAL VACATION
        </span>
        <span className="hidden gap-2 text-navy/70 sm:flex">
          <span className="text-gold underline underline-offset-2">Stays</span>
          <span>Flights</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 text-muted-foreground">
            <Star className="size-3 fill-gold text-gold" /> 4.9 rated
          </span>
          <span className="rounded-full bg-gold px-2 py-0.5 text-white">Sign in</span>
        </span>
      </div>
    </div>
  );
}

const headerVariants: {
  value: HeaderVariant;
  label: string;
  description: string;
  Preview: React.ComponentType;
}[] = [
  { value: "default", label: "Default (Current Site)", description: "The header live on the site today", Preview: HeaderPreviewDefault },
  { value: "classic", label: "Dark Left Logo", description: "Navy bar, gold wordmark", Preview: HeaderPreviewClassic },
  { value: "variant_2", label: "Single Row Search", description: "Light bar with search + list-property link", Preview: HeaderPreviewVariant2 },
  { value: "variant_3", label: "Compact Modern Avatar", description: "Icon cluster + account avatar", Preview: HeaderPreviewVariant3 },
  { value: "variant_4", label: "Ivory Concierge", description: "Ivory bar, call button, list-property CTA", Preview: HeaderPreviewVariant4 },
  { value: "variant_5", label: "Gold Accent Trust Badge", description: "Gold underline, rating badge", Preview: HeaderPreviewVariant5 },
];

// ---- Footer variants — placeholders pending real designs -----------------

function FooterPreview({ tone }: { tone: "light" | "dark" | "compact" | "centered" | "band" }) {
  if (tone === "dark") {
    return <div className="h-10 rounded-lg bg-navy" />;
  }
  if (tone === "compact") {
    return (
      <div className="flex h-10 items-center justify-between rounded-lg border border-border bg-white px-3 text-[10px] text-muted-foreground">
        <span>© Royal Vacation</span>
        <span className="flex gap-1">
          <span className="size-3 rounded-full bg-muted" />
          <span className="size-3 rounded-full bg-muted" />
        </span>
      </div>
    );
  }
  if (tone === "centered") {
    return (
      <div className="flex h-10 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-white text-[10px] text-muted-foreground">
        <span>Company · Support · Partners</span>
      </div>
    );
  }
  if (tone === "band") {
    return (
      <div className="h-10 overflow-hidden rounded-lg border border-border">
        <div className="h-4 bg-gold/20" />
        <div className="h-6 bg-white" />
      </div>
    );
  }
  return (
    <div className="grid h-10 grid-cols-4 gap-1 rounded-lg border border-border bg-white p-1.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <div className="h-1 w-3/4 rounded bg-muted-foreground/30" />
          <div className="h-1 w-1/2 rounded bg-muted-foreground/20" />
        </div>
      ))}
    </div>
  );
}

const footerVariants: {
  value: FooterVariant;
  label: string;
  description: string;
  tone: "light" | "dark" | "compact" | "centered" | "band";
}[] = [
  { value: "classic", label: "Classic Columns", description: "Multi-column links (current)", tone: "light" },
  { value: "variant_2", label: "Compact", description: "Placeholder — single row, minimal", tone: "compact" },
  { value: "variant_3", label: "Centered", description: "Placeholder — centered link list", tone: "centered" },
  { value: "variant_4", label: "Dark", description: "Placeholder — navy background", tone: "dark" },
  { value: "variant_5", label: "Newsletter Band", description: "Placeholder — signup band on top", tone: "band" },
];

export default function ThemesPage() {
  const {
    theme,
    isLoading,
    error,
    updateTheme,
    uploadLogo,
    isSaving,
    isUploadingLogo,
  } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState("");

  const [fontFamily, setFontFamily] = useState<FontFamilyOption>("outfit");
  const [headingSize, setHeadingSize] = useState<FontSizeOption>("md");
  const [paragraphSize, setParagraphSize] = useState<FontSizeOption>("md");
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>("default");
  const [footerVariant, setFooterVariant] = useState<FooterVariant>("classic");
  const [hydrated, setHydrated] = useState(false);

  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  if (theme && !hydrated) {
    setFontFamily(theme.font_family);
    setHeadingSize(theme.heading_font_size);
    setParagraphSize(theme.paragraph_font_size);
    setHeaderVariant(theme.header_variant);
    setFooterVariant(theme.footer_variant);
    setHydrated(true);
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoError("");
    try {
      await uploadLogo(file);
    } catch (err) {
      setLogoError(errorMessage(err, "Failed to upload logo."));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaveError("");
    try {
      await updateTheme({
        font_family: fontFamily,
        heading_font_size: headingSize,
        paragraph_font_size: paragraphSize,
        header_variant: headerVariant,
        footer_variant: footerVariant,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(errorMessage(err, "Failed to save theme."));
    }
  }

  return (
    <PermissionGuard module="settings">
      <div className="space-y-6 p-6 lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-navy">Themes</h1>
            <p className="text-sm text-muted-foreground">
              Control the public website&apos;s header, footer, typography and logo.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              Save Theme
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
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ImagePlus className="size-4 text-muted-foreground" />
                  Logo
                </CardTitle>
                <CardDescription>
                  Replaces the crown icon + wordmark across the admin panel and the public site.
                  PNG, JPEG, WEBP or SVG, up to 2 MB.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
                  {theme?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveAssetUrl(theme.logo_url)}
                      alt="Current logo"
                      className="size-full object-contain"
                    />
                  ) : (
                    <Crown className="size-6 text-gold" strokeWidth={1.75} />
                  )}
                </span>
                <div className="space-y-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingLogo}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingLogo ? (
                      <Loader2 data-icon="inline-start" className="animate-spin" />
                    ) : (
                      <ImagePlus data-icon="inline-start" />
                    )}
                    {theme?.logo_url ? "Replace logo" : "Upload logo"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  {logoError && <p className="text-xs text-destructive">{logoError}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Type className="size-4 text-muted-foreground" />
                  Typography
                </CardTitle>
                <CardDescription>Font family and base sizes for headings and paragraphs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Font family</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    {fontFamilies.map((f) => (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFontFamily(f.value)}
                        className={cn(cardBase, fontFamily === f.value ? cardSelected : cardUnselected)}
                      >
                        {fontFamily === f.value && <SelectedBadge />}
                        <p className={cn("text-lg", f.sample)}>Aa</p>
                        <p className="text-xs text-muted-foreground">{f.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Heading size</p>
                    <div className="grid grid-cols-2 gap-2">
                      {fontSizes.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setHeadingSize(s.value)}
                          className={cn(cardBase, headingSize === s.value ? cardSelected : cardUnselected)}
                        >
                          {headingSize === s.value && <SelectedBadge />}
                          <p className={cn("font-semibold text-navy", s.previewClass)}>Heading</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Paragraph size</p>
                    <div className="grid grid-cols-2 gap-2">
                      {fontSizes.map((s) => (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() => setParagraphSize(s.value)}
                          className={cn(cardBase, paragraphSize === s.value ? cardSelected : cardUnselected)}
                        >
                          {paragraphSize === s.value && <SelectedBadge />}
                          <p className={cn("text-muted-foreground", s.previewClass)}>Paragraph text</p>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Palette className="size-4 text-muted-foreground" />
                  Header design
                </CardTitle>
                <CardDescription>Choose the header layout used on the public website.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {headerVariants.map(({ value, label, description, Preview }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHeaderVariant(value)}
                    className={cn(cardBase, headerVariant === value ? cardSelected : cardUnselected)}
                  >
                    {headerVariant === value && <SelectedBadge />}
                    <Preview />
                    <p className="mt-2 text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe2 className="size-4 text-muted-foreground" />
                  Footer design
                </CardTitle>
                <CardDescription>
                  Choose the footer layout used on the public website.{" "}
                  <Badge variant="outline" className="ml-1 align-middle text-xs">
                    Variants 2-5 are placeholders pending final designs
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {footerVariants.map(({ value, label, description, tone }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFooterVariant(value)}
                    className={cn(cardBase, footerVariant === value ? cardSelected : cardUnselected)}
                  >
                    {footerVariant === value && <SelectedBadge />}
                    <FooterPreview tone={tone} />
                    <p className="mt-2 text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </button>
                ))}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PermissionGuard>
  );
}
