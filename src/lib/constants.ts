export const BUSINESS = {
  name: "Buzz Thru Car Wash",
  tagline: "Drive in dirty. Buzz out clean.",
  email: "buzz@buzzthrucarwash.com",
  phone: "(804) 910-1930",
} as const;

export const BOOKING_RULES = {
  slotIntervalMinutes: 30,
  openHour: 8,
  closeHour: 18,
  closedDays: [0] as number[],
  maxDaysAhead: 7,
  minAdvanceHours: 24,
} as const;

export const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Truck",
  "Van",
  "Compact",
  "Other",
] as const;
