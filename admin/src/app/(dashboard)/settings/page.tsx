import {
  Bell,
  CreditCard,
  Globe,
  Globe2,
  Languages,
  Shield,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    icon: Globe,
    title: "Currency",
    description: "Default currency and amount formatting.",
    href: "/settings/currency",
  },
  {
    icon: Languages,
    title: "Language",
    description: "Default language and supported locales.",
    href: "/settings/language",
  },
  {
    icon: Globe2,
    title: "Countries",
    description: "Countries the business operates in.",
    href: "/settings/countries",
  },
  {
    icon: CreditCard,
    title: "Payment Gateways",
    description: "Payment providers and the default one.",
    href: "/settings/payment-gateways",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and in-app alert preferences.",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Admin roles, two-factor auth and audit log.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure your business preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {settingsSections.map(({ icon: Icon, title, description, href }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                <Icon className="size-5" />
              </span>
              <div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
              {href ? (
                <Button variant="outline" size="sm" render={<Link href={href} />}>
                  Configure
                </Button>
              ) : (
                <span>Coming soon.</span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
