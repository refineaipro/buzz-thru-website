import { confirmBookingPayment } from "@/lib/booking";
import {
  getPaymentIntentId,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";

export async function verifyCheckoutSession(sessionId: string) {
  if (!isStripeConfigured() || !sessionId) return null;

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const bookingId = session.metadata?.bookingId;

  if (!bookingId) return null;

  if (session.payment_status === "paid") {
    return confirmBookingPayment(
      bookingId,
      getPaymentIntentId(session.payment_intent),
    );
  }

  return null;
}
