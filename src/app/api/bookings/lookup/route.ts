import { NextRequest, NextResponse } from "next/server";
import { getBookingsByPhone, getBookingByCode } from "@/lib/booking";
import { requireAdminUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser();
    const phone = request.nextUrl.searchParams.get("phone");
    const code = request.nextUrl.searchParams.get("code");

    if (code) {
      const booking = await getBookingByCode(code);
      return NextResponse.json({ bookings: booking ? [booking] : [] });
    }

    if (phone) {
      const bookings = await getBookingsByPhone(phone);
      return NextResponse.json({ bookings });
    }

    return NextResponse.json(
      { error: "Phone number or confirmation code is required." },
      { status: 400 },
    );
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
}
