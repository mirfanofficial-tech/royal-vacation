import { ImagePlus } from "lucide-react";

import type { BuilderBlock } from "@/lib/page-builder-types";
import { cn } from "@/lib/utils";

const heightClass: Record<string, string> = {
  small: "min-h-[220px]",
  medium: "min-h-[320px]",
  large: "min-h-[420px]",
};

function HeroBannerBlock({ props }: { props: Extract<BuilderBlock, { type: "hero-banner" }>["props"] }) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-center overflow-hidden rounded-xl bg-navy px-8 py-10 text-white",
        heightClass[props.height],
        props.align === "center" ? "items-center text-center" : "items-start text-left"
      )}
    >
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: props.overlayOpacity / 100 }}
        aria-hidden
      />
      <div className="relative space-y-3">
        <p className="text-xs font-semibold tracking-wide text-gold">{props.eyebrow}</p>
        <h2 className="max-w-xl text-3xl font-semibold text-white">{props.headline}</h2>
        {props.showSearchWidget && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-white px-4 py-3 text-sm text-navy shadow-sm">
            <span>Where to?</span>
            <span className="text-muted-foreground">Check in</span>
            <span className="text-muted-foreground">Check out</span>
            <span className="text-muted-foreground">2 guests</span>
            <span className="ml-auto rounded-lg bg-gold px-4 py-1.5 font-semibold text-navy">
              Search
            </span>
          </div>
        )}
        {props.showTrustBadges && (
          <div className="flex flex-wrap gap-4 pt-2 text-xs text-white/80">
            <span>Free cancellation</span>
            <span>4.8 guest rating</span>
            <span>Best price promise</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RichTextBlock({ props }: { props: Extract<BuilderBlock, { type: "rich-text" }>["props"] }) {
  return (
    <div
      className="prose prose-sm max-w-none rounded-xl border border-border bg-white p-6"
      dangerouslySetInnerHTML={{ __html: props.html || "<p class='text-muted-foreground'>Empty rich text block</p>" }}
    />
  );
}

function ImageBlock({ props }: { props: Extract<BuilderBlock, { type: "image" }>["props"] }) {
  return (
    <figure className="overflow-hidden rounded-xl border border-border bg-white">
      <div className="flex h-56 items-center justify-center bg-muted/60">
        {props.objectUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.objectUrl} alt={props.alt} className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-8 text-muted-foreground" />
        )}
      </div>
      {props.caption && (
        <figcaption className="px-4 py-2 text-xs text-muted-foreground">{props.caption}</figcaption>
      )}
    </figure>
  );
}

function TwoColumnBlock({ props }: { props: Extract<BuilderBlock, { type: "two-column" }>["props"] }) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-white p-6 sm:grid-cols-2">
      <div>
        <h3 className="font-semibold text-foreground">{props.leftHeading || "Left heading"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{props.leftText || "Left column text…"}</p>
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{props.rightHeading || "Right heading"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{props.rightText || "Right column text…"}</p>
      </div>
    </div>
  );
}

function PropertyGridBlock({ props }: { props: Extract<BuilderBlock, { type: "property-grid" }>["props"] }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{props.heading || "Property grid"}</h3>
          {props.subheading && <p className="text-sm text-muted-foreground">{props.subheading}</p>}
          <p className="mt-1 text-xs text-muted-foreground">
            Dynamic block · pulls {props.count} properties tagged &ldquo;{props.tag || "untagged"}&rdquo;
          </p>
        </div>
        <span className="text-sm font-medium text-navy">View all →</span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: props.count }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            <div className="flex h-24 items-center justify-center bg-muted/60">
              <ImagePlus className="size-5 text-muted-foreground" />
            </div>
            <div className="p-2">
              <p className="truncate text-sm font-medium text-foreground">Placeholder property {i + 1}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlockPreview({ block }: { block: BuilderBlock }) {
  switch (block.type) {
    case "hero-banner":
      return <HeroBannerBlock props={block.props} />;
    case "rich-text":
      return <RichTextBlock props={block.props} />;
    case "image":
      return <ImageBlock props={block.props} />;
    case "two-column":
      return <TwoColumnBlock props={block.props} />;
    case "property-grid":
      return <PropertyGridBlock props={block.props} />;
  }
}
