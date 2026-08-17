import Image from "next/image";
import { Crown } from "lucide-react";

import { geniusLevels, geniusMember } from "@/lib/genius-mock-data";

export function GeniusWelcomeBanner() {
  const currentLevel = geniusLevels[geniusMember.levelIndex]!;
  const nextLevel = geniusLevels[geniusMember.levelIndex + 1];
  const staysToGo = nextLevel
    ? Math.max(0, nextLevel.staysRequired - geniusMember.qualifyingStays)
    : 0;
  const progressPercent = nextLevel
    ? Math.min(100, (geniusMember.qualifyingStays / nextLevel.staysRequired) * 100)
    : 100;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-navy-dark">
      <div className="absolute inset-0">
        <Image
          src="https://picsum.photos/seed/royal-genius-hero-banner/1400/500"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-dark via-navy-dark/95 to-navy-dark/70" />
      </div>

      <div className="relative flex flex-col gap-8 p-8 sm:p-10 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <span className="mb-4 flex w-fit items-center gap-1.5 rounded-full border border-gold-light/40 bg-white/5 px-3 py-1 text-xs font-semibold text-gold-light">
            <Crown className="h-3.5 w-3.5" />
            Genius {currentLevel.name} Member
          </span>

          <h1 className="font-heading text-4xl font-bold text-white">
            Welcome back, {geniusMember.firstName}
          </h1>
          <p className="mt-3 text-sm text-white/75 sm:text-base">
            You&apos;re saving {currentLevel.discountPercent}% on Genius properties, plus free
            breakfast at over 4,200 stays worldwide.
          </p>

          {nextLevel && (
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>
                  {geniusMember.qualifyingStays} of {nextLevel.staysRequired} stays towards{" "}
                  {nextLevel.name}
                </span>
                <span className="font-medium text-gold-light">{staysToGo} stays to go</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold to-gold-light"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-white/60">
                Complete {staysToGo} more stays before {geniusMember.nextLevelDeadline} to unlock{" "}
                {nextLevel.name} permanently.
              </p>
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-8">
            <div>
              <p className="font-heading text-2xl font-bold text-white">
                {geniusMember.qualifyingStays}
              </p>
              <p className="text-xs text-white/60">qualifying stays</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">
                {geniusMember.currency}
                {geniusMember.totalSaved.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">saved so far</p>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-white">
                {geniusMember.rewardPoints.toLocaleString()}
              </p>
              <p className="text-xs text-white/60">reward points</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm shrink-0 rounded-2xl border border-gold-light/20 bg-gradient-to-br from-navy to-navy-dark p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-bold tracking-wide text-white">
              <Crown className="h-4 w-4 text-gold-light" />
              GENIUS
            </span>
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-[10px] font-bold text-navy-dark">
              {currentLevel.name.toUpperCase()}
            </span>
          </div>

          <p className="mt-8 font-mono text-lg tracking-widest text-white">
            {geniusMember.membershipNumber}
          </p>
          <p className="mt-1 text-sm font-semibold tracking-wide text-white/90">
            {geniusMember.fullName.toUpperCase()}
          </p>

          <div className="mt-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50">Member since</p>
              <p className="text-sm text-white/80">{geniusMember.memberSince}</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-gold-light">
              <Crown className="h-3.5 w-3.5" />
              ROYAL VACATION
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
