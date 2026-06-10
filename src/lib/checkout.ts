import {
  confirmBookingPayment,
  getBookingById,
} from "@/lib/booking";
import {
  getPaymentIntentId,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";

export async function fulfillCheckoutSession(
  sessionId: string,
  expectedBookingId?: string,
) {
  if (!isStripeConfigured() || !sessionId) return null;

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId ?? session.client_reference_id;

  if (!bookingId || session.payment_status !== "paid") {
    return null;
  }

  if (expectedBookingId && bookingId !== expectedBookingId) {
    return null;
  }

  if (
    session.metadata?.bookingId &&
    session.client_reference_id &&
    session.metadata.bookingId !== session.client_reference_id
  ) {
    throw new Error(
      `Checkout session ${sessionId} has mismatched booking references.`,
    );
  }

  if (session.status !== "complete") {
    return null;
  }

  if (session.currency && session.currency !== "usd") {
    throw new Error(
      `Unexpected currency for booking ${bookingId}: ${session.currency}`,
    );
  }

  const booking = await getBookingById(bookingId);
  if (!booking) return null;

  if (
    booking.stripe_checkout_session_id &&
    booking.stripe_checkout_session_id !== session.id
  ) {
    throw new Error(
      `Checkout session ${sessionId} does not match booking ${bookingId}.`,
    );
  }

  const expectedAmountCents = Math.round(Number(booking.amount) * 100);
  if (
    session.amount_total !== null &&
    session.amount_total !== expectedAmountCents
  ) {
    throw new Error(
      `Payment amount mismatch for booking ${bookingId}. Expected ${expectedAmountCents}, received ${session.amount_total}.`,
    );
  }

  return confirmBookingPayment(bookingId, {
    stripePaymentIntentId: getPaymentIntentId(session.payment_intent),
    stripeCheckoutSessionId: session.id,
  });
}

export async function verifyCheckoutSession(
  sessionId: string,
  expectedBookingId?: string,
) {
  return fulfillCheckoutSession(sessionId, expectedBookingId);
}
