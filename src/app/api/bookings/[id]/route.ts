import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/booking";
import { requireAdminUser } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "status or paymentStatus is required." },
        { status: 400 },
      );
    }

    const booking = await updateBookingStatus(id, status, paymentStatus);
    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed.";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
