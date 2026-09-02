import type { LucideIcon } from "lucide-react";
import Link from "next/link";

export function PlaceholderPanel({
  icon: Icon,
  title,
  body,
  cta,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-navy/5 text-navy">
        <Icon className="size-6" />
      </span>
      <h2 className="mt-3 font-heading text-lg font-bold text-navy">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-4 inline-block rounded-lg bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}
