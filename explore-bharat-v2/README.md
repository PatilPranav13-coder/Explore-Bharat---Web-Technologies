# Explore Bharat v2

A refined India travel discovery site with an interactive destination catalogue, custom trip builder, guided traveller registration, server-side AI travel assistant and web search. The visual language is inspired by the restrained typography, silver finishes, soft blue accents and generous spacing of premium hardware product pages.

## Features

- Editorial-style homepage, responsive navigation and a moving announcement ticker.
- Destination category filters and expandable place cards with planning notes.
- Three-step trip builder for destinations, dates, duration, group size, interests, budget and travel style.
- Guided traveller registration with contact channel preference, phone country code, consent, validation and an itinerary summary.
- Package cards that prefill the trip builder.
- Always-visible navigation search with quick section links, website-feature guidance and, when configured, live web search with source links.
- Bharat AI website guide using the OpenAI Responses API. It explains navigation, destination cards, the trip builder, packages and the traveller enquiry flow; the API key stays on the Node server.
- Optional PostgreSQL storage for trip enquiries. Without a database, the demo keeps enquiries only in the visitor's browser.
- FAQ, privacy and terms pages, responsive layout, keyboard-friendly controls, reduced-motion support and basic security headers.
- Explicit enquiry consent and clear demo-versus-server storage messaging.

## Run locally

Requires Node.js 20 or newer.

```bash
cd explore-bharat-v2
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## Enable AI chat and live web search

1. Create an API key in the OpenAI Platform.
2. Put it in `OPENAI_API_KEY` in your local `.env` file or your hosting provider's secret environment variables.
3. Keep the key private. Do not put it in `app.js`, HTML, or any `VITE_*`/public variable.
4. `OPENAI_MODEL` defaults to `gpt-6-luna`; a compatible Responses API model can be selected via the environment variable.

The AI assistant uses `POST /api/chat`. The live search panel uses `POST /api/search` with the Responses API web-search tool. Both require an API key and can incur API charges. A small local destination-guide fallback remains available when AI is not configured.

## Save real trip enquiries (optional)

Set `DATABASE_URL` to a PostgreSQL connection string in the server environment. Set `DATABASE_SSL=true` when the provider requires TLS. The server creates a `trip_enquiries` table on startup and accepts enquiries at `POST /api/enquiries`.

If no database is configured, the contact form explicitly reports that the enquiry was saved only in the visitor's browser. It is not sent to a travel agency. Connect an email/CRM provider and publish a privacy notice before collecting real customer details in production.

## Important demo notes

- Package prices are illustrative examples, not bookable or verified live offers.
- No payments, reservations, tickets, inventory or live hotel/transport availability are processed.
- The newsletter form is a front-end demonstration and does not subscribe an address.
- Review travel advice, permits, weather, opening hours and safety with official/local sources before a trip.
- Photos are loaded from Unsplash URLs and Google Fonts are loaded from Google Fonts; provide locally hosted assets if offline use is required.

## Main files

- `index.html` — page structure and content
- `styles.css` — responsive visual design
- `app.js` — filters, form state, search UI and AI chat
- `server.js` — Express API, OpenAI integration and optional PostgreSQL persistence
