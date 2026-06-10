import Link from "next/link";
import type { AnalyticsRange } from "@/lib/analytics";
import type { Location } from "@/lib/types";
import { cn } from "@/lib/utils";

type AnalyticsFiltersProps = {
  range: AnalyticsRange;
  locationId?: string;
  locations: Location[];
};

function buildHref(range: AnalyticsRange, locationId?: string) {
  const params = new URLSearchParams({ range });
  if (locationId) params.set("location", locationId);
  return `/admin/analytics?${params.toString()}`;
}

export function AnalyticsFilters({
  range,
  locationId,
  locations,
}: AnalyticsFiltersProps) {
  const ranges: { value: AnalyticsRange; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {ranges.map((item) => (
          <Link
            key={item.value}
            href={buildHref(item.value, locationId)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              range === item.value
                ? "bg-brand-navy text-white"
                : "bg-brand-sky text-brand-navy hover:bg-brand-blue hover:text-white",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-brand-navy">Location</span>
        <Link
          href={buildHref(range)}
          className={cn(
            "rounded-full px-3 py-2 text-sm font-medium transition-colors",
            !locationId
              ? "bg-brand-navy text-white"
              : "bg-white text-slate-600 ring-1 ring-blue-100 hover:bg-brand-light",
          )}
        >
          All
        </Link>
        {locations.map((location) => (
          <Link
            key={location.id}
            href={buildHref(range, location.id)}
            className={cn(
              "rounded-full px-3 py-2 text-sm font-medium transition-colors",
              locationId === location.id
                ? "bg-brand-navy text-white"
                : "bg-white text-slate-600 ring-1 ring-blue-100 hover:bg-brand-light",
            )}
          >
            {location.name.replace("Buzz Thru - ", "")}
          </Link>
        ))}
      </div>
    </div>
  );
}
