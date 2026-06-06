import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function formatPhoneDisplay(phone: string) {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function getGoogleMapsPlaceUrl(location: {
  address: string;
  city: string;
  state: string;
  zip: string;
}) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${location.address}, ${location.city}, ${location.state} ${location.zip}`,
  )}`;
}
