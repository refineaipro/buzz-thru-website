"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Booking } from "@/lib/types";
import {
  canCheckInBooking,
  canCompleteBooking,
  canRefundBooking,
} from "@/lib/booking-status";
import { Button } from "@/components/Button";
import { RefundBookingDialog } from "@/components/RefundBookingDialog";

type AdminBookingActionsProps = {
  booking: Booking;
};

export function AdminBookingActions({ booking }: AdminBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [refundOpen, setRefundOpen] = useState(false);

  const checkInAllowed = canCheckInBooking(booking);
  const completeAllowed = canCompleteBooking(booking);
  const refundAllowed = canRefundBooking(booking);

  async function update(status?: string) {
    setLoading(status ?? "update");
    setError("");

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Update failed.");
      setLoading("");
      return;
    }

    setLoading("");
    router.refresh();
  }

  async function processRefund(reason: string, notes: string) {
    setLoading("refunded");
    setError("");

    const response = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentStatus: "refunded",
        refundReason: reason,
        refundNotes: notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Refund failed.");
      setLoading("");
      return;
    }

    setLoading("");
    setRefundOpen(false);
    router.refresh();
  }

  function getHelperText() {
    if (booking.payment_status === "refunded") {
      return "This booking was refunded and cancelled.";
    }

    if (booking.status === "completed") {
      return "Wash finished. No further actions needed.";
    }

    if (booking.status === "checked_in") {
      return "Customer is on site. Mark wash complete when the service is finished.";
    }

    if (booking.status === "confirmed") {
      return "Customer has not arrived yet. Refund is available only before check-in.";
    }

    return null;
  }

  const helperText = getHelperText();

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="px-3 py-2 text-xs"
            disabled={loading !== "" || !checkInAllowed}
            onClick={() => update("checked_in")}
          >
            {booking.status === "checked_in" || booking.status === "completed"
              ? "Checked In"
              : loading === "checked_in"
                ? "Checking in..."
                : "Check In"}
          </Button>
          <Button
            variant="secondary"
            className="px-3 py-2 text-xs"
            disabled={loading !== "" || !completeAllowed}
            onClick={() => update("completed")}
          >
            {booking.status === "completed"
              ? "Wash Complete"
              : loading === "completed"
                ? "Saving..."
                : "Mark Wash Complete"}
          </Button>
          {refundAllowed ? (
            <Button
              variant="ghost"
              className="px-3 py-2 text-xs"
              disabled={loading !== ""}
              onClick={() => {
                setError("");
                setRefundOpen(true);
              }}
            >
              Refund
            </Button>
          ) : null}
        </div>
        {helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
        {error && !refundOpen ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : null}
      </div>

      <RefundBookingDialog
        booking={booking}
        open={refundOpen}
        loading={loading === "refunded"}
        error={refundOpen ? error : undefined}
        onClose={() => {
          setRefundOpen(false);
          setError("");
        }}
        onConfirm={processRefund}
      />
    </>
  );
}
