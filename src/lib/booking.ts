import { randomBytes } from "crypto";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";
import type { Booking, CreateBookingInput } from "@/lib/types";
import { getLocationById, getServiceById } from "@/lib/queries";
import { sendBookingConfirmation } from "@/lib/email";

export function generateConfirmationCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function createBooking(input: CreateBookingInput) {
  const location = await getLocationById(input.locationId);
  const service = await getServiceById(input.serviceId);

  if (!location || !service) {
    throw new Error("Invalid location or service.");
  }

  const confirmationCode = generateConfirmationCode();
  const amount = Number(service.price);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
      status: "confirmed",
      payment_status: "paid",
      amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      locations: location,
      services: service,
    };

    await sendBookingConfirmation({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      confirmationCode,
      confirmationUrl: `${siteUrl}/confirmation/${mockBooking.id}?code=${confirmationCode}`,
      serviceName: service.name,
      locationName: location.name,
      scheduledAt: input.scheduledAt,
      amount,
    });

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
      status: "confirmed",
      payment_status: "paid",
      amount,
    })
    .select("*, locations(*), services(*)")
    .single();

  if (error) throw error;

  await sendBookingConfirmation({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    confirmationCode,
    confirmationUrl: `${siteUrl}/confirmation/${data.id}?code=${confirmationCode}`,
    serviceName: service.name,
    locationName: location.name,
    scheduledAt: input.scheduledAt,
    amount,
  });

  return data as Booking;
}

export async function getBookingByCode(code: string) {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServiceClient();
  const { data } = await supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .eq("confirmation_code", code.toUpperCase())
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
