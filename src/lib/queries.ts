import { createClient } from "@/lib/supabase/server";
import {
  PLACEHOLDER_LOCATIONS,
  PLACEHOLDER_SERVICES,
} from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/service";
import type { Location, Service } from "@/lib/types";

export async function getLocations(): Promise<Location[]> {
  if (!isSupabaseConfigured()) return PLACEHOLDER_LOCATIONS;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("name");

  if (error || !data?.length) return PLACEHOLDER_LOCATIONS;
  return data as Location[];
}

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return PLACEHOLDER_SERVICES;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("price");

  if (error || !data?.length) return PLACEHOLDER_SERVICES;
  return data as Service[];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((service) => service.id === id) ?? null;
}

export async function getLocationById(id: string): Promise<Location | null> {
  const locations = await getLocations();
  return locations.find((location) => location.id === id) ?? null;
}
