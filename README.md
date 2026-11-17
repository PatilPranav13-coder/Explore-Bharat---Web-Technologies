# Explore Bharat

Explore Bharat is a travel discovery and custom itinerary website concept focused on India.

## Live website

The GitHub Pages frontend is published from the repository root:

**https://patilpranav13-coder.github.io/Explore-Bharat---Web-Technologies/**

The root `index.html`, `styles.css`, `app.js`, `privacy.html` and `terms.html` files mirror the updated v2 website so GitHub Pages can serve the design directly. The original ZIP and complete source folder are preserved.

## Website features

- Responsive destination discovery with filters and expandable destination details.
- Three-step custom trip builder.
- Tour package cards and a horizontally scrollable package rail.
- Website search with local destination/section results.
- Bharat AI assistant with a local website-guide fallback.
- Persistent browser cart with traveller quantities.
- Profile, travel-log and booking-history interface.
- Privacy and terms pages, mobile navigation and reduced-motion support.

## GitHub Pages limitations

GitHub Pages serves static HTML, CSS and JavaScript. Browser-side browsing, planning and cart features work on the static site. The following features require the Node.js backend and their own configuration, and are not activated by GitHub Pages alone:

- OpenAI-powered Bharat AI and live web search.
- Server-stored trip enquiries.
- Supabase passwordless sign-in and saved profile/travel history (also requires the public Supabase URL and anon key in `config.js`).
- Razorpay test checkout and server-verified booking records.

The backend is in `explore-bharat-v2/server.js`. It must be deployed separately with private environment variables. Razorpay live payments are deliberately not enabled; the integration is test-mode only.

## Run the full application locally

Requires Node.js 20 or newer.

```bash
cd explore-bharat-v2
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000. Add `OPENAI_API_KEY` to `.env` to enable Bharat AI and live web search, and `DATABASE_URL` to enable server-side enquiry and checkout storage.

See [the v2 README](explore-bharat-v2/README.md) for configuration and backend setup.
