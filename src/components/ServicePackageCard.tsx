import Link from "next/link";
import { Check } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { WashPackage } from "@/lib/services-catalog";
import { formatCurrency } from "@/lib/utils";

export function ServicePackageCard({ pkg }: { pkg: WashPackage }) {
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-xl font-semibold text-brand-navy">{pkg.name}</h3>
        <p className="shrink-0 text-2xl font-bold text-brand-red">
          {formatCurrency(pkg.price)}
        </p>
      </div>

      <ul className="mt-5 flex-1 space-y-2">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {pkg.bookable ? (
        <Button href={`/book?service=${pkg.slug}`} className="mt-6 w-full sm:w-auto">
          Book This Wash
        </Button>
      ) : null}
    </Card>
  );
}

export function ServiceDisclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`}>
      <span className="font-semibold">Please note:</span> Our services will not remove
      pet hair, human or pet contaminants, spilled sauces, or broken glass. We do not
      spray or clean navigation screens or displays due to the risk of damage.
    </p>
  );
}

export function TieredPackageCard({ pkg }: { pkg: import("@/lib/services-catalog").TieredPackage }) {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-brand-navy">{pkg.name}</h3>
      {pkg.startingAt ? (
        <p className="mt-2 text-2xl font-bold text-brand-red">
          Starting at {formatCurrency(pkg.startingAt)}
        </p>
      ) : null}
      <p className="mt-3 text-sm text-slate-600">{pkg.description}</p>

      {pkg.outsideFeatures?.length ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-brand-navy">Outside features</h4>
          <ul className="mt-2 space-y-2">
            {pkg.outsideFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pkg.insideFeatures?.length ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-brand-navy">
            {pkg.outsideFeatures?.length ? "Inside features" : "Features"}
          </h4>
          <ul className="mt-2 space-y-2">
            {pkg.insideFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pkg.tiers.length ? (
        <div className="mt-5">
          <h4 className="text-sm font-semibold text-brand-navy">Pricing</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {pkg.tiers.map((tier) => (
              <li key={tier.label} className="flex justify-between gap-4">
                <span>{tier.label}</span>
                <span className="font-semibold text-brand-navy">
                  {formatCurrency(tier.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {pkg.addOns?.length ? (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-brand-navy">Add-ons</h4>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {pkg.addOns.map((addOn) => (
              <li key={addOn.label} className="flex justify-between gap-4">
                <span>{addOn.label}</span>
                <span className="font-semibold text-brand-navy">
                  +{formatCurrency(addOn.price)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-slate-500">{pkg.timing}</p>

      <p className="mt-4 text-sm text-slate-600">
        Ask at the location or{" "}
        <Link href="/contact" className="font-semibold text-brand-navy hover:opacity-80">
          contact us
        </Link>{" "}
        to schedule detail packages.
      </p>
    </Card>
  );
}
