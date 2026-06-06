import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/auth";
import { getBookingByCode } from "@/lib/booking";
import { CheckInPanel } from "@/components/CheckInPanel";

type CheckInPageProps = {
  searchParams: Promise<{ code?: string }>;
};

export default async function CheckInPage({ searchParams }: CheckInPageProps) {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const params = await searchParams;
  const initialBooking = params.code
    ? await getBookingByCode(params.code)
    : null;

  return (
    <Suspense>
      <CheckInPanel initialBooking={initialBooking} />
    </Suspense>
  );
}
