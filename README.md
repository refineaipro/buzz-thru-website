# Buzz Thru Car Wash Website

Online booking website for Buzz Thru Car Wash: three locations, 30-minute appointment slots, admin dashboard, and tablet check-in.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + Tailwind CSS |
| Design | UI UX Pro Max skill + navy/red brand palette |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (admin email/password) |
| Payments | Placeholder now → Stripe later |
| Deploy | Vercel |

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run the full script in `supabase/schema.sql`
3. Go to **Authentication → Users** and create an admin user (email + password)
4. Copy your project URL and keys from **Settings → API**

### 3. Configure environment

Copy `.env.example` to `.env` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> Without Supabase credentials, the site runs with **placeholder data** for locations/services. Bookings work in mock mode for UI testing.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Admin:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home |
| `/services` | Service list + placeholder pricing |
| `/locations` | Three locations with Google Maps |
| `/book` | Online booking wizard |
| `/about` | About page |
| `/faq` | FAQ |
| `/contact` | Contact (form UI placeholder) |
| `/confirmation/[id]` | Booking confirmation + QR code |
| `/admin` | Booking dashboard |
| `/admin/check-in` | Tablet check-in lookup |

## Booking Rules

- 30-minute time slots
- Mon–Sat, 8 AM – 6 PM (closed Sunday)
- Book up to **7 days** ahead
- Minimum **24 hours** advance notice
- Full payment at booking (placeholder until Stripe)
- Tax included in displayed prices

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add the same environment variables from `.env`
4. Set `NEXT_PUBLIC_SITE_URL` to your production domain (e.g. `https://buzzthru.com`)
5. Deploy — Vercel auto-builds on every push

### Custom domain

In Vercel → **Settings → Domains**, add your domain and update DNS records as instructed.

## Later Integrations

- **Stripe** — replace placeholder payment step in `/book`
- **Email (Resend/SendGrid)** — wire up `src/lib/email.ts` for confirmation emails with QR
- **Contact form** — connect `/contact` form submission

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| Navy | `#0B1D43` | Primary text, headers, nav |
| Red | `#E31E24` | CTA buttons, accents |
| Blue | `#3B82F6` | Links, highlights |
| Sky | `#EFF6FF` | Backgrounds, cards |
