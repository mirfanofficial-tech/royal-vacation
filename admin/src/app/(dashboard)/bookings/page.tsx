import { CalendarCheck } from "lucide-react";

import { mockBookings, type BookingStatus } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const statusVariant: Record<BookingStatus, "default" | "secondary" | "outline" | "destructive"> = {
  confirmed: "default",
  pending: "secondary",
  completed: "outline",
  cancelled: "destructive",
};

export default function BookingsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Bookings</h1>
        <p className="text-sm text-muted-foreground">
          Track reservations across all properties.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All bookings</CardTitle>
          <CardDescription>
            {mockBookings.length} bookings in total.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Booking</th>
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Dates</th>
                  <th className="px-6 py-3 font-medium">Guests</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-navy/10 text-navy">
                          <CalendarCheck className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium">{booking.id}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {booking.property}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">{booking.guest}</td>
                    <td className="px-6 py-3">
                      {booking.checkIn} &rarr; {booking.checkOut}
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({booking.nights} nights)
                      </span>
                    </td>
                    <td className="px-6 py-3">{booking.guests}</td>
                    <td className="px-6 py-3 font-medium">
                      {booking.currency} {booking.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <Badge variant={statusVariant[booking.status]}>
                        {booking.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="sm">
                        View
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
