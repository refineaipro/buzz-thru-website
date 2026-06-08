"use client";

import { useCallback, useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { QrScanner } from "@/components/QrScanner";
import type { Booking } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CheckInPanelProps = {
  initialBooking: Booking | null;
};

export function CheckInPanel({ initialBooking }: CheckInPanelProps) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState(initialBooking?.confirmation_code ?? "");
  const [bookings, setBookings] = useState<Booking[]>(
    initialBooking ? [initialBooking] : [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const lookup = useCallback(async (type: "phone" | "code", value: string) => {
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
      if ((data.bookings ?? []).length === 0) {
        setError("No booking found for that search.");
      }
    }

    setLoading(false);
  }, []);

  const handleScan = useCallback(
    (scannedCode: string) => {
      setScanning(false);
      setCode(scannedCode);
      setError("");
      lookup("code", scannedCode);
    },
    [lookup],
  );

  async function checkIn(id: string) {
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "checked_in" }),
    });
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status: "checked_in" } : booking,
      ),
    );
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy">Tablet Check-In</h2>
      <p className="mt-2 text-sm text-slate-600">
        Scan a customer QR code, or look up a booking by phone or confirmation
        code.
      </p>

      <Card className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-brand-navy">Scan QR Code</h3>
            <p className="mt-1 text-sm text-slate-600">
              Point the camera at the confirmation QR on the customer&apos;s
              phone or email.
            </p>
          </div>
          <Button
            type="button"
            variant={scanning ? "secondary" : "primary"}
            onClick={() => {
              setError("");
              setScanning((current) => !current);
            }}
          >
            {scanning ? "Stop Scanner" : "Start Scanner"}
          </Button>
        </div>

        {scanning ? (
          <div className="mt-4 space-y-3">
            <QrScanner
              active={scanning}
              onScan={handleScan}
              onError={setError}
            />
            <p className="text-center text-xs text-slate-500">
              Hold the QR steady inside the frame. The booking will load
              automatically.
            </p>
          </div>
        ) : null}
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
      {loading ? (
        <p className="mt-4 text-sm text-slate-600">Looking up booking...</p>
      ) : null}

      <div className="mt-8 space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">
              No bookings loaded yet. Scan a QR code or search by phone or
              confirmation code.
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
