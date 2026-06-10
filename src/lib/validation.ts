export type BookingCustomerFields = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  licensePlate: string;
};

export type BookingFieldErrors = Partial<
  Record<keyof BookingCustomerFields, string>
>;

export function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

export function isValidUsPhone(phone: string) {
  return normalizePhoneDigits(phone).length === 10;
}

export function validateBookingCustomerFields(
  fields: BookingCustomerFields,
): BookingFieldErrors {
  const errors: BookingFieldErrors = {};

  if (!fields.customerName.trim()) {
    errors.customerName = "Full name is required.";
  }

  if (!fields.customerEmail.trim()) {
    errors.customerEmail = "Email is required.";
  } else if (!isValidEmail(fields.customerEmail)) {
    errors.customerEmail = "Enter a valid email like name@example.com.";
  }

  if (!fields.customerPhone.trim()) {
    errors.customerPhone = "Phone number is required.";
  } else if (!isValidUsPhone(fields.customerPhone)) {
    errors.customerPhone = "Enter a 10-digit US phone number.";
  }

  if (!fields.licensePlate.trim()) {
    errors.licensePlate = "License plate is required.";
  } else if (fields.licensePlate.trim().length < 2) {
    errors.licensePlate = "License plate must be at least 2 characters.";
  }

  return errors;
}

export function hasValidationErrors(errors: BookingFieldErrors) {
  return Object.keys(errors).length > 0;
}
