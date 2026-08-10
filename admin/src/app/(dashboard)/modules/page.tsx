"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Boxes,
  Car,
  Compass,
  Plane,
  Plug,
  Search,
  Settings2,
  ShieldCheck,
  Ship,
  Sparkles,
  Star,
} from "lucide-react";

import { useModules } from "@/lib/modules";
import type { ThirdPartyModule } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const statusVariant = {
  active: "default",
  inactive: "outline",
} as const;

const environmentVariant = {
  development: "outline",
  staging: "secondary",
  production: "default",
} as const;

function categoryIcon(category: string) {
  const key = category.toLowerCase();
  if (key.includes("ferries")) return Ship;
  if (key.includes("flight")) return Plane;
  if (key.includes("tour")) return Compass;
  if (key.includes("transfer")) return Car;
  if (key.includes("car")) return Car;
  if (key.includes("insurance")) return ShieldCheck;
  return Plug;
}

function credentialState(module: ThirdPartyModule): {
  complete: boolean;
  label: string;
} {
  const required = module.credentialFields.filter((field) => field.required);
  const missing = required.filter((field) => !field.value.trim());
  if (required.length === 0)
    return { complete: true, label: "No credentials required" };
  if (missing.length === 0)
    return { complete: true, label: `${required.length} credentials set` };
  return {
    complete: false,
    label: `${missing.length} of ${required.length} credentials missing`,
  };
}

export default function ModulesPage() {
  const { modules } = useModules();
  const [query, setQuery] = useState("");

  const filtered = modules.filter((module) =>
    `${module.name} ${module.category} ${module.provider}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const active = modules.filter((m) => m.status === "active").length;
  const aiEnabled = modules.filter((m) => m.aiEnabled).length;
  const inProduction = modules.filter((m) => m.environment === "production")
    .length;

  const stats = [
    { label: "Total modules", value: modules.length, icon: Boxes },
    { label: "Active", value: active, icon: Plug },
    { label: "AI enabled", value: aiEnabled, icon: Sparkles },
    { label: "In production", value: inProduction, icon: Star },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Modules</h1>
        <p className="text-sm text-muted-foreground">
          Third-party API providers powering properties, ferries, flights,
          transfers and more.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search modules…"
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((module) => {
          const Icon = categoryIcon(module.category);
          const credentials = credentialState(module);
          return (
            <Card key={module.id}>
              <CardContent className="flex flex-col gap-4 p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{module.name}</p>
                      {module.aiEnabled && (
                        <Badge variant="outline" className="text-gold">
                          <Sparkles data-icon="inline-start" className="size-3" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {module.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant={statusVariant[module.status]}>
                    {module.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={environmentVariant[module.environment]}>
                    {module.environment}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ID: {module.moduleId} · {module.provider}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      credentials.complete
                        ? "text-emerald-600"
                        : "text-amber-600"
                    )}
                  >
                    {credentials.label}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/modules/${module.id}`} />}
                  >
                    <Settings2 data-icon="inline-start" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card className="lg:col-span-2 xl:col-span-3">
            <CardContent className="px-6 py-12 text-center text-sm text-muted-foreground">
              No modules match your search.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
