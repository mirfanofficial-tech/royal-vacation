import { Building2, Star } from "lucide-react";

import { mockProperties, type PropertyStatus } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant: Record<PropertyStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "outline",
  paused: "secondary",
};

export default function PropertiesPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Properties</h1>
          <p className="text-sm text-muted-foreground">
            Manage your vacation rental inventory.
          </p>
        </div>
        <Button>Add property</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All properties</CardTitle>
          <CardDescription>
            {mockProperties.length} properties in total.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Type</th>
                  <th className="px-6 py-3 font-medium">Rate</th>
                  <th className="px-6 py-3 font-medium">Rating</th>
                  <th className="px-6 py-3 font-medium">Bookings</th>
                  <th className="px-6 py-3 font-medium">Revenue</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
                          <Building2 className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{property.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {property.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {property.type}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {property.currency} {property.pricePerNight.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground">
                        {" "}
                        /night
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Star className="size-3 fill-gold text-gold" />
                        {property.rating}
                      </span>
                    </td>
                    <td className="px-6 py-3">{property.bookings}</td>
                    <td className="px-6 py-3 font-medium">
                      {property.currency} {property.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[property.status]}>
                        {property.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
