"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CAR_TYPES } from "@/lib/constants";
import {
  INSIDE_OUTSIDE_WASHES,
  OUTSIDE_ONLY_WASHES,
} from "@/lib/services-catalog";
import type { Location, Service } from "@/lib/types";
import {
  formatPhoneInput,
  hasValidationErrors,
  type BookingFieldErrors,
  validateBookingCustomerFields,
} from "@/lib/validation";
import { cn, formatCurrency } from "@/lib/utils";

type TimeSlot = {
  value: string;
  label: string;
  available: boolean;
};

type BookingWizardProps = {
  locations: Location[];
  services: Service[];
  initialLocationId?: string;
  initialServiceSlug?: string;
  stripeEnabled?: boolean;
  cancelled?: boolean;
};

const steps = ["Location", "Service", "Date & Time", "Details", "Payment"];

export function BookingWizard({
  locations,
  services,
  initialLocationId,
  initialServiceSlug,
  stripeEnabled = false,
  cancelled = false,
}: BookingWizardProps) {
  const [step, setStep] = useState(0);
  const [locationId, setLocationId] = useState(initialLocationId ?? "");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSlot, setCheckingSlot] = useState(false);
  const [error, setError] = useState("");
  const [bookableDates, setBookableDates] = useState<string[]>([]);
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    carType: CAR_TYPES[0] as string,
    licensePlate: "",
  });

  const selectedLocation = locations.find((l) => l.id === locationId);
  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    if (!initialServiceSlug || serviceId) return;
    const match = services.find((service) => service.slug === initialServiceSlug);
    if (match) setServiceId(match.id);
  }, [initialServiceSlug, serviceId, services]);

  useEffect(() => {
    fetch("/api/slots/dates")
      .then((res) => res.json())
      .then((data) => setBookableDates(data.dates ?? []))
      .catch(() => setError("Could not load available dates."));
  }, []);

  useEffect(() => {
    if (!locationId || !date) return;

    setLoadingSlots(true);
    fetch(`/api/slots?locationId=${locationId}&date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        setTime("");
      })
      .catch(() => setError("Could not load time slots."))
      .finally(() => setLoadingSlots(false));
  }, [locationId, date]);

  const detailsErrors = useMemo(
    () =>
      validateBookingCustomerFields({
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        licensePlate: form.licensePlate,
      }),
    [form],
  );

  const canContinue = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(locationId);
      case 1:
        return Boolean(serviceId);
      case 2:
        return Boolean(date && time);
      case 3:
        return !hasValidationErrors(detailsErrors);
      default:
        return true;
    }
  }, [step, locationId, serviceId, date, time, detailsErrors]);

  async function refreshSlotsForSelectedDate() {
    if (!locationId || !date) return [];

    const response = await fetch(
      `/api/slots?locationId=${locationId}&date=${date}`,
    );
    const data = await response.json();
    const nextSlots = data.slots ?? [];
    setSlots(nextSlots);
    return nextSlots as TimeSlot[];
  }

  async function ensureSelectedSlotAvailable() {
    if (!locationId || !date || !time) return false;

    setCheckingSlot(true);
    try {
      const nextSlots = await refreshSlotsForSelectedDate();
      const slot = nextSlots.find((item) => item.value === time);
      if (!slot?.available) {
        setTime("");
        setError("That time slot is no longer available. Please pick another time.");
        setStep(2);
        return false;
      }
      return true;
    } catch {
      setError("Could not verify slot availability. Please try again.");
      return false;
    } finally {
      setCheckingSlot(false);
    }
  }

  async function handleContinue() {
    setError("");

    if (step === 2) {
      const slotAvailable = await ensureSelectedSlotAvailable();
      if (!slotAvailable) return;
    }

    if (step === 3) {
      if (hasValidationErrors(detailsErrors)) {
        return;
      }

      const slotAvailable = await ensureSelectedSlotAvailable();
      if (!slotAvailable) return;
    }

    setStep((prev) => prev + 1);
  }

  async function handleSubmit() {
    if (hasValidationErrors(detailsErrors)) {
      setStep(3);
      return;
    }

    setSubmitting(true);
    setError("");

    const slotAvailable = await ensureSelectedSlotAvailable();
    if (!slotAvailable) {
      setSubmitting(false);
      return;
    }

    const payload = {
      locationId,
      serviceId,
      scheduledAt: time,
      ...form,
      licensePlate: form.licensePlate.toUpperCase(),
    };

    try {
      const endpoint = stripeEnabled ? "/api/checkout" : "/api/bookings";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Booking failed.");

      if (stripeEnabled && data.url) {
        window.location.href = data.url;
        return;
      }

      window.location.href = `/confirmation/${data.booking.id}?code=${data.booking.confirmation_code}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      {cancelled ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Payment was cancelled. Your appointment was not booked. Pick a time and
          try again when you are ready.
        </div>
      ) : null}

      <div className="mb-8 flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <div
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              index === step
                ? "bg-brand-navy text-white"
                : index < step
                  ? "bg-brand-blue text-white"
                  : "bg-brand-sky text-brand-navy",
            )}
          >
            {index + 1}. {label}
          </div>
        ))}
      </div>

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {step === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => setLocationId(location.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-colors duration-200",
                locationId === location.id
                  ? "border-brand-navy bg-brand-sky"
                  : "border-blue-100 hover:border-brand-blue",
              )}
            >
              <h3 className="font-semibold text-brand-navy">{location.name}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {location.address}, {location.city}
              </p>
            </button>
          ))}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-8">
          {[
            { title: "Inside & Outside Cleaning", packages: INSIDE_OUTSIDE_WASHES },
            { title: "Outside Only Cleaning", packages: OUTSIDE_ONLY_WASHES },
          ].map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
                {group.title}
              </h3>
              <div className="mt-4 space-y-4">
                {group.packages.map((pkg) => {
                  const service = services.find((item) => item.slug === pkg.slug);
                  if (!service) return null;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setServiceId(service.id)}
                      className={cn(
                        "flex w-full items-start justify-between gap-4 rounded-2xl border p-5 text-left transition-colors duration-200",
                        serviceId === service.id
                          ? "border-brand-navy bg-brand-sky"
                          : "border-blue-100 hover:border-brand-blue",
                      )}
                    >
                      <div>
                        <h4 className="font-semibold text-brand-navy">{service.name}</h4>
                        <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                        <ul className="mt-3 space-y-1">
                          {pkg.features.slice(0, 4).map((feature) => (
                            <li key={feature} className="text-xs text-slate-500">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <span className="shrink-0 text-lg font-bold text-brand-red">
                        {formatCurrency(service.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-sm text-slate-500">
            Mini Detail, Pro Wax, and Combo packages are available at the location.{" "}
            <a href="/contact" className="font-semibold text-brand-navy hover:opacity-80">
              Contact us
            </a>{" "}
            to learn more.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-brand-navy">Date</label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 text-sm"
            >
              <option value="">Select a date</option>
              {bookableDates.map((value) => (
                <option key={value} value={value}>
                  {format(new Date(`${value}T12:00:00`), "EEEE, MMM d")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-brand-navy">Time</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {loadingSlots ? (
                <p className="col-span-3 text-sm text-slate-500">Loading slots...</p>
              ) : slots.length ? (
                slots.map((slot) => (
                  <button
                    key={slot.value}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTime(slot.value)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-medium transition-colors duration-200",
                      !slot.available && "cursor-not-allowed opacity-40",
                      time === slot.value
                        ? "bg-brand-navy text-white"
                        : slot.available
                          ? "bg-brand-sky text-brand-navy hover:bg-brand-blue hover:text-white"
                          : "bg-slate-100 text-slate-400",
                    )}
                  >
                    {slot.label}
                  </button>
                ))
              ) : (
                <p className="col-span-3 text-sm text-slate-500">
                  Select a date to see available times.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div>
          {hasValidationErrors(detailsErrors) ? (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Please fix the highlighted fields below before continuing.
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              key: "customerName",
              label: "Full Name",
              type: "text",
              placeholder: "Jane Smith",
              autoComplete: "name",
            },
            {
              key: "customerEmail",
              label: "Email",
              type: "email",
              placeholder: "name@example.com",
              autoComplete: "email",
            },
            {
              key: "customerPhone",
              label: "Phone",
              type: "tel",
              placeholder: "(804) 555-1234",
              autoComplete: "tel",
            },
            {
              key: "licensePlate",
              label: "License Plate",
              type: "text",
              placeholder: "ABC1234",
              autoComplete: "off",
            },
          ].map((field) => (
            <div
              key={field.key}
              className={field.key === "customerName" ? "sm:col-span-2" : ""}
            >
              <label className="text-sm font-medium text-brand-navy">
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key as keyof typeof form]}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                onChange={(e) => {
                  const value =
                    field.key === "customerPhone"
                      ? formatPhoneInput(e.target.value)
                      : field.key === "licensePlate"
                        ? e.target.value.toUpperCase()
                        : e.target.value;

                  setForm((prev) => ({ ...prev, [field.key]: value }));
                }}
                className={cn(
                  "mt-2 w-full rounded-lg border px-4 py-3 text-sm",
                  detailsErrors[field.key as keyof BookingFieldErrors]
                    ? "border-red-300 bg-red-50"
                    : "border-blue-100",
                )}
              />
              {detailsErrors[field.key as keyof BookingFieldErrors] ? (
                <p className="mt-1 text-xs text-red-600">
                  {detailsErrors[field.key as keyof BookingFieldErrors]}
                </p>
              ) : null}
            </div>
          ))}
          <div>
            <label className="text-sm font-medium text-brand-navy">Car Type</label>
            <select
              value={form.carType}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, carType: e.target.value }))
              }
              className="mt-2 w-full rounded-lg border border-blue-100 px-4 py-3 text-sm"
            >
              {CAR_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          </div>
        </div>
      ) : null}

      {step === 4 && selectedLocation && selectedService ? (
        <Card>
          <h3 className="text-lg font-semibold text-brand-navy">Order Summary</h3>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Location</dt>
              <dd className="font-medium">{selectedLocation.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Service</dt>
              <dd className="font-medium">{selectedService.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Date & Time</dt>
              <dd className="font-medium">
                {time ? format(new Date(time), "MMM d, yyyy · h:mm a") : "Not selected"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Vehicle</dt>
              <dd className="font-medium">
                {form.carType} · {form.licensePlate.toUpperCase()}
              </dd>
            </div>
            <div className="flex justify-between border-t border-blue-100 pt-3 text-base">
              <dt className="font-semibold text-brand-navy">Total (tax incl.)</dt>
              <dd className="font-bold text-brand-red">
                {formatCurrency(selectedService.price)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 rounded-lg bg-brand-sky px-4 py-3 text-sm text-slate-600">
            {stripeEnabled
              ? "Your time slot is held for 30 minutes once you click Pay with Stripe. The appointment is confirmed after payment completes."
              : "Payment is in test mode without Stripe. Clicking confirm creates a mock booking."}
          </p>
        </Card>
      ) : null}

      <div className="mt-8 flex justify-between gap-4">
        <Button
          variant="secondary"
          onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
          disabled={step === 0 || submitting}
        >
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button
            onClick={handleContinue}
            disabled={!canContinue || checkingSlot}
          >
            {checkingSlot ? "Checking slot..." : "Continue"}
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? stripeEnabled
                ? "Redirecting..."
                : "Confirming..."
              : stripeEnabled
                ? "Pay with Stripe"
                : "Confirm & Pay"}
          </Button>
        )}
      </div>
    </div>
  );
}
