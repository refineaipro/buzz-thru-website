import { createClient } from "@/lib/supabase/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";
import type { Booking } from "@/lib/types";

export async function getAdminUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAdminUser() {
  const user = await getAdminUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getBookings(filters?: {
  status?: string;
  locationId?: string;
  date?: string;
}) {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServiceClient();
  let query = supabase
    .from("bookings")
    .select("*, locations(*), services(*)")
    .order("scheduled_at", { ascending: true });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.locationId) query = query.eq("location_id", filters.locationId);
  if (filters?.date) {
    const start = new Date(`${filters.date}T00:00:00`).toISOString();
    const end = new Date(`${filters.date}T23:59:59`).toISOString();
    query = query.gte("scheduled_at", start).lte("scheduled_at", end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Booking[];
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
