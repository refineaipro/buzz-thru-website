import type { Metadata } from "next";
import { Mail, Truck } from "lucide-react";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { BUSINESS } from "@/lib/constants";
import { FLEET_INFO } from "@/lib/fleet";

export const metadata: Metadata = {
  title: "Fleet Washing",
  description:
    "Fleet car wash services for Richmond businesses. Contact Buzz Thru for pricing and custom plans.",
};

export default function FleetPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="For Business"
        title={FLEET_INFO.title}
        description={FLEET_INFO.description}
        descriptionClassName="max-w-none text-lg"
      />

      <Card className="mt-10 border-brand-navy/10 bg-brand-sky/40">
        <div className="flex items-start gap-4">
          <Truck className="mt-1 h-8 w-8 shrink-0 text-brand-blue" />
          <div>
            <h2 className="text-lg font-semibold text-brand-navy">
              Custom fleet plans available
            </h2>
            <p className="mt-2 text-sm text-slate-600">{FLEET_INFO.cta}</p>
            <a
              href={`mailto:${BUSINESS.email}?subject=Fleet%20Washing%20Inquiry`}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-red px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email {BUSINESS.email}
            </a>
          </div>
        </div>
      </Card>

      <section className="mt-12">
        <SectionHeading title="Why Buzz Thru for your fleet?" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {FLEET_INFO.highlights.map((item) => (
            <li
              key={item}
              className="rounded-2xl border border-blue-100 bg-white p-5 text-sm text-slate-600"
            >
              {item}
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-10 text-sm text-slate-600">
        Prefer to call? Reach us at{" "}
        <a
          href={`tel:${BUSINESS.phone.replace(/\D/g, "")}`}
          className="font-semibold text-brand-navy hover:opacity-80"
        >
          {BUSINESS.phone}
        </a>
        .
      </p>
    </div>
  );
}
