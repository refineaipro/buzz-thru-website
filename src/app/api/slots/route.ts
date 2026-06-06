import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const locationId = request.nextUrl.searchParams.get("locationId");
  const date = request.nextUrl.searchParams.get("date");

  if (!locationId || !date) {
    return NextResponse.json(
      { error: "locationId and date are required." },
      { status: 400 },
    );
  }

  const slots = await getAvailableSlots(locationId, date);
  return NextResponse.json({ slots });
}
