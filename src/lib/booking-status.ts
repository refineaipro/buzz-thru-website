import type { Booking } from "@/lib/types";

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Wash complete",
  cancelled: "Cancelled",
  no_show: "No show",
};

export function getBookingStatusLabel(status: string) {
  return BOOKING_STATUS_LABELS[status] ?? status;
}

export function canCheckInBooking(booking: Booking) {
  return (
    booking.payment_status === "paid" && booking.status === "confirmed"
  );
}

export function canCompleteBooking(booking: Booking) {
  return booking.payment_status === "paid" && booking.status === "checked_in";
}

export function canRefundBooking(booking: Booking) {
  return booking.payment_status === "paid" && booking.status === "confirmed";
}

export function assertCheckInAllowed(booking: Booking) {
  if (booking.payment_status === "refunded") {
    throw new Error("Refunded bookings cannot be checked in.");
  }

  if (booking.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be checked in.");
  }
}

export function assertCompleteAllowed(booking: Booking) {
  if (booking.payment_status === "refunded") {
    throw new Error("Refunded bookings cannot be completed.");
  }

  if (booking.status !== "checked_in") {
    throw new Error("Check the customer in before marking the wash complete.");
  }
}

export function assertRefundAllowed(booking: Booking) {
  if (booking.payment_status === "refunded") {
    throw new Error("This booking has already been refunded.");
  }

  if (booking.payment_status !== "paid") {
    throw new Error("Only paid bookings can be refunded.");
  }

  if (booking.status !== "confirmed") {
    throw new Error("Refunds are only available before check-in.");
  }
}
