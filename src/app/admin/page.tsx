import { format } from "date-fns";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { getAdminUser, getBookings } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { AdminBookingActions } from "@/components/AdminBookingActions";

export default async function AdminDashboardPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const bookings = await getBookings();

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-navy">All Bookings</h2>
      <p className="mt-2 text-sm text-slate-600">
        Signed in as {user.email}. Manage appointments across all locations.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:hidden">
        <Link
          href="/admin/check-in"
          className="flex items-center justify-center rounded-xl border border-blue-100 bg-white px-4 py-4 text-center text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-sky"
        >
          Open Check-In Scanner
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center rounded-xl border border-blue-100 bg-white px-4 py-4 text-center text-sm font-semibold text-brand-navy transition-colors hover:bg-brand-sky"
        >
          View Public Site
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {bookings.length === 0 ? (
          <Card>
            <p className="text-slate-600">
              No bookings yet. They&apos;ll appear here once customers book online.
            </p>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold text-brand-blue">
                    {booking.confirmation_code}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-brand-navy">
                    {booking.customer_name}
                  </h3>
                  <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-brand-navy">Service</dt>
                      <dd>{booking.services?.name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-brand-navy">Location</dt>
                      <dd>{booking.locations?.name}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-brand-navy">When</dt>
                      <dd>
                        {format(
                          new Date(booking.scheduled_at),
                          "MMM d, yyyy · h:mm a",
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-brand-navy">Vehicle</dt>
                      <dd>
                        {booking.car_type} · {booking.license_plate}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-brand-navy">Phone</dt>
                      <dd>{booking.customer_phone}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-brand-navy">Amount</dt>
                      <dd>{formatCurrency(Number(booking.amount))}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex gap-2 text-xs">
                    <span className="rounded-full bg-brand-sky px-2 py-1 font-medium text-brand-navy">
                      {booking.status}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-brand-navy">
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
                <AdminBookingActions booking={booking} />
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
