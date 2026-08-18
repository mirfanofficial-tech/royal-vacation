const tips = [
  {
    eyebrow: "While you wait",
    title: "Free cancellation on 78% of Dubai stays",
    description: "Look for the green badge on a property card to book now and pay later.",
  },
  {
    eyebrow: "Good to know",
    title: "Prices shown include taxes and fees",
    description: "No hidden charges appear at checkout — what you see is what you pay.",
  },
  {
    eyebrow: "Map tip",
    title: "Drag the map to search a new area",
    description: "Results refresh automatically as you move around the city.",
  },
];

export function SearchWaitTips() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {tips.map((tip) => (
        <div key={tip.title} className="rounded-xl border border-border bg-white p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">{tip.eyebrow}</p>
          <p className="mt-1.5 text-sm font-semibold text-navy">{tip.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{tip.description}</p>
        </div>
      ))}
    </div>
  );
}
