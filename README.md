# Explore Bharat + Veya Data Studio

The original Explore Bharat home page remains at `/` with its existing `index.html` and `style.css`. Open the data analysis workspace at `/studio.html`; it uses its own `studio.css` and includes a photo from the existing project assets.

Veya is a local-first workspace for exploring datasets, asking calculation-grounded questions, and keeping analysis notes together. The interface adapts from a compact phone layout to a multi-panel studio, with feature detection for segmented foldable displays.

## Name and visual identity

**Veya** is a short, pronounceable name chosen to leave room for both visual exploration and analytical work. Its mark combines a clean V-shaped path with a small point and a quiet lilac accent. The palette uses charcoal, warm off-white, lilac, and soft mint; the app relies on system fonts and makes no third-party font request.

## Start locally

Requirements: Node.js 22.13 or newer.

1. Copy .env.example to .env if you want server-side AI or a password gate.
2. Set provider credentials and exact model IDs in .env on the server only. Never add keys to browser code or IndexedDB.
3. Run npm start from the project folder.
4. Open http://127.0.0.1:4173/studio.html for Veya. The original Explore Bharat home page is at http://127.0.0.1:4173/.

On a static host such as GitHub Pages, local browser analysis works; server-backed AI and SQLite sync need the Node server. The example retail dataset is explicitly labelled and stored locally. Import CSV, TSV, JSON, or XLSX files by dragging them into the window or using Import data. Files are parsed in the browser and limited to 30 MB and 250,000 rows per dataset in this release.

## What is implemented

- Responsive workspace with Overview, Projects, Data Explorer, Discoveries, and Notebook views.
- CSV/TSV/JSON import, basic XLSX workbook parsing, multi-file import, drag and drop, row search, sorting, and paged table preview.
- Local dataset profiling for types, missing cells, exact duplicate rows, numeric summaries, IQR outlier flags, and pairwise Pearson correlations.
- Calculation-grounded local questions for quality, maxima, totals, trends, correlations, and moving-average baselines.
- Clickable SVG line/bar charts, chart-point context, PNG export, CSV and JSON workspace export, HTML report export, and browser print-to-PDF.
- IndexedDB autosave, optional local SQLite snapshot sync with optimistic revision checks, project history, and derived versions for duplicate removal and column renaming.
- Notebook text autosave and Canvas drawing through Pointer Events for mouse, finger, and supported stylus input; pen, highlighter, eraser, undo, and clear.
- Optional server-side OpenAI and Anthropic API adapters. Only the chosen calculated summary is sent by default; one explicitly selected row can be included in the selection-sharing mode.
- PWA manifest and offline shell caching.
- A single-user password gate for the local server, request size limits, rate limits, same-origin write checks, signed HttpOnly session cookies, and an allowlist for public static files.

## AI configuration

The browser sends a question and the selected summary to the local server. The server reads OPENAI_API_KEY and OPENAI_MODEL, or ANTHROPIC_API_KEY and ANTHROPIC_MODEL, from its environment. The model ID is explicit because API accounts expose different model access over time. Configure the key and model on the backend, restart the server, choose the provider in Settings, then select the privacy level. The Local only setting never calls an AI provider.

AI calls have an in-memory per-IP limit of 20 requests per minute and a 45-second default timeout. The configured provider may have its own charges and usage limits. A provider credential or API account is not included.

## Storage and security

- Browser analysis and IndexedDB autosave are local to the current browser profile. Veya does not encrypt IndexedDB contents.
- Optional server snapshots use a local SQLite database under data/; that directory is ignored by Git.
- Server sync is off until enabled in Settings. It stores the workspace snapshot on the same Node server and detects stale revisions instead of silently overwriting a newer copy.
- To enable the single-user password gate, set APP_PASSWORD and a random SESSION_SECRET of at least 32 characters. The gate protects workspace APIs. The server binds to loopback by default.
- Before exposing the server to a network, put it behind HTTPS, set HOST=0.0.0.0, configure the password and session secret, set restrictive network rules, and persist the SQLite data directory. This first release is not a multi-user hosted service.
- Provider calls transmit data to the selected AI company. Veya sends a calculated profile, findings, and local calculation result by default. In Summary plus selected rows mode, it can also send the one row you selected. It does not upload full datasets automatically.

## Development and checks

Run npm test for the unit and API tests. Run npm run dev to restart the server when files change.

The test suite covers CSV parsing, profiling, correlation, local analytical answers, API snapshot version conflicts, and the static file allowlist.

## Data and device limits

| Capability | Current behavior |
| --- | --- |
| CSV, TSV, JSON | Parsed locally |
| XLSX | Reads the first worksheet in common XLSX files using browser ZIP/XML APIs; date formatting and advanced workbook features may need conversion |
| Legacy XLS | Not supported by the no-dependency browser importer; save as XLSX or CSV |
| Analytics | Local descriptive statistics, IQR flags, Pearson correlations, and a simple moving-average baseline |
| Forecasting | Descriptive baseline only; no seasonal model selection, intervals, or backtesting yet |
| Authentication | Optional single-user password gate; no user registration, OAuth, or multi-tenant access control |
| Cloud database | PostgreSQL schema is supplied in server/db/migrations; production Postgres adapter and object storage are not wired yet |
| Pencil | Web Pointer Events canvas; native PencilKit, palm rejection, and pressure behavior require an iOS shell and device testing |
| Foldable screens | Responsive CSS plus Window Segments feature detection; posture, hinge geometry, and continuity need physical device validation |
| Collaboration | Single-user workspace; no live co-editing |
| Reports | HTML and CSV exports; PDF uses the browser's print dialog |

The local server uses Node's built-in SQLite module. Production deployment should use persistent storage or connect an audited PostgreSQL adapter before hosting user workspaces. Do not treat this first release as a production multi-tenant service.

## Deployment outline

Run the Node server on a host with Node.js 22.13 or newer. Set HOST=0.0.0.0, PORT to the host-provided port, NODE_ENV=production, APP_PASSWORD, and a unique SESSION_SECRET. Terminate HTTPS at the hosting platform or a trusted reverse proxy. Persist the data/ directory, restrict access to the service, and configure provider keys only in the server's secret manager. The included PostgreSQL migration is a schema starting point; the current code stores snapshots in SQLite.