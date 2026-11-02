# Veya implementation plan

## Product direction

Veya is a local-first data workspace for asking grounded questions about tabular data. The first release focuses on a dependable vertical slice: import, inspect, chart, investigate, annotate, and export while preserving the current workspace.

The root path keeps the original Explore Bharat home page and stylesheet intact. Veya runs at `/studio.html` with its own stylesheet and reuses the existing Kashmir photo asset. The implementation is being uploaded to the existing feature branch.

## Delivery stages

1. Workspace foundation — responsive shell, brand system, app icon, accessible navigation, local persistence, PWA shell.
2. Data workflow — CSV/JSON/XLSX import, profiling, quality checks, table preview, charting, anomaly and correlation calculations.
3. Investigation workflow — calculation-grounded local answers, optional server-side OpenAI/Anthropic providers, selected-summary privacy controls, notes and pointer drawing.
4. Continuity and export — autosave, local server snapshot sync, report/CSV/JSON/PNG export, layout adaptation and offline cache.
5. Hardening — API input limits, optional single-user session gate, SQLite local storage, PostgreSQL schema, automated unit and smoke checks, setup documentation.

## Explicit limits for the first release

- The first release is single-user. A local password gate can protect a private deployment; it does not provide multi-tenant account management or social login.
- Analysis runs locally in the browser. Provider calls receive calculation summaries by default; whole datasets are not sent automatically.
- A browser does not expose Apple Pencil's native PencilKit features. Drawing uses Pointer Events and Canvas with mouse, touch, and stylus support where the browser reports it.
- Fold-aware layout uses standard responsive sizing and feature detection. Actual hinge behavior must be verified on physical foldable hardware.
- PostgreSQL schema is included as a deployment path. The bundled local server uses built-in SQLite for zero-dependency development.