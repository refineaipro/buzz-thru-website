import type { Metadata } from "next";
import { BookingWizard } from "@/components/BookingWizard";
import { SectionHeading } from "@/components/SectionHeading";
import { getLocations, getServices } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Book a Wash",
};

type BookPageProps = {
  searchParams: Promise<{ location?: string; service?: string }>;
};

export default async function BookPage({ searchParams }: BookPageProps) {
  const params = await searchParams;
  const [locations, services] = await Promise.all([
    getLocations(),
    getServices(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Online Booking"
        title="Book a Wash"
        description="Choose your location, service, and time. Appointments must be booked at least 24 hours in advance."
      />
      <div className="mt-10">
        <BookingWizard
          locations={locations}
          services={services}
          initialLocationId={params.location}
          initialServiceSlug={params.service}
        />
      </div>
    </div>
  );
}
