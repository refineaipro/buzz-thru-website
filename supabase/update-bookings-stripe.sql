-- Run in Supabase SQL Editor if bookings table already exists.

alter table bookings
  add column if not exists stripe_payment_intent_id text;

alter table bookings
  add column if not exists refund_reason text;

alter table bookings
  add column if not exists refund_notes text;

alter table bookings
  add column if not exists refunded_at timestamptz;
