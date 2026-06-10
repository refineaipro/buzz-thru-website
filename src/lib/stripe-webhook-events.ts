import { createServiceClient, isSupabaseConfigured } from "@/lib/supabase/service";

export async function claimStripeWebhookEvent(
  eventId: string,
  eventType: string,
) {
  if (!isSupabaseConfigured()) return true;

  const supabase = createServiceClient();
  const { error } = await supabase.from("stripe_webhook_events").insert({
    id: eventId,
    type: eventType,
  });

  if (error?.code === "23505") {
    return false;
  }

  if (error) throw error;
  return true;
}

export async function releaseStripeWebhookEvent(eventId: string) {
  if (!isSupabaseConfigured()) return;

  const supabase = createServiceClient();
  await supabase.from("stripe_webhook_events").delete().eq("id", eventId);
}
