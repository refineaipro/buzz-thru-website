import {
  addDays,
  addHours,
  addMinutes,
  format,
  isBefore,
  isSunday,
  set,
  startOfDay,
} from "date-fns";
import { BOOKING_RULES } from "@/lib/constants";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";

export type TimeSlot = {
  value: string;
  label: string;
  available: boolean;
};

function buildSlotDate(baseDate: Date, hour: number, minute: number) {
  return set(baseDate, {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0,
  });
}

export function getBookableDates() {
  const dates: Date[] = [];
  const now = new Date();
  const earliest = addHours(now, BOOKING_RULES.minAdvanceHours);

  for (let i = 0; i <= BOOKING_RULES.maxDaysAhead; i += 1) {
    const date = addDays(startOfDay(now), i);
    if (isSunday(date)) continue;

    const lastSlot = buildSlotDate(date, BOOKING_RULES.closeHour - 1, 0);
    if (!isBefore(lastSlot, earliest)) {
      dates.push(date);
    }
  }

  return dates;
}

export async function getAvailableSlots(
  locationId: string,
  dateString: string,
): Promise<TimeSlot[]> {
  const baseDate = startOfDay(new Date(`${dateString}T12:00:00`));
  if (Number.isNaN(baseDate.getTime()) || isSunday(baseDate)) {
    return [];
  }

  const now = new Date();
  const earliest = addHours(now, BOOKING_RULES.minAdvanceHours);
  const slots: TimeSlot[] = [];

  for (
    let hour = BOOKING_RULES.openHour;
    hour < BOOKING_RULES.closeHour;
    hour += 1
  ) {
    for (const minute of [0, 30]) {
      if (hour === BOOKING_RULES.closeHour - 1 && minute === 30) continue;

      const slotStart = buildSlotDate(baseDate, hour, minute);
      if (isBefore(slotStart, earliest)) continue;

      slots.push({
        value: slotStart.toISOString(),
        label: format(slotStart, "h:mm a"),
        available: true,
      });
    }
  }

  if (!isSupabaseConfigured()) return slots;

  const dayStart = buildSlotDate(baseDate, BOOKING_RULES.openHour, 0);
  const dayEnd = addMinutes(
    buildSlotDate(baseDate, BOOKING_RULES.closeHour, 0),
    0,
  );

  const supabase = createServiceClient();
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("scheduled_at")
    .eq("location_id", locationId)
    .gte("scheduled_at", dayStart.toISOString())
    .lt("scheduled_at", dayEnd.toISOString())
    .neq("status", "cancelled");

  const bookedTimes = new Set(
    (existingBookings ?? []).map((booking) =>
      new Date(booking.scheduled_at).toISOString(),
    ),
  );

  return slots.map((slot) => ({
    ...slot,
    available: !bookedTimes.has(slot.value),
  }));
}
