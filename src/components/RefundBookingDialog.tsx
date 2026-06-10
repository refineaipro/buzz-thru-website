"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Booking } from "@/lib/types";
import { REFUND_REASONS, validateRefundReason } from "@/lib/refund-reasons";
import { formatCurrency } from "@/lib/utils";

type RefundBookingDialogProps = {
  booking: Booking;
  open: boolean;
  loading: boolean;
  error?: string;
  onClose: () => void;
  onConfirm: (reason: string, notes: string) => void;
};

export function RefundBookingDialog({
  booking,
  open,
  loading,
  error,
  onClose,
  onConfirm,
}: RefundBookingDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [validationError, setValidationError] = useState("");

  if (!open) return null;

  function resetAndClose() {
    setReason("");
    setNotes("");
    setConfirmed(false);
    setValidationError("");
    onClose();
  }

  function handleSubmit() {
    const message = validateRefundReason(reason, notes);
    if (message) {
      setValidationError(message);
      return;
    }

    if (!confirmed) {
      setValidationError("Confirm that you want to process this refund.");
      return;
    }

    setValidationError("");
    onConfirm(reason, notes);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-brand-navy/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close refund dialog"
        className="absolute inset-0"
        onClick={resetAndClose}
      />

      <Card className="relative z-10 w-full max-w-lg">
        <h3 className="text-lg font-semibold text-brand-navy">Refund Booking</h3>
        <p className="mt-2 text-sm text-slate-600">
          This will refund {formatCurrency(Number(booking.amount))} to{" "}
          {booking.customer_name} through Stripe and cancel the appointment.
        </p>

        <dl className="mt-4 space-y-2 rounded-xl bg-brand-light p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Confirmation</dt>
            <dd className="font-mono font-medium">{booking.confirmation_code}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">Service</dt>
            <dd className="font-medium">{booking.services?.name}</dd>
          </div>
        </dl>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor={`refund-reason-${booking.id}`}
              className="text-sm font-medium text-brand-navy"
            >
              Refund reason
            </label>
            <select
              id={`refund-reason-${booking.id}`}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setValidationError("");
              }}
              className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 text-sm"
            >
              <option value="">Select a reason</option>
              {REFUND_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {reason === "other" ? (
            <div>
              <label
                htmlFor={`refund-notes-${booking.id}`}
                className="text-sm font-medium text-brand-navy"
              >
                Additional details
              </label>
              <textarea
                id={`refund-notes-${booking.id}`}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setValidationError("");
                }}
                rows={3}
                placeholder="Briefly explain why this booking is being refunded."
                className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 text-sm"
              />
            </div>
          ) : (
            <div>
              <label
                htmlFor={`refund-notes-optional-${booking.id}`}
                className="text-sm font-medium text-brand-navy"
              >
                Notes (optional)
              </label>
              <textarea
                id={`refund-notes-optional-${booking.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional internal note for your records."
                className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 text-sm"
              />
            </div>
          )}

          <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                setValidationError("");
              }}
              className="mt-1"
            />
            <span>
              I confirm this refund should be processed. The customer will receive
              the money back and this time slot will be cancelled.
            </span>
          </label>
        </div>

        {validationError ? (
          <p className="mt-4 text-sm text-red-600">{validationError}</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={resetAndClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Processing refund..." : "Process Refund"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
