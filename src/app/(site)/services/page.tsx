import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  ServiceDisclaimer,
  ServicePackageCard,
  TieredPackageCard,
} from "@/components/ServicePackageCard";
import { SectionHeading } from "@/components/SectionHeading";
import {
  INSIDE_OUTSIDE_WASHES,
  MINI_DETAIL_PACKAGES,
  OUTSIDE_ONLY_WASHES,
  WASH_COMPARISON,
  WASH_EXTRAS,
} from "@/lib/services-catalog";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
};

function ComparisonCell({ value }: { value: boolean | string | false }) {
  if (value === true) {
    return <Check className="mx-auto h-4 w-4 text-brand-blue" aria-label="Included" />;
  }
  if (value === false) {
    return <Minus className="mx-auto h-4 w-4 text-slate-300" aria-label="Not included" />;
  }
  return <span className="text-xs text-slate-600">{value}</span>;
}

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading
        eyebrow="Our Washes"
        title="Services & Pricing"
        description="Hand-finished washes with soft microfiber drying. All listed wash prices include tax."
      />

      <section className="mt-12">
        <SectionHeading
          title="Inside & Outside Cleaning"
          description="Full-service washes with interior vacuum and wipe-down."
        />
        <Card className="mt-6 border-brand-blue/20 bg-brand-sky/40">
          <p className="text-sm font-semibold text-brand-navy">
            Would you like us to clean your trunk?
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Open your trunk for cleaning. We&apos;ll avoid this area if you need to
            leave something secure.
          </p>
        </Card>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {INSIDE_OUTSIDE_WASHES.map((pkg) => (
            <ServicePackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Outside Only Cleaning"
          description="Back by popular demand. Exterior wash packages when you only need the outside done."
        />
        <div className="mt-4 inline-flex rounded-full bg-brand-red/10 px-4 py-1 text-sm font-semibold text-brand-red">
          New outside-only lane
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {OUTSIDE_ONLY_WASHES.map((pkg) => (
            <ServicePackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Mini Detail"
          title="Inside Super Clean, Pro Wax & Combo"
          description="More thorough services than our regular wash. Pricing varies by vehicle size."
        />
        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          {MINI_DETAIL_PACKAGES.map((pkg) => (
            <TieredPackageCard key={pkg.name} pkg={pkg} />
          ))}
        </div>
        <ServiceDisclaimer className="mt-8" />
      </section>

      <section className="mt-16">
        <SectionHeading title="Wash Extras" description="Add-ons available at the wash." />
        <Card className="mt-8">
          <ul className="divide-y divide-blue-100">
            {WASH_EXTRAS.map((extra) => (
              <li
                key={extra.name}
                className="flex flex-col gap-1 py-4 text-sm first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-slate-700">{extra.name}</span>
                <span className="font-semibold text-brand-navy">{extra.price}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="mt-16">
        <SectionHeading
          title="Which hand-finished wash is best for you?"
          description="Compare our most popular wash packages at a glance."
        />
        <div className="mt-8 overflow-x-auto rounded-2xl border border-blue-100 bg-white shadow-sm">
          <table className="min-w-[880px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-blue-100 bg-brand-light">
                <th className="px-4 py-3 font-semibold text-brand-navy">Feature</th>
                {WASH_COMPARISON.headers.map((header, index) => (
                  <th key={header} className="px-3 py-3 text-center font-semibold text-brand-navy">
                    <span className="block">{header}</span>
                    <span className="mt-1 block text-brand-red">
                      {formatCurrency(WASH_COMPARISON.startingPrices[index])}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {WASH_COMPARISON.rows.map((row) => (
                <tr key={row.label} className="border-b border-blue-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                  {row.values.map((value, index) => (
                    <td key={`${row.label}-${index}`} className="px-3 py-3 text-center">
                      <ComparisonCell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-16 rounded-2xl bg-brand-sky p-8 text-center">
        <h3 className="text-xl font-semibold text-brand-navy">
          Found the wash you want?
        </h3>
        <p className="mt-2 text-slate-600">
          Book online for inside/outside and outside-only packages.
        </p>
        <Button href="/book" className="mt-6">
          Book a Wash
        </Button>
      </div>
    </div>
  );
}
