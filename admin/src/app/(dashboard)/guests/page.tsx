import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockGuests } from "@/lib/mock-data";

export default function GuestsPage() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-navy">Guests</h1>
        <p className="text-sm text-muted-foreground">
          Customer accounts and booking history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All guests</CardTitle>
          <CardDescription>
            {mockGuests.length} guests in total.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Guest</th>
                  <th className="px-6 py-3 font-medium">Bookings</th>
                  <th className="px-6 py-3 font-medium">Total spent</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-muted/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-navy/10 text-xs font-semibold text-navy">
                            {guest.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{guest.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {guest.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">{guest.bookings}</td>
                    <td className="px-6 py-3 font-medium">
                      AED {guest.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {guest.joined}
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
