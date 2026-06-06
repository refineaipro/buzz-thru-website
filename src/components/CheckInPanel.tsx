"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CheckInPanelProps = {
  initialBooking: Booking | null;
};

export function CheckInPanel({ initialBooking }: CheckInPanelProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [bookings, setBookings] = useState<Booking[]>(
    initialBooking ? [initialBooking] : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function lookup(type: "phone" | "code", value: string) {
    setLoading(true);
    setError("");

    const param = type === "phone" ? "phone" : "code";
    const response = await fetch(
      `/api/bookings/lookup?${param}=${encodeURIComponent(value)}`,
    );
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Lookup failed.");
      setBookings([]);
    } else {
      setBookings(data.bookings ?? []);
    }

    setLoading(false);
  }

  async function checkIn(id: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "checked_in" }),
    });
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy">Tablet Check-In</h2>
      <p className="mt-2 text-sm text-slate-600">
        Look up a booking by phone number or confirmation code.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-brand-navy">Search by Phone</h3>
          <div className="mt-4 flex gap-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="flex-1 rounded-lg border border-blue-100 px-4 py-3 text-sm"
            />
            <Button
              onClick={() => lookup("phone", phone)}
              disabled={loading || !phone}
            >
              Search
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-brand-navy">Search by Code</h3>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ABC12345"
              className="flex-1 rounded-lg border border-blue-100 px-4 py-3 text-sm uppercase"
            />
            <Button
              onClick={() => lookup("code", code)}
              disabled={loading || !code}
            >
              Search
            </Button>
          </div>
        </Card>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">
              No bookings found. Search by phone or scan a QR code.
            </p>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand-blue">
                    {booking.confirmation_code}
                  </p>
                  <h3 className="text-lg font-semibold text-brand-navy">
                    {booking.customer_name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {booking.services?.name} · {booking.locations?.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {format(new Date(booking.scheduled_at), "MMM d · h:mm a")} ·{" "}
                    {booking.car_type} · {booking.license_plate}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-red">
                    {formatCurrency(Number(booking.amount))}
                  </p>
                </div>
                <Button
                  onClick={() => checkIn(booking.id)}
                  disabled={booking.status === "checked_in"}
                >
                  {booking.status === "checked_in"
                    ? "Checked In"
                    : "Check In Now"}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
