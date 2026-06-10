import { NextRequest, NextResponse } from "next/server";
import { refundBooking, updateBookingStatus } from "@/lib/booking";
import { requireAdminUser } from "@/lib/auth";
import { validateRefundReason } from "@/lib/refund-reasons";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminUser();
    const { id } = await params;
    const body = await request.json();
    const { status, paymentStatus, refundReason, refundNotes } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "status or paymentStatus is required." },
        { status: 400 },
      );
    }

    if (paymentStatus === "refunded") {
      const reasonError = validateRefundReason(
        String(refundReason ?? ""),
        refundNotes ? String(refundNotes) : undefined,
      );

      if (reasonError) {
        return NextResponse.json({ error: reasonError }, { status: 400 });
      }

      const booking = await refundBooking(
        id,
        String(refundReason),
        refundNotes ? String(refundNotes) : undefined,
      );
      return NextResponse.json({ booking });
    }

    if (!status) {
      return NextResponse.json(
        { error: "status is required for this update." },
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
