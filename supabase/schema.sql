-- Buzz Thru Car Wash: run in Supabase SQL Editor

create extension if not exists "pgcrypto";

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  phone text not null,
  lat double precision not null,
  lng double precision not null,
  hours text not null default 'Mon–Sat: 8:00 AM – 6:00 PM · Closed Sunday',
  created_at timestamptz not null default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null,
  price numeric(10, 2) not null,
  duration_minutes integer not null default 30,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  confirmation_code text unique not null,
  location_id uuid not null references locations(id),
  service_id uuid not null references services(id),
  scheduled_at timestamptz not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  car_type text not null,
  license_plate text not null,
  status text not null default 'confirmed',
  payment_status text not null default 'paid',
  stripe_payment_intent_id text,
  refund_reason text,
  refund_notes text,
  refunded_at timestamptz,
  amount numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_scheduled_at_idx on bookings (scheduled_at);
create index if not exists bookings_customer_phone_idx on bookings (customer_phone);
create index if not exists bookings_location_scheduled_idx on bookings (location_id, scheduled_at);

alter table locations enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;

create policy "Public read locations"
  on locations for select
  to anon, authenticated
  using (true);

create policy "Public read services"
  on services for select
  to anon, authenticated
  using (true);

create policy "Admin read bookings"
  on bookings for select
  to authenticated
  using (true);

create policy "Admin update bookings"
  on bookings for update
  to authenticated
  using (true);

-- Real location data (Richmond, VA)
insert into locations (name, slug, address, city, state, zip, phone, lat, lng, hours) values
  ('Buzz Thru - Hull Street', 'hull-street', '3704 Hull St', 'Richmond', 'VA', '23224', '(804) 910-1930', 37.5044, -77.4694, 'Open 24 hours'),
  ('Buzz Thru - Midlothian Turnpike', 'midlothian-turnpike', '5223 Midlothian Turnpike', 'Richmond', 'VA', '23225', '(804) 910-1930', 37.4974, -77.5018, 'Open 24 hours'),
  ('Buzz Thru - Broad Rock Blvd', 'broad-rock-blvd', '2869 Broad Rock Blvd', 'Richmond', 'VA', '23224', '(804) 910-1930', 37.4785, -77.4809, 'Open 24 hours')
on conflict (slug) do update set
  name = excluded.name,
  address = excluded.address,
  city = excluded.city,
  state = excluded.state,
  zip = excluded.zip,
  phone = excluded.phone,
  lat = excluded.lat,
  lng = excluded.lng,
  hours = excluded.hours;

insert into services (name, slug, description, price, duration_minutes, featured) values
  ('RVA Ceramic Shine', 'rva-ceramic-shine', 'Full inside and outside hand-finished wash with ceramic sealant.', 45.95, 30, true),
  ('Extreme Hot Wax', 'extreme-hot-wax', 'Full inside and outside wash with Simoniz hot wax.', 35.45, 30, true),
  ('Rainbow', 'rainbow', 'Full inside and outside wash with double bond wax.', 28.95, 30, false),
  ('Ultimate', 'ultimate', 'Outside-only wash with ceramic sealant and tire shine.', 18.95, 30, false),
  ('Deluxe', 'deluxe', 'Outside-only wash with hot wax and tire shine.', 15.95, 30, false),
  ('Quick', 'quick', 'Outside-only quick wash with double bond wax.', 12.95, 30, false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  duration_minutes = excluded.duration_minutes,
  featured = excluded.featured;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists bookings_updated_at on bookings;
create trigger bookings_updated_at
  before update on bookings
  for each row execute function update_updated_at();
