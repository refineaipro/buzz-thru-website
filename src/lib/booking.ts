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
import { getSiteUrl, getStripe, isStripeConfigured } from "@/lib/stripe";

export function generateConfirmationCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

type CreateBookingOptions = {
  status?: string;
  paymentStatus?: string;
  sendEmail?: boolean;
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
      amount,
    })
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;

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

export async function confirmBookingPayment(
  bookingId: string,
  stripePaymentIntentId?: string | null,
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
  if (booking.payment_status === "paid") {
    if (stripePaymentIntentId && !booking.stripe_payment_intent_id) {
      const { data, error } = await supabase
        .from("bookings")
        .update({ stripe_payment_intent_id: stripePaymentIntentId })
        .eq("id", bookingId)
        .select("*, locations(*), services(*)")
        .single();

      if (error) throw error;
      return data as Booking;
    }

    return booking;
  }

  const updates: Record<string, string> = {
    status: "confirmed",
    payment_status: "paid",
  };

  if (stripePaymentIntentId) {
    updates.stripe_payment_intent_id = stripePaymentIntentId;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", bookingId)
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;

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

  if (isStripeConfigured()) {
    if (!booking.stripe_payment_intent_id) {
      throw new Error(
        "No Stripe payment is linked to this booking. Refund it manually in the Stripe Dashboard.",
      );
    }

    await getStripe().refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
    });
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
    })
    .eq("id", bookingId)
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;
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
