"use client";

import Link from "next/link";
import { Boxes, Building2, Link2, Loader2, MapPinned, Plug } from "lucide-react";

import { useHotelPipelineStatsQuery, useHotelsQuery } from "@/lib/hotels";
import { ApiError } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export default function HotelMappingPage() {
  const { data: hotels = [], isLoading: hotelsLoading, error: hotelsError } = useHotelsQuery();
  const { data: stats, isLoading: statsLoading, error: statsError } = useHotelPipelineStatsQuery();

  const isLoading = hotelsLoading || statsLoading;
  const error = hotelsError || statsError;

  const statCards = [
    { label: "Mapped hotels", value: stats?.mapped_hotels ?? 0, icon: Building2 },
    { label: "Raw supplier records", value: stats?.raw_supplier_records ?? 0, icon: Boxes },
    { label: "Supplier links", value: stats?.supplier_links ?? 0, icon: Link2 },
    {
      label: "Suppliers reporting",
      value: Object.keys(stats?.raw_records_by_supplier ?? {}).length,
      icon: MapPinned,
    },
  ];

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Hotel Mapping</h1>
        <p className="text-sm text-muted-foreground">
          The Vervotech content &amp; mapping pipeline — one clean hotel record per property,
          resolved across every hotel supplier instead of listing duplicates. See{" "}
          <span className="font-mono">VERVOTECH_INTEGRATION.md</span> for the full plan.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm break-words text-destructive">
          {errorMessage(error, "Failed to load hotel mapping data.")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : hotels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-navy/10 text-navy">
              <Building2 className="size-6" />
            </span>
            <div>
              <p className="font-medium">No hotels mapped yet</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                This pipeline is schema-ready but hasn&apos;t run — it needs real credentials for
                Vervotech and the hotel suppliers first. Configure them under Modules, then the
                content &amp; mapping pull (Stage B, steps 12/13/15) populates this list.
              </p>
            </div>
            <Button variant="outline" size="sm" render={<Link href="/modules" />}>
              <Plug data-icon="inline-start" />
              Go to Modules
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id}>
              <CardContent className="flex flex-col gap-3 p-5">
                <div>
                  <p className="font-semibold">{hotel.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[hotel.city, hotel.country].filter(Boolean).join(", ") || "Location unknown"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {hotel.star_rating != null && (
                    <Badge variant="outline">{hotel.star_rating}★</Badge>
                  )}
                  {hotel.supplier_links.map((link) => (
                    <Badge key={`${link.supplier}-${link.supplier_hotel_id}`} variant="secondary">
                      {link.supplier}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  vervotech_id: <span className="font-mono">{hotel.vervotech_id}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stats && Object.keys(stats.raw_records_by_supplier).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Raw records by supplier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(stats.raw_records_by_supplier).map(([supplier, count]) => (
              <div key={supplier} className="flex items-center justify-between text-sm">
                <span className="font-mono text-muted-foreground">{supplier}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
