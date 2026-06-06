"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/Button";

type AdminBookingActionsProps = {
  booking: Booking;
};

export function AdminBookingActions({ booking }: AdminBookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState("");

  async function update(status?: string, paymentStatus?: string) {
    setLoading(status ?? paymentStatus ?? "update");
    await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus }),
    });
    setLoading("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        className="px-3 py-2 text-xs"
        disabled={loading !== "" || booking.status === "checked_in"}
        onClick={() => update("checked_in")}
      >
        Check In
      </Button>
      <Button
        variant="secondary"
        className="px-3 py-2 text-xs"
        disabled={loading !== "" || booking.status === "completed"}
        onClick={() => update("completed")}
      >
        Complete
      </Button>
      <Button
        variant="ghost"
        className="px-3 py-2 text-xs"
        disabled={loading !== "" || booking.payment_status === "refunded"}
        onClick={() => update(undefined, "refunded")}
      >
        Refund
      </Button>
    </div>
  );
}
