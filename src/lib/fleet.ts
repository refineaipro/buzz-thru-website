import { BUSINESS } from "@/lib/constants";

export const FLEET_INFO = {
  title: "Fleet Washing",
  description:
    "Keep your company vehicles looking professional with regular fleet washing from Buzz Thru. We work with businesses of all sizes across Richmond.",
  highlights: [
    "Consistent quality for cars, vans, and trucks",
    "Flexible scheduling for your team or entire fleet",
    "Hand-finished washes by our trained attendants",
    "Multiple Richmond locations",
  ],
  cta: `Contact us at ${BUSINESS.email} for pricing, availability, and custom fleet plans.`,
} as const;
