# The Corporate — Emissions Calculator

A public, single-session web tool. Enter one plant's energy data for one year through a
guided, constrained form and immediately see that plant's Scope 1 and Scope 2
(location-based) GHG emissions on a dashboard. No login, no database, no file upload — all
data is entered through dropdowns sourced from a fixed emission-factor register and is
discarded when you start over or close the tab.

**Tier 1** (session-only, public) · React + Vite + Tailwind · deploys to Netlify.

## Flow

`Setup → Entry → Review & Confirm → Dashboard`

- **Setup** — lock a plant (1 of 5) and a year for the session.
- **Entry** — build energy line items through a cascading, plant-aware dropdown
  (Category → Fuel/Substance → auto-set Unit → Quantity), across one or more quarters.
- **Review** — see per-line emissions before confirming.
- **Dashboard** — totals, scope/fuel/quarter charts, and CSV export.

## Key rules

- **Cascade** is derived entirely from the EF register, so an unknown plant, unknown fuel,
  wrong unit, or out-of-scope fuel is impossible to enter.
- **R-22** (FAC-005, Montreal Protocol) is calculated but never added to the Scope 1 total —
  it appears as a separate memo line only.
- **District heating** (FAC-004) uses a provisional factor and carries a
  `PROVISIONAL EF — see register` flag wherever it appears.
- **Scope 2 is location-based only.**

The single source of truth for the cascade and the maths is
[`src/data/registers.js`](src/data/registers.js) (EF Register v1.0, DEFRA 2025, GWP IPCC AR5).

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

## Deploy

Netlify builds from `main`: build command `npm run build`, publish directory `dist`
(see [`netlify.toml`](netlify.toml)). No environment variables — the tool calls no external
services.

> Note: `npm audit` reports advisories in `esbuild`, a build-time dependency of Vite. These
> are not part of the production bundle and do not affect the deployed site. The only "fix"
> is a breaking Vite major upgrade, deferred intentionally.
