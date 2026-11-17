# Explore Bharat

Explore Bharat is a travel discovery and custom itinerary website concept focused on India.

## New version

The refreshed responsive website and Node.js backend are in **[explore-bharat-v2/](explore-bharat-v2/)**.

It includes:
- Destination discovery with filters and expandable destination details.
- A three-step custom trip builder that carries visitor selections into an enquiry form.
- Tour-package starting points, indicative price ranges and seasonal-offer enquiry prompts.
- Destination search with optional live web search and source links.
- Bharat AI travel assistant powered by the OpenAI Responses API.
- Optional PostgreSQL enquiry storage, consent checkbox, privacy and terms pages.
- Persistent cart with traveller quantities, always-visible profile/cart navigation, Supabase passwordless profiles, private travel logs and booking history.
- Razorpay test-mode checkout with server-calculated totals, payment signature/status verification and payment-confirmed booking records.
- Horizontal package rail, accessible scroll controls and site-wide section/card motion with reduced-motion support.
- Mobile-responsive design, accessibility improvements and smoke checks.

## Run the new website

Requires Node.js 20 or newer.

```bash
cd explore-bharat-v2
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

Add `OPENAI_API_KEY` to `.env` to enable Bharat AI and live web search. Add `DATABASE_URL` to enable server-side trip enquiries. The original `Explore-Bharat-GitHub-Upload.zip` is preserved in the repository.

See [the v2 README](explore-bharat-v2/README.md) for setup and deployment notes.
