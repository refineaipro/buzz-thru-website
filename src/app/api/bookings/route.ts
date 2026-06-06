import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { getAvailableSlots } from "@/lib/slots";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      locationId,
      serviceId,
      scheduledAt,
      customerName,
      customerEmail,
      customerPhone,
      carType,
      licensePlate,
    } = body;

    if (
      !locationId ||
      !serviceId ||
      !scheduledAt ||
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !carType ||
      !licensePlate
    ) {
      return NextResponse.json(
        { error: "All booking fields are required." },
        { status: 400 },
      );
    }

    const date = scheduledAt.slice(0, 10);
    const slots = await getAvailableSlots(locationId, date);
    const slot = slots.find((s) => s.value === scheduledAt);

    if (!slot?.available) {
      return NextResponse.json(
        { error: "That time slot is no longer available." },
        { status: 409 },
      );
    }

    const booking = await createBooking({
      locationId,
      serviceId,
      scheduledAt,
      customerName,
      customerEmail,
      customerPhone,
      carType,
      licensePlate,
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Booking failed." },
      { status: 500 },
    );
  }
}
