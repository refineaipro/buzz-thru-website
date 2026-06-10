import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { processStripeWebhookEvent } from "@/lib/stripe-fulfillment";
import {
  claimStripeWebhookEvent,
  releaseStripeWebhookEvent,
} from "@/lib/stripe-webhook-events";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 400 },
    );
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const shouldProcess = await claimStripeWebhookEvent(event.id, event.type);
  if (!shouldProcess) {
    return NextResponse.json({ received: true });
  }

  try {
    await processStripeWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    await releaseStripeWebhookEvent(event.id);
    console.error("Stripe webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 },
    );
  }
}
