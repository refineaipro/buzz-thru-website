import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { parseBookingRequestBody } from "@/lib/booking-input";
import { getAvailableSlots } from "@/lib/slots";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseBookingRequestBody(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    const { locationId, scheduledAt } = parsed.input;

    const date = scheduledAt.slice(0, 10);
    const slots = await getAvailableSlots(locationId, date);
    const slot = slots.find((s) => s.value === scheduledAt);

    if (!slot?.available) {
      return NextResponse.json(
        { error: "That time slot is no longer available." },
        { status: 409 },
      );
    }

    const booking = await createBooking(parsed.input);

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed." },
      { status: 500 },
    );
  }
}
