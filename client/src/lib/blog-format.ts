export function formatBlogDate(iso: string, style: "short" | "long" = "short") {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: style,
    day: "numeric",
  });
}

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

const AVATAR_PALETTE = [
  "bg-navy text-white",
  "bg-gold text-navy-dark",
  "bg-emerald-600 text-white",
  "bg-rose-500 text-white",
  "bg-sky-600 text-white",
  "bg-amber-600 text-white",
  "bg-violet-600 text-white",
  "bg-teal-600 text-white",
];

export function getAvatarColorClass(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
