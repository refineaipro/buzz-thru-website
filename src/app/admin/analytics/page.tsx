import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { AnalyticsFilters } from "@/components/AnalyticsFilters";
import { getAdminUser } from "@/lib/auth";
import { getAnalyticsSummary, parseAnalyticsRange } from "@/lib/analytics";
import { getLocations } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/service";

type AnalyticsPageProps = {
  searchParams: Promise<{ range?: string; location?: string }>;
};

export default async function AdminAnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);
  const locationId = params.location;

  const [summary, locations] = await Promise.all([
    getAnalyticsSummary({ range, locationId }),
    getLocations(),
  ]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy">Analytics</h2>
      <p className="mt-2 text-sm text-slate-600">
        Booking and revenue overview for {summary.rangeLabel.toLowerCase()}.
      </p>

      {!isSupabaseConfigured() ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Connect Supabase to load live analytics. Placeholder mode has no booking
          history.
        </p>
      ) : null}

      <div className="mt-6">
        <AnalyticsFilters
          range={range}
          locationId={locationId}
          locations={locations}
        />
      </div>

      <div className="mt-8">
        <AnalyticsDashboard summary={summary} />
      </div>
    </div>
  );
}
