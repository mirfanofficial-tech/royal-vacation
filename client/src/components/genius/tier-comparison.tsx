"use client";

import { Check, Lock, ArrowUpRight } from "lucide-react";

import { geniusLevels } from "@/lib/genius-mock-data";
import { useGenius } from "@/components/genius/genius-context";

export function TierComparison() {
  const { view } = useGenius();

  return (
    <div>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy">
            Three levels, permanent rewards
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Levels never expire once unlocked — book more, keep more.
          </p>
        </div>
        <a
          href="#how-genius-works"
          className="hidden items-center gap-1 text-sm font-medium text-navy hover:underline sm:flex"
        >
          How levels are calculated
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {geniusLevels.map((level, index) => {
          const isCurrent = view.enrolled && index === view.levelIndex;
          const isUnlocked = view.enrolled && index < view.levelIndex;
          const staysToGo = Math.max(0, level.staysRequired - view.qualifyingStays);

          return (
            <div
              key={level.name}
              className={
                isCurrent
                  ? "rounded-2xl border-2 border-gold bg-navy-dark p-6"
                  : "rounded-2xl border border-border bg-white p-6"
              }
            >
              <div className="flex items-center justify-between">
                <h3
                  className={`font-heading text-xl font-bold ${isCurrent ? "text-white" : "text-navy"}`}
                >
                  {level.name}
                </h3>
                {isCurrent ? (
                  <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-navy-dark">
                    You are here
                  </span>
                ) : isUnlocked ? (
                  <span className="rounded-full bg-rating/10 px-2.5 py-1 text-xs font-semibold text-rating">
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    {staysToGo} stays to go
                  </span>
                )}
              </div>
              <p className={`mt-1 text-sm ${isCurrent ? "text-white/60" : "text-muted-foreground"}`}>
                {level.staysRequired} stays completed
              </p>

              <ul
                className={`mt-4 flex flex-col gap-2.5 border-t pt-4 text-sm ${
                  isCurrent ? "border-white/10" : "border-border"
                }`}
              >
                {level.benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    {isCurrent ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" />
                    ) : isUnlocked ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-rating" />
                    ) : (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" />
                    )}
                    <span className={isCurrent ? "text-white/90" : isUnlocked ? "text-foreground" : "text-muted-foreground"}>
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
