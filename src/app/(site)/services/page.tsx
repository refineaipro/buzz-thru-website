import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { getServices } from "@/lib/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Our Washes"
        title="Services & Pricing"
        description="All prices include tax. Final pricing will be confirmed by the client."
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
                <p className="mt-3 text-xs text-slate-500">
                  ~{service.duration_minutes} minutes
                </p>
              </div>
              <p className="text-2xl font-bold text-brand-red">
                {formatCurrency(service.price)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-brand-sky p-8 text-center">
        <h3 className="text-xl font-semibold text-brand-navy">
          Found the wash you want?
        </h3>
        <p className="mt-2 text-slate-600">
          Book online and skip the line.
        </p>
        <Button href="/book" className="mt-6">
          Book a Wash
        </Button>
      </div>
    </div>
  );
}
