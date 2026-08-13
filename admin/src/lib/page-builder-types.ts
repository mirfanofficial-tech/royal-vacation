export type BuilderBlockType =
  | "hero-banner"
  | "rich-text"
  | "image"
  | "two-column"
  | "property-grid";

export interface HeroBannerProps {
  eyebrow: string;
  headline: string;
  backgroundLabel: string;
  overlayOpacity: number;
  align: "left" | "center";
  height: "small" | "medium" | "large";
  showSearchWidget: boolean;
  showTrustBadges: boolean;
  parallaxScroll: boolean;
}

export interface RichTextProps {
  html: string;
}

export interface ImageProps {
  objectUrl: string | null;
  alt: string;
  caption: string;
}

export interface TwoColumnProps {
  leftHeading: string;
  leftText: string;
  rightHeading: string;
  rightText: string;
}

export interface PropertyGridProps {
  heading: string;
  subheading: string;
  tag: string;
  count: 3 | 6 | 9;
}

export type BuilderBlock =
  | { id: string; type: "hero-banner"; label: string; props: HeroBannerProps }
  | { id: string; type: "rich-text"; label: string; props: RichTextProps }
  | { id: string; type: "image"; label: string; props: ImageProps }
  | { id: string; type: "two-column"; label: string; props: TwoColumnProps }
  | { id: string; type: "property-grid"; label: string; props: PropertyGridProps };

let blockIdCounter = 0;
function nextBlockId() {
  blockIdCounter += 1;
  return `block_${blockIdCounter}_${Math.floor(Math.random() * 1e6)}`;
}

export function createBlock(type: BuilderBlockType): BuilderBlock {
  const id = nextBlockId();
  switch (type) {
    case "hero-banner":
      return {
        id,
        type,
        label: "Hero banner",
        props: {
          eyebrow: "DUBAI · 248 PROPERTIES",
          headline: "Where the desert meets five-star luxury",
          backgroundLabel: "dubai-skyline-dusk.jpg",
          overlayOpacity: 62,
          align: "left",
          height: "medium",
          showSearchWidget: true,
          showTrustBadges: true,
          parallaxScroll: false,
        },
      };
    case "rich-text":
      return {
        id,
        type,
        label: "Rich text",
        props: { html: "<h3>Handpicked stays in Dubai</h3><p>Dynamic block content goes here.</p>" },
      };
    case "image":
      return { id, type, label: "Image", props: { objectUrl: null, alt: "", caption: "" } };
    case "two-column":
      return {
        id,
        type,
        label: "Two column split",
        props: { leftHeading: "", leftText: "", rightHeading: "", rightText: "" },
      };
    case "property-grid":
      return {
        id,
        type,
        label: "Property grid",
        props: { heading: "Handpicked stays", subheading: "", tag: "dubai-luxury", count: 3 },
      };
  }
}

export function createDefaultBlocks(): BuilderBlock[] {
  return [createBlock("hero-banner"), createBlock("property-grid")];
}

export const enabledBlockTypes: BuilderBlockType[] = [
  "hero-banner",
  "rich-text",
  "image",
  "two-column",
  "property-grid",
];
