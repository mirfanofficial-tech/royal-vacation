import { Search } from "lucide-react";

export function JournalHero({
  articleCount,
  categoryCount,
  category,
  q,
}: {
  articleCount: number;
  categoryCount: number;
  category?: string;
  q?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy-dark via-navy to-navy-dark">
      <div className="flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <span className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold-light">
            <span className="h-px w-6 bg-gold-light" />
            The Travel Journal
          </span>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Stories, guides and honest advice for your next escape
          </h1>
          <p className="mt-3 text-sm text-white/75">
            Hand-picked destinations, hotel reviews and practical travel tips from the Royal
            Vacation editorial team.
          </p>
        </div>

        <div className="flex w-full max-w-md flex-col gap-4">
          <form action="/blog" method="get" className="flex w-full items-center">
            {category && <input type="hidden" name="category" value={category} />}
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search articles, cities, tips…"
                className="h-11 w-full rounded-full border-none bg-white pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy-dark hover:bg-gold-light"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-6">
            <div>
              <p className="font-heading text-xl font-bold text-white">{articleCount}</p>
              <p className="text-xs text-white/60">Articles</p>
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-white">{categoryCount}</p>
              <p className="text-xs text-white/60">Categories</p>
            </div>
            <div>
              <p className="font-heading text-xl font-bold text-white">Weekly</p>
              <p className="text-xs text-white/60">New stories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
