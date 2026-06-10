export const REFUND_REASONS = [
  { value: "customer_not_satisfied", label: "Customer not satisfied with service" },
  { value: "customer_cancelled", label: "Customer cancelled or no-show" },
  { value: "wrong_booking", label: "Wrong service or location booked" },
  { value: "weather_facility", label: "Weather or facility issue" },
  { value: "duplicate_booking", label: "Duplicate booking" },
  { value: "staff_error", label: "Staff or scheduling error" },
  { value: "other", label: "Other" },
] as const;

export type RefundReasonValue = (typeof REFUND_REASONS)[number]["value"];

const STRIPE_REFUND_REASON_LABELS: Record<string, string> = {
  stripe_dashboard_refund: "Refunded in Stripe Dashboard",
  stripe_refund: "Refunded in Stripe",
};

export function formatRefundReason(reason: string, notes?: string | null) {
  const match = REFUND_REASONS.find((item) => item.value === reason);
  const label =
    match?.label ?? STRIPE_REFUND_REASON_LABELS[reason] ?? reason;

  if (reason === "other" && notes?.trim()) {
    return `${label}: ${notes.trim()}`;
  }

  return label;
}

export function validateRefundReason(reason: string, notes?: string) {
  const allowed = REFUND_REASONS.map((item) => item.value);
  if (!reason || !allowed.includes(reason as RefundReasonValue)) {
    return "Select a refund reason.";
  }

  if (reason === "other" && !notes?.trim()) {
    return "Add a short note when selecting Other.";
  }

  if (notes && notes.trim().length > 500) {
    return "Notes must be 500 characters or fewer.";
  }

  return null;
}
