import type Stripe from "stripe";
import {
  cancelPendingBooking,
  getBookingById,
  getBookingByPaymentIntent,
  markBookingRefundedFromStripe,
} from "@/lib/booking";
import {
  fulfillCheckoutSession,
} from "@/lib/checkout";
import { getPaymentIntentId, getStripe } from "@/lib/stripe";

export async function processStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid" && session.id) {
        await fulfillCheckoutSession(session.id);
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await cancelPendingBooking(bookingId);
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId) {
        await cancelPendingBooking(bookingId);
      }
      break;
    }
    case "charge.refunded":
    case "refund.created": {
      await syncRefundWebhookEvent(event);
      break;
    }
    default:
      break;
  }
}

async function syncRefundWebhookEvent(event: Stripe.Event) {
  let paymentIntentId: string | null = null;
  let refundId: string | null = null;

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    paymentIntentId =
      typeof charge.payment_intent === "string"
        ? charge.payment_intent
        : charge.payment_intent?.id ?? null;
  }

  if (event.type === "refund.created") {
    const refund = event.data.object as Stripe.Refund;
    refundId = refund.id;
    paymentIntentId = getPaymentIntentId(refund.payment_intent);
  }

  if (!paymentIntentId) return;

  const booking =
    (await getBookingByPaymentIntent(paymentIntentId)) ??
    (await findBookingFromPaymentIntent(paymentIntentId));

  if (!booking || booking.payment_status === "refunded") return;

  await markBookingRefundedFromStripe(booking.id, {
    stripeRefundId: refundId ?? undefined,
    reason: "stripe_dashboard_refund",
    notes: "Synced automatically from Stripe.",
  });
}

async function findBookingFromPaymentIntent(paymentIntentId: string) {
  const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId) return null;
  return getBookingById(bookingId);
}
