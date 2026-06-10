export type Location = {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  lat: number;
  lng: number;
  hours: string;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration_minutes: number;
  featured: boolean;
};

export type Booking = {
  id: string;
  confirmation_code: string;
  location_id: string;
  service_id: string;
  scheduled_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  car_type: string;
  license_plate: string;
  status: string;
  payment_status: string;
  stripe_payment_intent_id?: string | null;
  refund_reason?: string | null;
  refund_notes?: string | null;
  refunded_at?: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
  locations?: Location;
  services?: Service;
};

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "no_show";

export type PaymentStatus = "pending" | "paid" | "refunded";

export type CreateBookingInput = {
  locationId: string;
  serviceId: string;
  scheduledAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carType: string;
  licensePlate: string;
};
