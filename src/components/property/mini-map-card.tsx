import { MapPin } from "lucide-react";

export function MiniMapCard({ location }: { location: string }) {
  return (
    <div id="location" className="scroll-mt-36 overflow-hidden rounded-xl border border-border bg-white">
      <div
        className="relative aspect-[4/3] w-full bg-[#dce6ef]"
        style={{
          backgroundImage:
            "linear-gradient(#c8d6e3 1px, transparent 1px), linear-gradient(90deg, #c8d6e3 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-navy text-white shadow-md">
          <MapPin className="h-4 w-4" />
        </span>
      </div>
      <div className="p-3">
        <p className="mb-2 text-xs text-muted-foreground">{location}</p>
        <button
          type="button"
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:border-navy hover:text-navy"
        >
          View on map
        </button>
      </div>
    </div>
  );
}
