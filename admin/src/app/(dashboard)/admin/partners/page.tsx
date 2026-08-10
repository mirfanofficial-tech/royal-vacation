"use client";

import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Building2,
  Loader2,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import { ApiError } from "@/lib/api";
import { usePartnersQuery, useVerifyPartner } from "@/lib/partners";
import { usePermissions } from "@/lib/roles";
import { PermissionGuard } from "@/components/permission-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const selectClass =
  "h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const accountStatusBadge: Record<string, string> = {
  active: "bg-rating/10 text-rating",
  pending: "bg-amber-600/10 text-amber-600",
  invited: "bg-amber-600/10 text-amber-600",
  inactive: "bg-muted text-muted-foreground",
  suspended: "bg-destructive/10 text-destructive",
  deleted: "bg-destructive/10 text-destructive",
};

function initialsOf(label: string) {
  return label
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PartnersPage() {
  const [query, setQuery] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState<"all" | "verified" | "unverified">("all");
  const { can } = usePermissions();
  const { data: partners = [], isLoading } = usePartnersQuery({
    search: query || undefined,
    verified: verifiedFilter === "all" ? undefined : verifiedFilter === "verified",
  });
  const verifyPartner = useVerifyPartner();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const verified = partners.filter((p) => p.is_verified).length;
    const pending = partners.filter((p) => p.partner_profile_id && !p.is_verified).length;
    const active = partners.filter((p) => p.account_status === "active").length;
    return [
      { label: "Total partners", value: partners.length, icon: Building2 },
      { label: "Verified", value: verified, icon: ShieldCheck },
      { label: "Pending verification", value: pending, icon: UserCheck },
      { label: "Active accounts", value: active, icon: BadgeCheck },
    ];
  }, [partners]);

  async function handleVerify(userId: string, label: string) {
    try {
      await verifyPartner.mutateAsync(userId);
      setError("");
      setNotice(`${label} is now verified.`);
      window.setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't verify this partner.");
    }
  }

  return (
    <PermissionGuard module="roles">
      <div className="space-y-6 p-6 lg:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Partners</h1>
          <p className="text-sm text-muted-foreground">
            Property agents registered on the platform and their verification status.
          </p>
        </div>

        {notice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
            <ShieldCheck className="size-4 shrink-0" />
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <span className="flex size-8 items-center justify-center rounded-lg bg-navy/5 text-navy">
                  <Icon className="size-4" />
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>All partners</CardTitle>
                <CardDescription>{partners.length} partner account(s).</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by business name or email…"
                    aria-label="Search partners"
                    className="h-8 w-64 pl-8"
                  />
                </div>
                <select
                  value={verifiedFilter}
                  onChange={(e) =>
                    setVerifiedFilter(e.target.value as "all" | "verified" | "unverified")
                  }
                  className={selectClass}
                  aria-label="Filter by verification"
                >
                  <option value="all">All partners</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Not verified</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Partner</th>
                    <th className="px-6 py-3 font-medium">Business</th>
                    <th className="px-6 py-3 font-medium">Account status</th>
                    <th className="px-6 py-3 font-medium">Verification</th>
                    <th className="px-6 py-3 font-medium">Joined</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                      </td>
                    </tr>
                  )}
                  {!isLoading &&
                    partners.map((partner) => {
                      const label =
                        [partner.first_name, partner.last_name].filter(Boolean).join(" ") ||
                        partner.email;
                      return (
                        <tr key={partner.user_id} className="hover:bg-muted/40">
                          <td className="max-w-md px-6 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                                {initialsOf(label)}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{label}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {partner.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            {partner.business_name ?? (
                              <span className="text-xs text-muted-foreground">
                                No business profile yet
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <Badge
                              className={cn(
                                "rounded-full capitalize",
                                accountStatusBadge[partner.account_status] ??
                                  "bg-muted text-muted-foreground"
                              )}
                            >
                              {partner.account_status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3">
                            {partner.partner_profile_id ? (
                              <Badge
                                className={cn(
                                  "rounded-full capitalize",
                                  partner.is_verified
                                    ? "bg-rating/10 text-rating"
                                    : "bg-amber-600/10 text-amber-600"
                                )}
                              >
                                {partner.is_verified ? "Verified" : partner.verification_status}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {new Date(partner.created_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3 text-right">
                            {can("roles", "edit") &&
                              partner.partner_profile_id &&
                              !partner.is_verified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={verifyPartner.isPending}
                                  onClick={() => handleVerify(partner.user_id, label)}
                                >
                                  <ShieldCheck data-icon="inline-start" />
                                  Verify
                                </Button>
                              )}
                          </td>
                        </tr>
                      );
                    })}
                  {!isLoading && partners.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">
                        No partners match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}
