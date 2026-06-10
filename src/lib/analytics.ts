import { startOfDay, subDays } from "date-fns";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";
import { formatRefundReason } from "@/lib/refund-reasons";
import type { Booking } from "@/lib/types";

export type AnalyticsRange = "today" | "7d" | "30d";

export type AnalyticsFilters = {
  range?: string;
  locationId?: string;
};

export type AnalyticsSummary = {
  range: AnalyticsRange;
  rangeLabel: string;
  revenue: number;
  bookingCount: number;
  refundCount: number;
  refundedAmount: number;
  completionRate: number;
  revenueByLocation: { locationId: string; name: string; revenue: number; count: number }[];
  servicePopularity: { serviceId: string; name: string; count: number; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  recentRefunds: {
    id: string;
    customerName: string;
    amount: number;
    reason: string;
    refundedAt: string;
  }[];
};

const RANGE_LABELS: Record<AnalyticsRange, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
};

export function parseAnalyticsRange(value?: string): AnalyticsRange {
  if (value === "today" || value === "30d") return value;
  return "7d";
}

export function getRangeBounds(range: AnalyticsRange) {
  const end = new Date();
  let start = startOfDay(end);

  if (range === "7d") {
    start = startOfDay(subDays(end, 6));
  } else if (range === "30d") {
    start = startOfDay(subDays(end, 29));
  }

  return { start, end };
}

function emptySummary(range: AnalyticsRange): AnalyticsSummary {
  return {
    range,
    rangeLabel: RANGE_LABELS[range],
    revenue: 0,
    bookingCount: 0,
    refundCount: 0,
    refundedAmount: 0,
    completionRate: 0,
    revenueByLocation: [],
    servicePopularity: [],
    statusBreakdown: [],
    recentRefunds: [],
  };
}

export async function getAnalyticsSummary(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsSummary> {
  const range = parseAnalyticsRange(filters.range);
  const { start, end } = getRangeBounds(range);

  if (!isSupabaseConfigured()) {
    return emptySummary(range);
  }

  const supabase = createServiceClient();
  let query = supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .in("payment_status", ["paid", "refunded"])
    .order("created_at", { ascending: false });

  if (filters.locationId) {
    query = query.eq("location_id", filters.locationId);
  }

  const { data, error } = await query;
  if (error) throw error;

  const startIso = start.toISOString();
  const endIso = end.toISOString();

  const bookings = ((data ?? []) as Booking[]).filter((booking) => {
    const eventAt =
      booking.payment_status === "refunded"
        ? booking.refunded_at ?? booking.updated_at
        : booking.paid_at ?? booking.created_at;
    return eventAt >= startIso && eventAt <= endIso;
  });
  const paidBookings = bookings.filter((booking) => booking.payment_status === "paid");
  const refundedBookings = bookings.filter(
    (booking) => booking.payment_status === "refunded",
  );

  const revenue = paidBookings.reduce(
    (sum, booking) => sum + Number(booking.amount),
    0,
  );
  const refundedAmount = refundedBookings.reduce(
    (sum, booking) => sum + Number(booking.amount),
    0,
  );

  const checkedInOrCompleted = paidBookings.filter((booking) =>
    ["checked_in", "completed"].includes(booking.status),
  );
  const completedCount = paidBookings.filter(
    (booking) => booking.status === "completed",
  ).length;
  const completionRate =
    checkedInOrCompleted.length > 0
      ? Math.round((completedCount / checkedInOrCompleted.length) * 100)
      : 0;

  const locationMap = new Map<
    string,
    { locationId: string; name: string; revenue: number; count: number }
  >();
  for (const booking of paidBookings) {
    const locationId = booking.location_id;
    const existing = locationMap.get(locationId) ?? {
      locationId,
      name: booking.locations?.name ?? "Unknown location",
      revenue: 0,
      count: 0,
    };
    existing.revenue += Number(booking.amount);
    existing.count += 1;
    locationMap.set(locationId, existing);
  }

  const serviceMap = new Map<
    string,
    { serviceId: string; name: string; count: number; revenue: number }
  >();
  for (const booking of paidBookings) {
    const serviceId = booking.service_id;
    const existing = serviceMap.get(serviceId) ?? {
      serviceId,
      name: booking.services?.name ?? "Unknown service",
      count: 0,
      revenue: 0,
    };
    existing.count += 1;
    existing.revenue += Number(booking.amount);
    serviceMap.set(serviceId, existing);
  }

  const statusMap = new Map<string, number>();
  for (const booking of paidBookings) {
    statusMap.set(booking.status, (statusMap.get(booking.status) ?? 0) + 1);
  }

  return {
    range,
    rangeLabel: RANGE_LABELS[range],
    revenue,
    bookingCount: bookings.length,
    refundCount: refundedBookings.length,
    refundedAmount,
    completionRate,
    revenueByLocation: [...locationMap.values()].sort(
      (a, b) => b.revenue - a.revenue,
    ),
    servicePopularity: [...serviceMap.values()].sort((a, b) => b.count - a.count),
    statusBreakdown: [...statusMap.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    recentRefunds: refundedBookings.slice(0, 5).map((booking) => ({
      id: booking.id,
      customerName: booking.customer_name,
      amount: Number(booking.amount),
      reason: booking.refund_reason
        ? formatRefundReason(booking.refund_reason, booking.refund_notes)
        : "No reason recorded",
      refundedAt: booking.refunded_at ?? booking.updated_at,
    })),
  };
}
