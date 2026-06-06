import { NextResponse } from "next/server";
import { format } from "date-fns";
import { getBookableDates } from "@/lib/slots";

export async function GET() {
  const dates = getBookableDates().map((date) => format(date, "yyyy-MM-dd"));
  return NextResponse.json({ dates });
}
