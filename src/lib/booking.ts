import { randomBytes } from "crypto";
import { format } from "date-fns";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";
import type { Booking, CreateBookingInput } from "@/lib/types";
import { getLocationById, getServiceById } from "@/lib/queries";
import { sendBookingConfirmation } from "@/lib/email";
import {
  assertCheckInAllowed,
  assertCompleteAllowed,
  assertRefundAllowed,
} from "@/lib/booking-status";
import {
  getSiteUrl,
  getStripe,
  isStripeConfigured,
  refundIdempotencyKey,
} from "@/lib/stripe";

export function generateConfirmationCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function isSlotConflictError(error: { code?: string }) {
  return error.code === "23505";
}

type CreateBookingOptions = {
  status?: string;
  paymentStatus?: string;
  sendEmail?: boolean;
};

type ConfirmPaymentOptions = {
  stripePaymentIntentId?: string | null;
  stripeCheckoutSessionId?: string | null;
};

async function sendConfirmationForBooking(booking: Booking) {
  const siteUrl = getSiteUrl();

  await sendBookingConfirmation({
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    confirmationCode: booking.confirmation_code,
    confirmationUrl: `${siteUrl}/confirmation/${booking.id}?code=${booking.confirmation_code}`,
    serviceName: booking.services?.name ?? "Hand wash",
    locationName: booking.locations?.name ?? "Buzz Thru",
    scheduledAt: booking.scheduled_at,
    amount: Number(booking.amount),
  });
}

export async function createBooking(
  input: CreateBookingInput,
  options: CreateBookingOptions = {},
) {
  const location = await getLocationById(input.locationId);
  const service = await getServiceById(input.serviceId);

  if (!location || !service) {
    throw new Error("Invalid location or service.");
  }

  const confirmationCode = generateConfirmationCode();
  const amount = Number(service.price);
  const status = options.status ?? "confirmed";
  const paymentStatus = options.paymentStatus ?? "paid";
  const sendEmail = options.sendEmail ?? paymentStatus === "paid";

  if (!isSupabaseConfigured()) {
    const mockBooking: Booking = {
      id: crypto.randomUUID(),
      confirmation_code: confirmationCode,
      location_id: input.locationId,
      service_id: input.serviceId,
      scheduled_at: input.scheduledAt,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      car_type: input.carType,
      license_plate: input.licensePlate.toUpperCase(),
      status,
      payment_status: paymentStatus,
      paid_at: paymentStatus === "paid" ? new Date().toISOString() : null,
      amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locations: location,
      services: service,
    };

    if (sendEmail) {
      await sendConfirmationForBooking(mockBooking);
    }

    return mockBooking;
  }

  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      confirmation_code: confirmationCode,
      location_id: input.locationId,
      service_id: input.serviceId,
      scheduled_at: input.scheduledAt,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: normalizePhone(input.customerPhone),
      car_type: input.carType,
      license_plate: input.licensePlate.toUpperCase(),
      status,
      payment_status: paymentStatus,
      paid_at: paymentStatus === "paid" ? now : null,
      amount,
    })
    .select("*, locations(*), services(*)")
    .single();

  if (error) {
    if (isSlotConflictError(error)) {
      throw new Error("That time slot is no longer available.");
    }
    throw error;
  }

  const booking = data as Booking;

  if (sendEmail) {
    await sendConfirmationForBooking(booking);
  }

  return booking;
}

export async function createPendingBooking(input: CreateBookingInput) {
  return createBooking(input, {
    status: "pending_payment",
    paymentStatus: "pending",
    sendEmail: false,
  });
}

export async function attachCheckoutSessionToBooking(
  bookingId: string,
  sessionId: string,
) {
  if (!isSupabaseConfigured()) return;

  const supabase = createServiceClient();
  await supabase
    .from("bookings")
    .update({ stripe_checkout_session_id: sessionId })
    .eq("id", bookingId);
}

export async function confirmBookingPayment(
  bookingId: string,
  options: ConfirmPaymentOptions = {},
) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .eq("id", bookingId)
    .single();

  if (!existing) return null;

  const booking = existing as Booking;
  const stripeUpdates: Record<string, string> = {};

  if (options.stripePaymentIntentId) {
    stripeUpdates.stripe_payment_intent_id = options.stripePaymentIntentId;
  }
  if (options.stripeCheckoutSessionId) {
    stripeUpdates.stripe_checkout_session_id = options.stripeCheckoutSessionId;
  }

  if (booking.payment_status === "paid") {
    if (Object.keys(stripeUpdates).length === 0) {
      return booking;
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(stripeUpdates)
      .eq("id", bookingId)
      .select("*, locations(*), services(*)")
      .single();

    if (error) throw error;
    return data as Booking;
  }

  const updates: Record<string, string> = {
    status: "confirmed",
    payment_status: "paid",
    paid_at: new Date().toISOString(),
    ...stripeUpdates,
  };

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .eq("payment_status", "pending")
    .select("*, locations(*), services(*)")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return getBookingById(bookingId);
  }

  const confirmed = data as Booking;
  await sendConfirmationForBooking(confirmed);
  return confirmed;
}

export async function refundBooking(
  bookingId: string,
  refundReason: string,
  refundNotes?: string,
) {
  if (!isSupabaseConfigured()) {
    return {
      id: bookingId,
      status: "cancelled",
      payment_status: "refunded",
    } as Booking;
  }

  const booking = await getBookingById(bookingId);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.payment_status === "refunded") {
    return booking;
  }

  assertRefundAllowed(booking);

  let stripeRefundId: string | null = null;

  if (isStripeConfigured()) {
    if (!booking.stripe_payment_intent_id) {
      throw new Error(
        "No Stripe payment is linked to this booking. Refund it manually in the Stripe Dashboard.",
      );
    }

    const refund = await getStripe().refunds.create(
      { payment_intent: booking.stripe_payment_intent_id },
      { idempotencyKey: refundIdempotencyKey(bookingId) },
    );
    stripeRefundId = refund.id;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: "refunded",
      refund_reason: refundReason,
      refund_notes: refundNotes?.trim() || null,
      refunded_at: new Date().toISOString(),
      stripe_refund_id: stripeRefundId,
    })
    .eq("id", bookingId)
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;
  return data as Booking;
}

export async function markBookingRefundedFromStripe(
  bookingId: string,
  options?: {
    stripeRefundId?: string;
    reason?: string;
    notes?: string;
  },
) {
  if (!isSupabaseConfigured()) return null;

  const booking = await getBookingById(bookingId);
  if (!booking || booking.payment_status === "refunded") {
    return booking;
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      payment_status: "refunded",
      refund_reason: options?.reason ?? "stripe_refund",
      refund_notes: options?.notes ?? null,
      refunded_at: new Date().toISOString(),
      stripe_refund_id: options?.stripeRefundId ?? booking.stripe_refund_id,
    })
    .eq("id", bookingId)
    .eq("payment_status", "paid")
    .select("*, locations(*), services(*)")
    .single();

  if (error) return null;
  return data as Booking;
}

export async function cancelPendingBooking(bookingId: string) {
  if (!isSupabaseConfigured()) return;

  const supabase = createServiceClient();
  await supabase
    .from("bookings")
    .update({ status: "cancelled", payment_status: "pending" })
    .eq("id", bookingId)
    .eq("status", "pending_payment");
}

export async function getBookingById(id: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Booking;
}

export async function getBookingByPaymentIntent(paymentIntentId: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  return (data as Booking) ?? null;
}

export async function getBookingByCode(code: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .eq("confirmation_code", code.toUpperCase())
    .neq("status", "cancelled")
    .single();

  return (data as Booking) ?? null;
}

export async function getBookingsByPhone(phone: string) {
  if (!isSupabaseConfigured()) return [];

  const normalized = normalizePhone(phone).slice(-10);
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .ilike("customer_phone", `%${normalized}%`)
    .neq("status", "cancelled")
    .neq("status", "pending_payment")
    .order("scheduled_at", { ascending: true })
    .limit(10);

  return (data as Booking[]) ?? [];
}

export async function updateBookingStatus(
  id: string,
  status: string,
  paymentStatus?: string,
) {
  if (!isSupabaseConfigured()) {
    return { id, status, payment_status: paymentStatus ?? "paid" };
  }

  const booking = await getBookingById(id);
  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (status === "checked_in") {
    assertCheckInAllowed(booking);
  }

  if (status === "completed") {
    assertCompleteAllowed(booking);
  }

  const supabase = createServiceClient();
  const updates: Record<string, string> = { status };
  if (paymentStatus) updates.payment_status = paymentStatus;

  if (status === "checked_in" && !booking.checked_in_at) {
    updates.checked_in_at = new Date().toISOString();
  }

  if (status === "completed" && !booking.completed_at) {
    updates.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;
  return data as Booking;
}

export function formatBookingAppointment(booking: Booking) {
  return format(new Date(booking.scheduled_at), "EEEE, MMM d · h:mm a");
}
