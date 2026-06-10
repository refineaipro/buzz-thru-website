import type { Location, Service } from "@/lib/types";
import { BOOKABLE_WASHES } from "@/lib/services-catalog";

export const PLACEHOLDER_LOCATIONS: Location[] = [
  {
    id: "loc-hull-street",
    name: "Buzz Thru - Hull Street",
    slug: "hull-street",
    address: "3704 Hull St",
    city: "Richmond",
    state: "VA",
    zip: "23224",
    phone: "(804) 910-1930",
    lat: 37.5044,
    lng: -77.4694,
    hours: "Open 24 hours",
  },
  {
    id: "loc-midlothian",
    name: "Buzz Thru - Midlothian Turnpike",
    slug: "midlothian-turnpike",
    address: "5223 Midlothian Turnpike",
    city: "Richmond",
    state: "VA",
    zip: "23225",
    phone: "(804) 910-1930",
    lat: 37.4974,
    lng: -77.5018,
    hours: "Open 24 hours",
  },
  {
    id: "loc-broad-rock",
    name: "Buzz Thru - Broad Rock Blvd",
    slug: "broad-rock-blvd",
    address: "2869 Broad Rock Blvd",
    city: "Richmond",
    state: "VA",
    zip: "23224",
    phone: "(804) 910-1930",
    lat: 37.4785,
    lng: -77.4809,
    hours: "Open 24 hours",
  },
];

export const PLACEHOLDER_SERVICES: Service[] = BOOKABLE_WASHES.map((wash, index) => ({
  id: `svc-${wash.slug}`,
  name: wash.name,
  slug: wash.slug,
  description: wash.features.slice(0, 2).join(". ") + ".",
  price: wash.price,
  duration_minutes: 30,
  featured: index < 2,
}));

export const FAQ_ITEMS = [
  {
    question: "How far in advance can I book?",
    answer:
      "You can book up to 7 days ahead. All appointments must be scheduled at least 24 hours in advance.",
  },
  {
    question: "What are your hours?",
    answer:
      "All three Richmond locations are open 24 hours. Online appointments are available Monday through Saturday, 8:00 AM to 6:00 PM.",
  },
  {
    question: "Can I cancel or reschedule?",
    answer:
      "Contact us at least 24 hours before your appointment and our team will help you reschedule.",
  },
  {
    question: "Do prices include tax?",
    answer: "Yes. All listed service prices include tax. No surprises at checkout.",
  },
  {
    question: "How does check-in work?",
    answer:
      "Show your confirmation email with QR code at the location, or give staff your phone number. They'll pull up your booking instantly.",
  },
  {
    question: "Is payment required when booking?",
    answer:
      "Yes, full payment is collected at the time of booking through Stripe. Your appointment is confirmed after payment is complete.",
  },
];
