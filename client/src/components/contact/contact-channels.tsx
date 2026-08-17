import Link from "next/link";
import { Building2, ChevronRight, Info, Mail, MessageCircle, Newspaper, Phone } from "lucide-react";

const channels = [
  {
    id: "email",
    icon: Mail,
    title: "Email us",
    value: "stay@royalvacation.com",
    href: "mailto:stay@royalvacation.com",
    hint: "Replies in under 2 hours",
  },
  {
    id: "chat",
    icon: MessageCircle,
    title: "Live chat",
    value: "Start a conversation",
    href: "#",
    hint: "Agents online now",
    online: true,
  },
  {
    id: "groups",
    icon: Building2,
    title: "Corporate & groups",
    value: "groups@royalvacation.com",
    href: "mailto:groups@royalvacation.com",
    hint: "10+ rooms or 8+ travellers",
  },
  {
    id: "press",
    icon: Newspaper,
    title: "Press & partnerships",
    value: "press@royalvacation.com",
    href: "mailto:press@royalvacation.com",
    hint: "Media kit available",
  },
];

export function ContactChannels() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-gradient-to-br from-navy-dark to-navy p-6">
        <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
          Priority line
        </span>
        <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-white">
          <Phone className="h-5 w-5 text-gold-light" />
          +971 4 555 0199
        </p>
        <p className="mt-1 text-sm text-white/70">Open now · 24 hours, 7 days</p>

        <a
          href="https://wa.me/97145550199"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-navy-dark hover:bg-gold-light"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-white">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            href={channel.href}
            className="group flex items-center gap-3 px-5 py-4 hover:bg-muted/60"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
              <channel.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                {channel.title}
                {channel.online && (
                  <span className="flex items-center gap-1 text-xs font-medium text-rating">
                    <span className="h-1.5 w-1.5 rounded-full bg-rating" />
                    Online
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">{channel.value}</p>
              <p className="text-xs text-muted-foreground">{channel.hint}</p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-gold/10 px-4 py-3.5 text-sm text-navy">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
        <p>
          Have your booking reference (RV-000000) ready — it&apos;s on your confirmation email
          and speeds things up a lot.
        </p>
      </div>
    </div>
  );
}
