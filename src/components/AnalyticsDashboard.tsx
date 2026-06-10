import { Card } from "@/components/Card";
import { getBookingStatusLabel } from "@/lib/booking-status";
import type { AnalyticsSummary } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

type AnalyticsDashboardProps = {
  summary: AnalyticsSummary;
};

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold text-brand-navy">{value}</p>
      {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
    </Card>
  );
}

function BarChart({
  items,
  valueKey,
  labelKey,
  formatValue,
}: {
  items: { [key: string]: string | number }[];
  valueKey: string;
  labelKey: string;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...items.map((item) => Number(item[valueKey])), 1);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No data for this period.</p>
      ) : (
        items.map((item) => {
          const value = Number(item[valueKey]);
          const width = Math.max((value / max) * 100, value > 0 ? 8 : 0);

          return (
            <div key={String(item[labelKey]) + String(item[valueKey])}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-brand-navy">
                  {String(item[labelKey])}
                </span>
                <span className="text-slate-600">
                  {formatValue ? formatValue(value) : value}
                </span>
              </div>
              <div className="h-3 rounded-full bg-brand-light">
                <div
                  className="h-3 rounded-full bg-brand-blue transition-all duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export function AnalyticsDashboard({ summary }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(summary.revenue)}
          hint={`${summary.rangeLabel} · paid bookings`}
        />
        <MetricCard
          label="Bookings"
          value={String(summary.bookingCount)}
          hint="Paid and refunded"
        />
        <MetricCard
          label="Refunds"
          value={String(summary.refundCount)}
          hint={
            summary.refundedAmount > 0
              ? `${formatCurrency(summary.refundedAmount)} returned`
              : "No refunds in this period"
          }
        />
        <MetricCard
          label="Completion rate"
          value={`${summary.completionRate}%`}
          hint="Completed washes after check-in"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-brand-navy">Revenue by location</h3>
          <div className="mt-6">
            <BarChart
              items={summary.revenueByLocation.map((item) => ({
                label: item.name.replace("Buzz Thru - ", ""),
                value: item.revenue,
              }))}
              labelKey="label"
              valueKey="value"
              formatValue={(value) => formatCurrency(value)}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-brand-navy">Popular services</h3>
          <div className="mt-6">
            <BarChart
              items={summary.servicePopularity.map((item) => ({
                label: item.name,
                value: item.count,
              }))}
              labelKey="label"
              valueKey="value"
              formatValue={(value) => `${value} bookings`}
            />
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-brand-navy">Status breakdown</h3>
          <div className="mt-6">
            <BarChart
              items={summary.statusBreakdown.map((item) => ({
                label: getBookingStatusLabel(item.status),
                value: item.count,
              }))}
              labelKey="label"
              valueKey="value"
            />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-brand-navy">Recent refunds</h3>
        {summary.recentRefunds.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No refunds in this period.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100 text-slate-600">
                  <th className="px-2 py-3 font-medium">Customer</th>
                  <th className="px-2 py-3 font-medium">Amount</th>
                  <th className="px-2 py-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentRefunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-blue-50">
                    <td className="px-2 py-3 font-medium text-brand-navy">
                      {refund.customerName}
                    </td>
                    <td className="px-2 py-3 text-brand-red">
                      {formatCurrency(refund.amount)}
                    </td>
                    <td className="px-2 py-3 text-slate-600">{refund.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
