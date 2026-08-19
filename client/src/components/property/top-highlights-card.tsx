import { Sparkles } from "lucide-react";

export function TopHighlightsCard({ highlights }: { highlights: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-white p-4">
      <h3 className="mb-3 font-heading text-lg font-bold text-navy">Top highlights</h3>
      <ul className="flex flex-wrap gap-x-8 gap-y-2">
        {highlights.map((highlight) => (
          <li key={highlight} className="flex items-center gap-2 text-sm text-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-gold" />
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
