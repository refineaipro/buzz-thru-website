import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  Clock,
  Hand,
  MapPin,
  Phone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { getLocations, getServices } from "@/lib/queries";
import { BUSINESS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const ADVANTAGES = [
  {
    icon: Hand,
    title: "Hand-washed with care",
    description:
      "Real people wash your car, not a conveyor of brushes and rollers. Skip the tunnel scratches and swirl marks on your paint.",
  },
  {
    icon: CalendarCheck,
    title: "Your time, reserved",
    description:
      "Book a 30-minute slot up to a week ahead. No guessing how long the line will be or circling a packed lot at peak hours.",
  },
  {
    icon: CircleDollarSign,
    title: "One price, no surprises",
    description:
      "What you see online is what you pay, tax included. No last-minute upsells or premium add-ons at the pay station.",
  },
  {
    icon: MapPin,
    title: "Three spots, open 24 hours",
    description:
      "Hull Street, Midlothian Turnpike, or Broad Rock Blvd. Drive-through convenience in Richmond whenever you need a wash.",
  },
] as const;

export default async function HomePage() {
  const [locations, services] = await Promise.all([
    getLocations(),
    getServices(),
  ]);

  return (
    <>
      <section className="relative overflow-hidden bg-brand-light">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
              Richmond&apos;s favorite car wash
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
              Drive in dirty.
              <span className="block text-brand-red">Buzz out clean.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              {BUSINESS.tagline} Book your wash online in minutes. Pick your
              location, choose a service, and roll up when it&apos;s your time.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/book">Book a Wash</Button>
              <Button href="/services" variant="secondary">
                View Services
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-brand-navy text-white">
              <Sparkles className="h-8 w-8 text-brand-blue" />
              <h3 className="mt-4 text-lg font-semibold">Fast & Friendly</h3>
              <p className="mt-2 text-sm text-blue-100">
                30-minute appointment slots keep your wait predictable.
              </p>
            </Card>
            <Card>
              <Clock className="h-8 w-8 text-brand-blue" />
              <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                Book 24hrs Ahead
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Reserve up to 7 days out. No surprises, tax included.
              </p>
            </Card>
            <Card className="sm:col-span-2">
              <MapPin className="h-8 w-8 text-brand-red" />
              <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                Three Locations
              </h3>
              <ul className="mt-4 space-y-3">
                {locations.map((location) => (
                  <li key={location.id} className="text-sm">
                    <p className="font-semibold text-brand-navy">
                      {location.name.replace(/^Buzz Thru - /, "")}
                    </p>
                    <p className="mt-0.5 text-slate-600">
                      {location.address}, {location.city}, {location.state}{" "}
                      {location.zip}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4 text-brand-blue" />
                {BUSINESS.phone}
              </p>
              <Link
                href="/locations"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-navy transition-opacity hover:opacity-80"
              >
                View locations & directions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Our Services"
          title="Washes for every budget"
          description="Hand-finished washes with soft microfiber drying. All listed prices include tax."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-brand-navy">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {service.description}
                  </p>
                </div>
                <p className="text-2xl font-bold text-brand-red">
                  {formatCurrency(service.price)}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-brand-light px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Why Buzz Thru"
            title="More than a drive-through tunnel"
            description="Smaller scale, personal service, and a wash your car's finish will thank you for."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {ADVANTAGES.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <Icon className="h-8 w-8 text-brand-blue" />
                <h3 className="mt-4 text-lg font-semibold text-brand-navy">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-navy px-4 py-16 text-white sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready for a spotless ride?
          </h2>
          <p className="max-w-2xl text-blue-100">
            Pick your location, choose a time, and pay online. Show your QR code
            or phone number when you arrive.
          </p>
          <Button href="/book" className="bg-brand-red">
            Book Your Wash Now
          </Button>
        </div>
      </section>
    </>
  );
}
