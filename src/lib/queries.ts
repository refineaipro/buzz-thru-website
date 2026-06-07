import { createClient } from "@/lib/supabase/server";
import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";
import {
  PLACEHOLDER_LOCATIONS,
  PLACEHOLDER_SERVICES,
} from "@/lib/data";
import { BOOKABLE_WASHES } from "@/lib/services-catalog";
import type { Location, Service } from "@/lib/types";

const BOOKABLE_SLUGS = BOOKABLE_WASHES.map((wash) => wash.slug);

function mergeServiceWithCatalog(service: Service): Service {
  const catalog = BOOKABLE_WASHES.find((wash) => wash.slug === service.slug);
  if (!catalog) return service;

  return {
    ...service,
    name: catalog.name,
    price: catalog.price,
    description: `${catalog.features[0]}. ${catalog.features[1]}.`,
  };
}

async function ensureBookableServicesInDb(): Promise<Service[]> {
  const supabase = createServiceClient();

  const { data: existing, error: fetchError } = await supabase
    .from("services")
    .select("*")
    .in("slug", BOOKABLE_SLUGS)
    .order("price");

  if (fetchError) throw fetchError;

  const existingSlugs = new Set(existing?.map((service) => service.slug) ?? []);
  const missingSlugs = BOOKABLE_SLUGS.filter((slug) => !existingSlugs.has(slug));

  if (missingSlugs.length > 0) {
    const rows = BOOKABLE_WASHES.filter((wash) => missingSlugs.includes(wash.slug)).map(
      (wash, index) => ({
        name: wash.name,
        slug: wash.slug,
        description: `${wash.features[0]}. ${wash.features[1]}.`,
        price: wash.price,
        duration_minutes: 30,
        featured: index < 2,
      }),
    );

    const { error: upsertError } = await supabase
      .from("services")
      .upsert(rows, { onConflict: "slug" });

    if (upsertError) throw upsertError;
  }

  const { data: synced, error: syncedError } = await supabase
    .from("services")
    .select("*")
    .in("slug", BOOKABLE_SLUGS)
    .order("price");

  if (syncedError || !synced?.length) return PLACEHOLDER_SERVICES;

  return synced.map((service) => mergeServiceWithCatalog(service as Service));
}

async function ensureLocationsInDb(): Promise<Location[]> {
  const supabase = createServiceClient();

  const rows = PLACEHOLDER_LOCATIONS.map((location) => ({
    name: location.name,
    slug: location.slug,
    address: location.address,
    city: location.city,
    state: location.state,
    zip: location.zip,
    phone: location.phone,
    lat: location.lat,
    lng: location.lng,
    hours: location.hours,
  }));

  const { error: upsertError } = await supabase
    .from("locations")
    .upsert(rows, { onConflict: "slug" });

  if (upsertError) throw upsertError;

  const { data, error } = await supabase.from("locations").select("*").order("name");

  if (error || !data?.length) return PLACEHOLDER_LOCATIONS;
  return data as Location[];
}

export async function getLocations(): Promise<Location[]> {
  if (!isSupabaseConfigured()) return PLACEHOLDER_LOCATIONS;

  try {
    return await ensureLocationsInDb();
  } catch {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("name");

    if (error || !data?.length) return PLACEHOLDER_LOCATIONS;
    return data as Location[];
  }
}

export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return PLACEHOLDER_SERVICES;

  try {
    return await ensureBookableServicesInDb();
  } catch {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .in("slug", BOOKABLE_SLUGS)
      .order("price");

    if (error || !data?.length) return PLACEHOLDER_SERVICES;
    return data.map((service) => mergeServiceWithCatalog(service as Service));
  }
}

export async function getServiceById(id: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((service) => service.id === id) ?? null;
}

export async function getLocationById(id: string): Promise<Location | null> {
  const locations = await getLocations();
  return locations.find((location) => location.id === id) ?? null;
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((service) => service.slug === slug) ?? null;
}
