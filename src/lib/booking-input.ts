import {
  hasValidationErrors,
  normalizePhoneDigits,
  validateBookingCustomerFields,
} from "@/lib/validation";

export function parseBookingRequestBody(body: Record<string, unknown>) {
  const locationId = String(body.locationId ?? "");
  const serviceId = String(body.serviceId ?? "");
  const scheduledAt = String(body.scheduledAt ?? "");
  const customerName = String(body.customerName ?? "").trim();
  const customerEmail = String(body.customerEmail ?? "").trim();
  const customerPhone = normalizePhoneDigits(String(body.customerPhone ?? ""));
  const carType = String(body.carType ?? "").trim();
  const licensePlate = String(body.licensePlate ?? "").trim().toUpperCase();

  const fieldErrors = validateBookingCustomerFields({
    customerName,
    customerEmail,
    customerPhone,
    licensePlate,
  });

  if (hasValidationErrors(fieldErrors)) {
    const firstError = Object.values(fieldErrors)[0];
    return { error: firstError ?? "Invalid booking details.", status: 400 as const };
  }

  if (!locationId || !serviceId || !scheduledAt || !carType) {
    return { error: "All booking fields are required.", status: 400 as const };
  }

  return {
    input: {
      locationId,
      serviceId,
      scheduledAt,
      customerName,
      customerEmail,
      customerPhone,
      carType,
      licensePlate,
    },
  };
}
