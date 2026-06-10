import { format } from "date-fns";
import QRCode from "qrcode";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { getBookingByCode } from "@/lib/booking";
import { verifyCheckoutSession } from "@/lib/checkout";
import { getSiteUrl } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

type ConfirmationPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ code?: string; session_id?: string }>;
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: ConfirmationPageProps) {
  const { id } = await params;
  const { code, session_id: sessionId } = await searchParams;

  let booking = null;

  if (sessionId) {
    booking = await verifyCheckoutSession(sessionId, id);
  }

  if (!booking && code) {
    const byCode = await getBookingByCode(code);
    if (byCode?.id === id) {
      booking = byCode;
    }
  }

  if (!booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-brand-navy">Booking Not Found</h1>
        <p className="mt-4 text-slate-600">
          We couldn&apos;t find this confirmation. Check your email or contact us.
        </p>
        <Button href="/book" className="mt-8">
          Book a Wash
        </Button>
      </div>
    );
  }

  if (booking.payment_status !== "paid") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-brand-blue" />
        <h1 className="mt-4 text-2xl font-bold text-brand-navy">
          Confirming Payment
        </h1>
        <p className="mt-4 text-slate-600">
          Your payment is still processing. Refresh this page in a moment, or
          check your email for confirmation.
        </p>
        <Button href={`/confirmation/${booking.id}?code=${booking.confirmation_code}`} className="mt-8">
          Refresh
        </Button>
      </div>
    );
  }

  const siteUrl = getSiteUrl();
  const checkInUrl = `${siteUrl}/admin/check-in?code=${booking.confirmation_code}`;
  const qrDataUrl = await QRCode.toDataURL(checkInUrl, {
    margin: 2,
    width: 220,
    color: { dark: "#0B1D43", light: "#FFFFFF" },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <h1 className="mt-4 text-3xl font-bold text-brand-navy">
          You&apos;re Booked!
        </h1>
        <p className="mt-2 text-slate-600">
          Confirmation code:{" "}
          <span className="font-mono font-bold text-brand-navy">
            {booking.confirmation_code}
          </span>
        </p>
      </div>

      <Card className="mt-8">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Service</dt>
            <dd className="font-medium">{booking.services?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Location</dt>
            <dd className="font-medium">{booking.locations?.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">When</dt>
            <dd className="font-medium">
              {format(new Date(booking.scheduled_at), "EEEE, MMM d · h:mm a")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Vehicle</dt>
            <dd className="font-medium">
              {booking.car_type} · {booking.license_plate}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-blue-100 pt-3">
            <dt className="font-semibold text-brand-navy">Paid</dt>
            <dd className="font-bold text-brand-red">
              {formatCurrency(Number(booking.amount))}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6 text-center">
        <h2 className="font-semibold text-brand-navy">Your Check-In QR Code</h2>
        <p className="mt-2 text-sm text-slate-600">
          Show this at the location, or give staff your phone number.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt="Booking QR code"
          className="mx-auto mt-4 rounded-lg"
        />
      </Card>

      <p className="mt-6 text-center text-sm text-slate-500">
        A confirmation email with your booking details will be sent to{" "}
        {booking.customer_email}.
      </p>

      <div className="mt-8 text-center">
        <Button href="/" variant="secondary">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
