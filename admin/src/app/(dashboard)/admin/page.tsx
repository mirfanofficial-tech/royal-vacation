import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Luggage,
  ShieldCheck,
  Truck,
  UserCog,
} from "lucide-react";

import { PermissionGuard } from "@/components/permission-guard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const sections = [
  {
    href: "/admin/users/travelers",
    icon: Luggage,
    title: "Travelers",
    description: "Customer accounts used to browse and book stays.",
    accent: "bg-navy/5 text-navy",
  },
  {
    href: "/admin/users/property-agents",
    icon: Building2,
    title: "Property Agents",
    description: "Partner accounts that list and manage properties.",
    accent: "bg-gold/10 text-gold",
  },
  {
    href: "/admin/users/employees",
    icon: Briefcase,
    title: "Employees",
    description: "Staff accounts running day-to-day operations and content.",
    accent: "bg-sky-600/10 text-sky-600",
  },
  {
    href: "/admin/users/suppliers",
    icon: Truck,
    title: "Suppliers",
    description: "Third-party inventory and service supplier accounts.",
    accent: "bg-violet-600/10 text-violet-600",
  },
  {
    href: "/admin/users/admins",
    icon: UserCog,
    title: "Admin Users",
    description: "Platform administrators with full admin-panel access.",
    accent: "bg-navy/5 text-navy",
  },
  {
    href: "/admin/roles",
    icon: ShieldCheck,
    title: "Roles & Permissions",
    description:
      "Define roles and fine-grained permissions across every module.",
    accent: "bg-rating/10 text-rating",
  },
  {
    href: "/admin/partners",
    icon: Building2,
    title: "Partners",
    description: "Review and verify property agents registered on the platform.",
    accent: "bg-gold/10 text-gold",
  },
];

export default function AdministrationHubPage() {
  return (
    <PermissionGuard module="roles">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Administration</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin users, roles and access control.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sections.map(({ href, icon: Icon, title, description, accent }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full transition-colors group-hover:border-navy/30 group-hover:bg-muted/30">
                <CardHeader>
                  <span
                    className={`flex size-10 items-center justify-center rounded-xl ${accent}`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <CardTitle className="mt-2 flex items-center justify-between gap-2">
                    {title}
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-navy" />
                  </CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-xs font-medium text-navy">
                    Open section
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PermissionGuard>
  );
}
