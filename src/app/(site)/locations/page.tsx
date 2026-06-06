import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { getLocations } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Locations",
};

export default async function LocationsPage() {
  const locations = await getLocations();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Find Us"
        title="Two Convenient Locations"
        description="Both Richmond locations are open 24 hours. Book online for Mon–Sat appointment slots, 8 AM to 6 PM."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {locations.map((location) => (
          <Card key={location.id} className="overflow-hidden p-0">
            <iframe
              title={`Map for ${location.name}`}
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`}
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-brand-navy">
                {location.name}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-red" />
                  {location.address}, {location.city}, {location.state}{" "}
                  {location.zip}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-brand-blue" />
                  {location.phone}
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                  {location.hours}
                </li>
              </ul>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  href={`/book?location=${location.id}`}
                  className="w-full sm:w-auto"
                >
                  Book at This Location
                </Button>
                <Button
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${location.address}, ${location.city}, ${location.state} ${location.zip}`,
                  )}`}
                  variant="secondary"
                  className="w-full sm:w-auto"
                >
                  Get Directions
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
