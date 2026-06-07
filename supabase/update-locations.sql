-- Run in Supabase SQL Editor to add the Broad Rock Blvd location

insert into locations (name, slug, address, city, state, zip, phone, lat, lng, hours) values
  ('Buzz Thru - Broad Rock Blvd', 'broad-rock-blvd', '2869 Broad Rock Blvd', 'Richmond', 'VA', '23224', '(804) 910-1930', 37.5142, -77.4591, 'Open 24 hours')
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
