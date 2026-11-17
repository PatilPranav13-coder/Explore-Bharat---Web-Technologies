# Explore Bharat v2

A premium India travel discovery and package-booking prototype with an Apple-inspired Starlight visual system, smooth motion, horizontal package rail, persistent cart, traveller checkout, secure profiles and travel history.

## Experience

- Always-visible search in the navigation, with section shortcuts and live search when OpenAI is configured.
- Destination categories and expandable photo cards.
- Three-step custom trip builder for destinations, dates, traveller counts, interests, budget and travel style.
- Horizontal tour-package rail with accessible previous/next controls and native touch/trackpad scrolling.
- Add-to-cart actions on packages. Cart is saved in the visitor's browser and supports traveller quantity changes/removal.
- Profile area with passwordless email sign-in, name/mobile details, confirmed booking history and a private manual travel log.
- Traveller checkout form and Razorpay Standard Checkout integration restricted to **test keys**.
- Server-side package price validation, order creation, HMAC payment-signature verification, payment-status check and idempotent booking creation.
- Razorpay captured-payment webhook endpoint.
- Staggered section reveals, card transitions, cart feedback and reduced-motion support.
- Bharat AI website guide explaining the destination explorer, trip builder, cart, profile and checkout.

## Run locally

Requires Node.js 20 or newer.

```bash
cd explore-bharat-v2
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## 1. Enable secure profile and travel history (Supabase)

1. Create a Supabase project.
2. Open the Supabase SQL Editor and run `supabase/schema.sql`.
3. In Supabase Auth, enable email sign-in / magic links and add your local and deployed site URLs to the allowed redirect URLs.
4. Copy the values from `config.example.js` into `config.js`. Set `SUPABASE_URL` and the **anon/public** key only.
5. Never put the Supabase `service_role` key in the browser.

The profile uses passwordless email sign-in. The visitor can save name and mobile number, read bookings associated with the same verified email address, and add/remove visited destinations. Row Level Security policies restrict profiles and travel logs to the signed-in user. Booking rows are read-only to users and can only be created by the server after a verified captured payment.

## 2. Enable Razorpay test checkout

This project deliberately rejects live Razorpay keys. It is a checkout integration prototype, not a live travel merchant.

1. Create a Razorpay account and use its **test-mode** key ID and key secret.
2. Configure a PostgreSQL connection string in `DATABASE_URL`. It can point at the same Supabase Postgres project. Set `DATABASE_SSL=true` if your provider requires TLS.
3. Add `RAZORPAY_KEY_ID=rzp_test_...` and `RAZORPAY_KEY_SECRET` to the server's private environment.
4. Optionally configure a Razorpay webhook for the `payment.captured` event at `/api/payments/webhook`, and set `RAZORPAY_WEBHOOK_SECRET`.
5. Restart the server and check `/api/health` to confirm payments are configured in test mode.

The browser sends only package IDs and quantities. The server recalculates prices from its own catalogue, creates the Razorpay order, validates the returned HMAC signature, fetches the payment status, and records a booking only when payment is captured. The payment amount is shown in INR in Razorpay test mode; test cards/UPI are provided by Razorpay documentation.

**Important:** the three displayed package prices are demonstration amounts from the original concept. They are not real tour prices, availability or an offer. Do not enable live payments or present these as purchasable travel services. Before any live launch, replace the catalogue with verified operator-approved inclusions, dates, availability, taxes, cancellation/refund terms, business identity and customer support; implement production monitoring and fulfilment.

## 3. Enable Bharat AI and live search

Set `OPENAI_API_KEY` on the server. The API key must never be added to `app.js`, `config.js`, HTML or any public variable. `OPENAI_MODEL` can select a compatible Responses API model.

## Data and privacy notes

- Guest carts are kept in local browser storage.
- Account profiles and travel logs use Supabase Auth and Row Level Security.
- Checkout sessions and verified bookings use PostgreSQL server-side storage.
- The profile shows bookings for the authenticated email address.
- The travel log is a personal, manually maintained record; the site does not track users' GPS location.
- A test payment can create a clearly labelled sample booking in the database. It does not reserve a real tour.
- Before public use, review the privacy notice, retention and deletion process, terms, support contact and applicable data-protection requirements.

## Main files

- `index.html` — page, navigation, cart/profile/checkout views
- `styles.css` — Starlight visual system, responsive layout and motion
- `app.js` — cart, checkout, Supabase profile, travel log, search and AI guide
- `server.js` — Express API, OpenAI, Razorpay test orders and payment verification
- `supabase/schema.sql` — database tables and Row Level Security policies
- `config.js` — public Supabase URL/anon key placeholder (never store private secrets here)
