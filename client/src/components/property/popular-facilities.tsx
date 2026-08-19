import { CheckCircle2 } from "lucide-react";

export function PopularFacilities({ facilities }: { facilities: string[] }) {
  return (
    <section id="facilities" className="scroll-mt-36">
      <h2 className="mb-3 font-heading text-xl font-bold text-navy">Popular facilities</h2>
      <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((facility) => (
          <li key={facility} className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {facility}
          </li>
        ))}
      </ul>
    </section>
  );
}
