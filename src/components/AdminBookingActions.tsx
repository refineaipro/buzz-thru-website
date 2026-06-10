"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Booking } from "@/lib/types";
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

  return (
    <>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            className="px-3 py-2 text-xs"
            disabled={
              loading !== "" ||
              booking.status === "checked_in" ||
              booking.payment_status === "refunded"
            }
            onClick={() => update("checked_in")}
          >
            Check In
          </Button>
          <Button
            variant="secondary"
            className="px-3 py-2 text-xs"
            disabled={
              loading !== "" ||
              booking.status === "completed" ||
              booking.payment_status === "refunded"
            }
            onClick={() => update("completed")}
          >
            Complete
          </Button>
          <Button
            variant="ghost"
            className="px-3 py-2 text-xs"
            disabled={
              loading !== "" ||
              booking.payment_status === "refunded" ||
              booking.payment_status !== "paid"
            }
            onClick={() => {
              setError("");
              setRefundOpen(true);
            }}
          >
            Refund
          </Button>
        </div>
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
