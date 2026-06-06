type BookingEmailPayload = {
  customerName: string;
  customerEmail: string;
  confirmationCode: string;
  confirmationUrl: string;
  serviceName: string;
  locationName: string;
  scheduledAt: string;
  amount: number;
};

export async function sendBookingConfirmation(payload: BookingEmailPayload) {
  // Placeholder until email provider is connected.
  console.log("📧 Booking confirmation email (mock):", payload);
  return { success: true, provider: "mock" as const };
}
