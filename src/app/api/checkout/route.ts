import { NextRequest, NextResponse } from "next/server";
import {
  createPendingBooking,
  formatBookingAppointment,
} from "@/lib/booking";
import { parseBookingRequestBody } from "@/lib/booking-input";
import { getAvailableSlots } from "@/lib/slots";
import { getLocationById, getServiceById } from "@/lib/queries";
import { getSiteUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Online payments are not configured yet." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const parsed = parseBookingRequestBody(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: parsed.status });
    }

    const {
      locationId,
      serviceId,
      scheduledAt,
      customerName,
      customerEmail,
      customerPhone,
      carType,
      licensePlate,
    } = parsed.input;

    const date = scheduledAt.slice(0, 10);
    const slots = await getAvailableSlots(locationId, date);
    const slot = slots.find((s) => s.value === scheduledAt);

    if (!slot?.available) {
      return NextResponse.json(
        { error: "That time slot is no longer available." },
        { status: 409 },
      );
    }

    const location = await getLocationById(locationId);
    const service = await getServiceById(serviceId);

    if (!location || !service) {
      return NextResponse.json(
        { error: "Invalid location or service." },
        { status: 400 },
      );
    }

    const booking = await createPendingBooking(parsed.input);

    const siteUrl = getSiteUrl();
    const stripe = getStripe();
    const amountCents = Math.round(Number(service.price) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: amountCents,
            product_data: {
              name: `${service.name} Hand Wash`,
              description: `${location.name} · ${formatBookingAppointment(booking)} · ${carType} · ${licensePlate.toUpperCase()}`,
            },
          },
        },
      ],
      metadata: {
        bookingId: booking.id,
      },
      success_url: `${siteUrl}/confirmation/${booking.id}?code=${booking.confirmation_code}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/book?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Checkout could not start.",
      },
      { status: 500 },
    );
  }
}
