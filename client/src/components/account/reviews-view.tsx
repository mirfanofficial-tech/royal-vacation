"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgeDollarSign,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CornerDownRight,
  Eye,
  Image as ImageIcon,
  ImagePlus,
  PenLine,
  Pencil,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import {
  draftCount,
  followedPropertyReviews,
  howReviewsWork,
  myReviews,
  propertyReviewCount,
  reviewCredit,
  reviewStats,
  reviewerProfile,
  scoreLabel,
  unfinishedDrafts,
  waitingForReview,
  type MyReview,
  type PropertyReview,
} from "@/lib/account-reviews-mock-data";

const STAT_ICONS: Record<string, typeof Star> = {
  written: PenLine,
  score: Star,
  helpful: ThumbsUp,
  photos: ImageIcon,
  credit: BadgeDollarSign,
};
const BADGE_ICONS: Record<string, typeof Star> = {
  photo: Camera,
  detailed: PenLine,
  first: Zap,
};

type Tab = "mine" | "properties";
type SortKey = "newest" | "score" | "helpful";
type ListFilter = "all" | "published" | "pending" | "photos";
const PAGE_SIZE = 4;

function Stars({ score }: { score: number }) {
  const filled = Math.round(score / 2);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= filled ? "fill-gold text-gold" : "text-muted-foreground/35"}`}
        />
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: MyReview["status"] }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
        published ? "text-rating" : "text-amber-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${published ? "bg-rating" : "bg-amber-500"}`}
      />
      {published ? "Published" : "Pending approval"}
    </span>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star
            className={`h-4 w-4 ${n <= shown ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        {value ? `${value}/5` : "Tap to rate"}
      </span>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  destructive,
  onClick,
}: {
  icon: typeof Star;
  label: string;
  destructive?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
        destructive
          ? "border-destructive/30 text-destructive hover:bg-destructive/10"
          : "border-border text-foreground hover:border-navy hover:text-navy"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function PublishedReviewCard({
  r,
  onAction,
}: {
  r: MyReview;
  onAction: (msg: string) => void;
}) {
  const visible = r.photos.slice(0, 3);
  return (
    <article className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
          <Image src={r.image} alt={r.propertyName} fill className="object-cover" sizes="112px" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="font-heading text-base font-bold text-navy">{r.propertyName}</h3>
            <StatusBadge status={r.status} />
          </div>
          <div className="mt-0.5 flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5">
            <p className="text-xs text-muted-foreground">
              {r.location} · {r.roomType} · {r.nights} nights · Stayed {r.stayedOn}
            </p>
            <p className="shrink-0 text-xs text-muted-foreground">{r.dateLabel}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-navy px-1.5 py-0.5 text-xs font-bold text-white">
              {r.score.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">Your rating</span>
            <Stars score={r.score} />
            <span className="text-xs font-semibold text-rating">· {scoreLabel(r.score)}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 font-semibold text-foreground">&ldquo;{r.title}&rdquo;</p>

      <p className="mt-2 flex gap-2 text-sm leading-relaxed text-muted-foreground">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-rating" />
        <span>{r.pros}</span>
      </p>
      {r.cons && (
        <p className="mt-1.5 flex gap-2 text-sm leading-relaxed text-muted-foreground">
          <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span>{r.cons}</span>
        </p>
      )}

      {(visible.length > 0 || r.status === "published") && (
        <div className="mt-3 flex flex-wrap gap-2">
          {visible.map((p, i) => (
            <div key={p} className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md">
              <Image src={p} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="80px" />
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAction("Photo uploads open in the review editor — coming soon.")}
            className="flex h-16 w-20 shrink-0 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-border text-[11px] font-medium text-muted-foreground hover:border-navy hover:text-navy"
          >
            <ImagePlus className="h-4 w-4" />
            Add
          </button>
        </div>
      )}

      {r.reply && (
        <div className="mt-3 rounded-r-lg border-l-2 border-gold bg-muted/40 py-2.5 pl-3 pr-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy">
            <CornerDownRight className="h-3.5 w-3.5" />
            {r.reply.author} replied · {r.reply.date}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.reply.text}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        {r.status === "published" ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ThumbsUp className="h-3.5 w-3.5" />
              {r.helpfulVotes} travellers found this helpful
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {r.views.toLocaleString()} views
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Awaiting moderation · usually within 48 hours
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Not visible yet
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <ActionButton
            icon={Share2}
            label="Share"
            onClick={() => {
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                void navigator.clipboard.writeText(
                  `${window.location.origin}/property/${r.id}`,
                );
                onAction("Link to your review copied to clipboard.");
              }
            }}
          />
          <ActionButton
            icon={Pencil}
            label="Edit"
            onClick={() => onAction("Editing published reviews will be available soon.")}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            destructive
            onClick={() => onAction("Deleting reviews will be available soon.")}
          />
        </div>
      </div>
    </article>
  );
}

function PropertyReviewCard({ r }: { r: PropertyReview }) {
  return (
    <article className="rounded-2xl border border-border bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-lg sm:w-28">
          <Image src={r.image} alt={r.propertyName} fill className="object-cover" sizes="112px" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <h3 className="font-heading text-base font-bold text-navy">{r.propertyName}</h3>
            <span className="shrink-0 text-xs text-muted-foreground">{r.date}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {r.reviewer} · {r.reviewerCountry}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-md bg-navy px-1.5 py-0.5 text-xs font-bold text-white">
              {r.score.toFixed(1)}
            </span>
            <Stars score={r.score} />
            <span className="text-xs font-semibold text-rating">· {scoreLabel(r.score)}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {r.helpfulVotes} found this helpful
          </p>
        </div>
      </div>
    </article>
  );
}

function Sidebar({ onAction }: { onAction: (msg: string) => void }) {
  return (
    <aside className="flex flex-col gap-4">
      {/* Reviewer status */}
      <div className="rounded-2xl bg-navy p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-navy-dark">
            {reviewerProfile.initials}
          </span>
          <div className="min-w-0">
            <p className="font-heading text-base font-bold">{reviewerProfile.name}</p>
            <p className="text-xs text-white/70">{reviewerProfile.standing}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/75">{reviewerProfile.toNext}</p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
            style={{ width: `${reviewerProfile.progressPct}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {reviewerProfile.badges.map((b) => {
            const Icon = BADGE_ICONS[b.key] ?? Star;
            return (
              <span
                key={b.key}
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white"
              >
                <Icon className="h-3 w-3 text-gold-light" />
                {b.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Review credit */}
      <div className="rounded-2xl border border-rating/20 bg-rating/5 p-5">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
            <BadgeDollarSign className="h-4 w-4 text-rating" />
            Review credit
          </p>
          <span className="text-lg font-bold text-rating">{reviewCredit.amount}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{reviewCredit.note}</p>
        <button
          type="button"
          onClick={() => onAction("Your review credit applies automatically at checkout.")}
          className="mt-3 w-full rounded-lg bg-rating px-4 py-2 text-sm font-semibold text-white hover:bg-rating/90"
        >
          Use credit on a booking
        </button>
      </div>

      {/* Unfinished drafts */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-navy">Unfinished drafts</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
            {draftCount}
          </span>
        </div>
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {unfinishedDrafts.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-2 py-2.5 first:pt-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{d.propertyName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {d.saved} · {d.percent}% complete
                </p>
              </div>
              <button
                type="button"
                onClick={() => onAction("The review editor is coming soon.")}
                className="shrink-0 text-xs font-semibold text-navy hover:underline"
              >
                Continue
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* How reviews work */}
      <div className="rounded-2xl border border-border bg-white p-5">
        <p className="text-sm font-bold text-navy">How reviews work</p>
        <ul className="mt-3 flex flex-col gap-2.5 text-xs text-muted-foreground">
          {howReviewsWork.map((line, i) => (
            <li key={i} className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy" />
              {line}
            </li>
          ))}
        </ul>
        <a href="#" className="mt-3 inline-block text-xs font-semibold text-navy hover:underline">
          Read the full review policy
        </a>
      </div>
    </aside>
  );
}

export function ReviewsView() {
  const [tab, setTab] = useState<Tab>("mine");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [page, setPage] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [notice, setNotice] = useState<string | null>(null);

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice((n) => (n === msg ? null : n)), 4000);
  }

  const mineFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = myReviews.filter((r) => {
      if (listFilter === "published" && r.status !== "published") return false;
      if (listFilter === "pending" && r.status !== "pending") return false;
      if (listFilter === "photos" && r.photos.length === 0) return false;
      return !q || `${r.propertyName} ${r.title} ${r.pros} ${r.cons ?? ""}`.toLowerCase().includes(q);
    });
    list = [...list];
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    else if (sort === "helpful") list.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    else list.sort((a, b) => b.sortDate.localeCompare(a.sortDate));
    return list;
  }, [query, sort, listFilter]);

  const others = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = followedPropertyReviews.filter(
      (r) => !q || `${r.propertyName} ${r.reviewer} ${r.text}`.toLowerCase().includes(q),
    );
    list = [...list];
    if (sort === "score") list.sort((a, b) => b.score - a.score);
    else if (sort === "helpful") list.sort((a, b) => b.helpfulVotes - a.helpfulVotes);
    else list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [query, sort]);

  const activeList = tab === "mine" ? mineFiltered : others;
  const pageCount = Math.max(1, Math.ceil(activeList.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = activeList.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const firstIdx = activeList.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const lastIdx = (safePage - 1) * PAGE_SIZE + pageItems.length;

  const tabs: { key: Tab; label: string; count: string; hint: string }[] = [
    { key: "mine", label: "My reviews", count: String(myReviews.length), hint: "Stays you have reviewed" },
    {
      key: "properties",
      label: "Property reviews",
      count: propertyReviewCount.toLocaleString(),
      hint: "Reviews left by other guests",
    },
  ];
  const listFilters: { key: ListFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "published", label: "Published" },
    { key: "pending", label: "Pending" },
    { key: "photos", label: "With photos" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Intro + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Reviews you have written about your stays, and the reviews left on properties you follow.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground">
            <PenLine className="h-4 w-4 text-muted-foreground" />
            Drafts
            <span className="rounded-full bg-gold px-1.5 text-xs font-bold text-navy-dark">
              {draftCount}
            </span>
          </span>
          <a
            href="#pending"
            className="inline-flex items-center gap-1.5 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
          >
            <PenLine className="h-4 w-4" />
            Write a review
          </a>
        </div>
      </div>

      {/* Tabs + search/sort */}
      <div className="flex flex-col gap-4 border-b border-border lg:flex-row lg:items-end lg:justify-between">
        <div className="-mb-px flex gap-6 sm:gap-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`border-b-2 pb-3 text-left transition-colors ${
                tab === t.key
                  ? "border-gold text-navy"
                  : "border-transparent text-muted-foreground hover:text-navy"
              }`}
            >
              <span className="flex items-center gap-1.5 text-sm font-bold">
                {t.label}
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    tab === t.key ? "bg-navy text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.count}
                </span>
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{t.hint}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search your reviews"
              className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-8 pr-3 text-sm outline-none focus-visible:border-navy focus-visible:bg-white sm:w-56"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-lg border border-border bg-white px-2.5 text-sm font-semibold text-foreground outline-none focus-visible:border-navy"
          >
            <option value="newest">Newest first</option>
            <option value="score">Highest score</option>
            <option value="helpful">Most helpful</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-5 rounded-2xl border border-border bg-muted/40 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-5">
        {reviewStats.map((s) => {
          const Icon = STAT_ICONS[s.key] ?? Star;
          return (
            <div key={s.key}>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-navy" />
                {s.label}
              </p>
              <p className="mt-1.5 font-heading text-3xl font-bold text-navy">{s.value}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Waiting for your review */}
      <section id="pending" className="scroll-mt-24">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-navy">
            <Sparkles className="h-4 w-4 text-gold" />
            Waiting for your review
            <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
              {waitingForReview.length} stays
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Each verified review earns $20 in travel credit
          </p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {waitingForReview.map((p) => (
            <div key={p.id} className="flex gap-4 rounded-xl border border-gold/25 bg-cream p-3.5">
              <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg">
                <Image src={p.image} alt={p.propertyName} fill className="object-cover" sizes="80px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold text-navy">{p.propertyName}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.roomType} · {p.nights} nights · Stayed {p.stayedOn}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      flash(`Rating saved for ${p.propertyName}. The review editor is coming soon.`)
                    }
                    className="shrink-0 rounded-lg bg-gold px-3.5 py-2 text-xs font-bold text-navy-dark hover:bg-gold-light"
                  >
                    Write review
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <InteractiveStars
                    value={ratings[p.id] ?? 0}
                    onChange={(v) => setRatings((prev) => ({ ...prev, [p.id]: v }))}
                  />
                  <span className="text-xs font-medium text-gold">
                    Review closes in {p.closesInDays} days
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {notice && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          {notice}
        </p>
      )}

      {/* Two-column: list + sidebar */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-bold text-navy">
              {tab === "mine" ? "Your published reviews" : "Reviews from other guests"}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                {activeList.length}
              </span>
            </h2>
            {tab === "mine" && (
              <div className="flex flex-wrap gap-2">
                {listFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setListFilter(f.key);
                      setPage(1);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      listFilter === f.key
                        ? "border-navy bg-navy text-white"
                        : "border-border text-foreground hover:border-navy hover:text-navy"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {pageItems.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                No reviews match your filters.
              </p>
            ) : tab === "mine" ? (
              (pageItems as MyReview[]).map((r) => (
                <PublishedReviewCard key={r.id} r={r} onAction={flash} />
              ))
            ) : (
              (pageItems as PropertyReview[]).map((r) => (
                <PropertyReviewCard key={r.id} r={r} />
              ))
            )}
          </div>

          {activeList.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Showing {firstIdx}–{lastIdx} of {activeList.length} reviews
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground disabled:pointer-events-none disabled:opacity-40 hover:border-navy hover:text-navy"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`h-8 min-w-8 rounded-lg border px-2 text-sm font-semibold ${
                      n === safePage
                        ? "border-navy bg-navy text-white"
                        : "border-border text-foreground hover:border-navy hover:text-navy"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage === pageCount}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground disabled:pointer-events-none disabled:opacity-40 hover:border-navy hover:text-navy"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <Sidebar onAction={flash} />
      </div>
    </div>
  );
}
