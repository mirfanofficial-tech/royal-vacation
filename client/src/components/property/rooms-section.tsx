import { RoomCard } from "@/components/property/room-card";
import type { RoomOption } from "@/lib/property-detail-mock-data";

export function RoomsSection({
  rooms,
  currency,
  propertyId,
}: {
  rooms: RoomOption[];
  currency: string;
  propertyId: string;
}) {
  return (
    <section id="rooms" className="scroll-mt-36">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">Rooms &amp; Rates</h2>
        <a href="#rooms" className="text-sm font-semibold text-gold hover:underline">
          View all rooms
        </a>
      </div>
      <div className="flex flex-col gap-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} currency={currency} propertyId={propertyId} />
        ))}
      </div>
    </section>
  );
}
