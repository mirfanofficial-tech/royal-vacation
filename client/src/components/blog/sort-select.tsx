"use client";

import { useRouter } from "next/navigation";

export function SortSelect({
  category,
  q,
  value,
}: {
  category?: string;
  q?: string;
  value: "latest" | "views";
}) {
  const router = useRouter();

  return (
    <select
      value={value}
      onChange={(event) => {
        const sp = new URLSearchParams();
        if (category) sp.set("category", category);
        if (q) sp.set("q", q);
        if (event.target.value !== "latest") sp.set("sort", event.target.value);
        const qs = sp.toString();
        router.push(qs ? `/blog?${qs}` : "/blog");
      }}
      className="rounded-full border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-navy outline-none"
    >
      <option value="latest">Sort: Latest</option>
      <option value="views">Sort: Most popular</option>
    </select>
  );
}
