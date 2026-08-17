import { geniusSteps } from "@/lib/genius-mock-data";

export function HowGeniusWorks() {
  return (
    <div id="how-genius-works" className="scroll-mt-24">
      <h2 className="font-heading text-2xl font-bold text-navy">How Genius works</h2>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {geniusSteps.map((step) => (
          <div key={step.step}>
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-bold text-gold">{step.step}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <h3 className="mt-3 font-semibold text-foreground">{step.title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Genius discounts apply to selected properties and room types and can&apos;t be combined
        with some promotional rates. Level progress is calculated on completed stays within a
        rolling 24 months.
      </p>
    </div>
  );
}
