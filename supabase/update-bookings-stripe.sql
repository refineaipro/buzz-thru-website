-- Run in Supabase SQL Editor if bookings table already exists.

alter table bookings
  add column if not exists stripe_payment_intent_id text;

alter table bookings
  add column if not exists stripe_checkout_session_id text;

alter table bookings
  add column if not exists stripe_refund_id text;

alter table bookings
  add column if not exists refund_reason text;

alter table bookings
  add column if not exists refund_notes text;

alter table bookings
  add column if not exists refunded_at timestamptz;

alter table bookings
  add column if not exists paid_at timestamptz;

alter table bookings
  add column if not exists checked_in_at timestamptz;

alter table bookings
  add column if not exists completed_at timestamptz;

-- Backfill paid_at for existing paid bookings.
update bookings
set paid_at = coalesce(paid_at, updated_at, created_at)
where payment_status = 'paid' and paid_at is null;

create unique index if not exists bookings_active_slot_idx
  on bookings (location_id, scheduled_at)
  where status not in ('cancelled');

create table if not exists stripe_webhook_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
