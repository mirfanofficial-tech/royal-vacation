import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  CreditCard,
  FileText,
  MessageSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

import { AccountPage } from "@/components/account/account-page";
import { PlaceholderPanel } from "@/components/account/placeholder-panel";

// Account-namespaced aliases for pages that live elsewhere.
const REDIRECTS: Record<string, string> = {
  saved: "/wishlist",
  help: "/contact",
};

type Topic = {
  title: string;
  icon: LucideIcon;
  body: string;
  cta?: { label: string; href: string };
};

const TOPICS: Record<string, Topic> = {
  travellers: {
    title: "Other travellers",
    icon: Users,
    body: "Save the details of people you travel with to book faster next time. No saved travellers yet.",
  },
  "payment-methods": {
    title: "Payment methods",
    icon: CreditCard,
    body: "Cards you save at checkout will appear here for one-tap payments. Nothing saved yet.",
  },
  reviews: {
    title: "My reviews",
    icon: MessageSquare,
    body: "Reviews you leave after a stay show up here. You haven't written any reviews yet.",
    cta: { label: "View your trips", href: "/bookings" },
  },
  safety: {
    title: "Safety resource centre",
    icon: ShieldCheck,
    body: "Travel safety tips and emergency contacts. Our team is available 24/7 for urgent issues.",
    cta: { label: "Contact customer service", href: "/contact" },
  },
  privacy: {
    title: "Privacy and data management",
    icon: ShieldCheck,
    body: "Request a copy of your data or ask us to delete your account. Contact us to start a request.",
    cta: { label: "Contact customer service", href: "/contact" },
  },
  "content-guidelines": {
    title: "Content guidelines",
    icon: FileText,
    body: "The rules for reviews, photos and messages on Royal Vacation. Be honest, relevant and respectful.",
  },
};

export function generateStaticParams() {
  return [
    ...Object.keys(TOPICS).map((topic) => ({ topic })),
    ...Object.keys(REDIRECTS).map((topic) => ({ topic })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ topic: string }>;
}): Promise<Metadata> {
  const { topic } = await params;
  const t = TOPICS[topic];
  return { title: t ? `${t.title} | Royal Vacation` : "My account | Royal Vacation" };
}

export default async function AccountTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic } = await params;
  if (REDIRECTS[topic]) redirect(REDIRECTS[topic]);
  const t = TOPICS[topic];
  if (!t) notFound();

  return (
    <AccountPage title={t.title} crumbs={[{ label: t.title }]}>
      <PlaceholderPanel icon={t.icon} title={t.title} body={t.body} cta={t.cta} />
    </AccountPage>
  );
}
