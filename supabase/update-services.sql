-- Run in Supabase SQL Editor to refresh bookable wash packages

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

-- Optional: remove old placeholder packages if nothing references them
-- delete from services
-- where slug in ('express-buzz', 'deluxe-buzz', 'full-thru-clean', 'buzz-and-shine');
