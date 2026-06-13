# Product Spec — The Corporate Emissions Calculator

**Version:** 1.0
**Date:** 2026-06-13
**Author:** Zyad Hatquai
**Status:** Confirmed
> The Tool Architect sets this to **Confirmed** when the builder confirms the Phase 10 summary. The Project Governor will not accept a spec in any other status.

---

> **How to use this template**
> Fill in every section that applies to your tool. Sections marked **CONDITIONAL** can be skipped if the condition does not apply. When complete, this document is handed to the Project Governor skill to produce a CLAUDE.md and PROGRESS.md.

---

## Section 1 — Tool Summary

**Tool name:** The Corporate Emissions Calculator

**What it does:** A public, single-session web tool. A user enters one plant's energy data for one year through a guided, step-by-step form, and immediately sees that plant's Scope 1 and Scope 2 emissions on a dashboard. No file upload — all data is entered through constrained dropdowns inside the app.

**Who uses it:** Sustainability and operations staff at The Corporate, plus any external stakeholder given the link, who need to turn a plant's quarterly energy figures into a GHG emissions picture without handling spreadsheets or emission factors themselves.

**Why it exists:** It removes the two hardest parts of plant-level GHG accounting for a non-specialist: knowing which emission factor applies, and entering data in a valid structure. By driving entry through dropdowns sourced from a fixed emission factor register, the tool makes invalid plant/fuel/unit combinations impossible and produces a correct Scope 1 and Scope 2 result on the spot.

**Build status:** First build — no prior version. (A CSV-upload concept was specced earlier but never built; this is a separate, guided-entry build and supersedes it.)

---

## Section 2 — Classification

This section defines the architecture of the tool. Every downstream decision follows from this.

### Data Model

**Decision:** D2

| Label | What it means | This tool? |
|-------|--------------|-----------|
| D1 — Hardcoded | All data is written into the code by the developer. Users cannot input anything that persists. | No |
| D2 — Session | Data enters the tool during use and disappears when the tab closes. No database. Covers both uploaded files and form inputs. | Yes |
| D3 — Persisted | Data is written to a database and survives after the session ends. Supabase is required. | No |

**Reason:** The user types energy data into a form during a single session and sees the result immediately; nothing needs to be stored or retrieved after the tab closes.

**D3 is triggered if any of the following are true — check all that apply:**
- [ ] Data must be retrievable after the session ends
- [ ] Multiple sessions contribute to the same dataset
- [ ] An audit trail or history is needed
- [ ] Data submitted by one person must be visible to another
- [ ] Results must be accessible via a URL after the session ends
- [ ] Files uploaded by users must be stored and retrievable later

None apply.

---

### Access Model

**Decision:** A1

| Label | What it means | This tool? |
|-------|--------------|-----------|
| A1 — Public | Anyone with the URL can use it. No login, no account required. | Yes |
| A2 — Authentication | Users must log in. All logged-in users see the same thing. | No |
| A3 — Authorization | Users must log in and have different roles. | No |

**Reason:** The tool is intended to be openly accessible with no login; everyone sees the same tool and works only with the data they enter in their own session.

> **Promotion rule:** Auth requires a database. If the access model is A2 or A3, the data model is D3. Not applicable here — this tool is A1.

---

### If Access Model is A2 — complete both questions

N/A — this tool is A1.

---

### If Access Model is A3 — define all roles

N/A — this tool is A1.

---

### Tier

**Tier:** 1

| Tier | D+A combination | Stack | Deployment |
|------|----------------|-------|------------|
| 1 | D1+A1 or D2+A1 | Netlify only | Netlify |
| 2 | D3+A1 | Netlify + Supabase (no auth) | Netlify |
| 3 | D3+A2 or D3+A3 | Netlify + Supabase (auth + RLS) | Netlify |

D2 + A1 → **Tier 1**. Front-end only on Netlify. No database, no accounts.

---

### Standalone or Stack

**This tool is:** Standalone — it does not share a database with any other tool.

---

## Section 3 — Arms

Arms are capabilities added to the tool. They do not change the tier.

### AI API Arm

**Active:** No

### Export Arm

**Active:** Yes

| Detail | Answer |
|--------|--------|
| Format | CSV |
| What is exported | A single CSV of the calculated results for the session: one row per entered line item with plant_id, plant_name, year, quarter, category, fuel_or_substance, unit, quantity, ef_id, ef_kgco2e, emissions_tco2e, scope, and any applicable flag (R-22 memo / PROVISIONAL). A footer or flagged rows preserve the R-22 memo total and the PROVISIONAL marker. |
| PDF design intent | N/A — CSV only. |

### Email Arm

**Active:** No

### Scheduled Automation Arm

**Active:** No

---

## Section 4 — Stack and Deployment

### All Tiers

| Detail | Answer |
|--------|--------|
| Frontend framework | React + Vite + Tailwind — required, because the tool has cascading dropdowns, a dynamic line-item table, multi-view navigation, and charts. |
| Deployment target | Netlify |
| Netlify MCP | Not active — deployment is done manually. The builder pushes to GitHub main; Netlify builds and deploys automatically via its GitHub connection. |

**GitHub — pre-build requirement:**
The builder creates the GitHub repo before the first Claude Code session. product-spec.md, CLAUDE.md, and PROGRESS.md must be uploaded to the repo root before Claude Code opens. The brand skill file is also uploaded to the repo root. Claude Code assumes the repo exists, commits regularly, and pushes to main. It does not create or configure the repo.

---

### CONDITIONAL: Supabase project — only complete if Tier 2 or Tier 3

N/A — Tier 1, no database.

---

### CONDITIONAL: Only complete if this tool is part of a stack

N/A — standalone.

---

## Section 5 — Data Architecture

### CONDITIONAL: Only complete if Data Model is D3

N/A — D2, session only. No database, no tables. All entered data lives in front-end state for the duration of the session and is discarded on "Start over" or tab close.

---

## Section 6 — Access and Permissions

### CONDITIONAL: Only complete if Data Model is D3

N/A — A1 public tool, no authentication, no RLS. There is no per-user data and no privacy note required (no accounts, no stored personal data).

---

## Section 7 — GDPR

### MANDATORY DECISION for every D3 tool.

**GDPR outcome:** Not applicable — this is a Tier 1, session-only tool with no database. It collects no personal data through forms or uploads (no names, emails, company, or other identifiable information). The only inputs are plant energy figures. Confirmed not applicable during the interview.

---

## Section 8 — Screen and UI Structure

The tool is a four-view linear flow. The selected **plant** and **year** are fixed once at Setup and apply to the entire session. The user may enter line items across **one or more quarters within that single year**.

### View 1 — Setup

- **Purpose:** Choose which plant and which year the session is for.
- **What is visible:** Tool title and a one-line description; a Plant dropdown (shows plant_id + plant_name from the hardcoded plant register, 5 options); a Year dropdown (recent years, e.g. 2022–2026); a "Continue" button.
- **User actions:** Select a plant; select a year; click Continue.
- **What happens next:** Goes to View 2 — Entry. Plant and year are now locked for the session and shown as a header on every subsequent view. Changing them requires "Start over".

### View 2 — Entry

- **Purpose:** Build the list of energy line items for the chosen plant and year, across one or more quarters.
- **What is visible:**
  - Session header: selected plant and year.
  - A **Quarter** selector (Q1, Q2, Q3, Q4) for the line currently being added.
  - The **line-item cascade**, all constrained dropdowns:
    - **Category** — options are only those valid for the selected plant (derived from the EF register; see Section 9).
    - **Fuel or substance** — options filtered by the selected plant and category.
    - **Unit** — auto-set and read-only, taken from the matched EF register row.
    - **Quantity** — numeric input (the only free field).
    - An "Add line" button.
  - A **running table** of all line items added so far this session, showing quarter, category, fuel/substance, unit, quantity, with edit and delete controls on each row. The table groups or sorts by quarter so multiple quarters read clearly.
  - A "Review & calculate" button (enabled once at least one line exists).
- **User actions:** Pick a quarter; build a line through the cascade; add it; add more lines for the same or different quarters within the year; edit or delete any line; proceed to review.
- **What happens next:** Validated lines join the table. "Review & calculate" goes to View 3.

### View 3 — Review & Confirm

- **Purpose:** Let the user confirm the full set of entries and see the per-line emissions before viewing the dashboard.
- **What is visible:** The session header (plant, year); a table of every entered line across all quarters, each with its computed emissions in tCO2e (quantity × ef_kgco2e ÷ 1000); inline flags where they apply (R-22 memo lines marked as excluded from Scope 1 totals; PROVISIONAL marker on FAC-004 district heating); a "Back to entry" button; a "Confirm" button.
- **User actions:** Review the lines and their computed emissions; go back to edit if needed; confirm.
- **What happens next:** Confirm goes to View 4 — Dashboard.

### View 4 — Dashboard

- **Purpose:** Present the plant's emissions result for the year.
- **What is visible:**
  - **Totals panel** — Scope 1 total, Scope 2 (location-based) total, and overall total, all in tCO2e, for the plant across all entered quarters. The **R-22 memo line** sits below the Scope 1 total: "Fugitive — Montreal Protocol substances (reported separately): [X] tCO2e" (never added to Scope 1). A **[PROVISIONAL EF — see register]** flag appears on any figure derived from FAC-004 district heating.
  - **Scope breakdown bar chart** — two bars: Scope 1 and Scope 2 (location-based), in tCO2e.
  - **Fuel bar chart** — emissions per fuel/substance, aggregated for the **year** (across all entered quarters). X-axis: fuels. Y-axis: tCO2e.
  - **Quarter-over-quarter line chart** — total tCO2e per quarter (Scope 1 + Scope 2 LB), one line for the plant. X-axis: the quarters entered. If only one quarter was entered, a single data point is shown.
  - **Export CSV** button.
  - **Start over** button.
- **User actions:** Read the charts and totals; export the results CSV; start over.
- **What happens next:** Export downloads the CSV. Start over clears all session data and returns to View 1.

---

## Section 9 — Logic and Calculations

### CONDITIONAL: Only complete if the tool calculates, scores, or applies decision rules

**What is calculated:** GHG emissions in tCO2e for Scope 1 (stationary combustion, mobile combustion, fugitive emissions) and Scope 2 location-based (purchased electricity, purchased heat) for each entered line item, then aggregated by scope, by fuel, and by quarter for the selected plant and year.

**Inputs:**
- Selected plant (fixed for the session)
- Selected year (fixed for the session)
- Per line item: quarter, category, fuel/substance, unit (auto-set), quantity
- The hardcoded Emission Factor Register below (16 rows)
- The hardcoded plant register below (5 plants)

There is no market-based calculation and there are no electricity contracts in this build. Scope 2 is **location-based only**.

#### Hardcoded Plant Register

The Plant dropdown is populated from this list. `plant_name` is the display label; confirm exact site names (see Open Questions) — country is shown here as the working label.

| plant_id | plant_name (working label) | Country |
|----------|----------------------------|---------|
| TC-FAC-001 | TC-FAC-001 — Vietnam | Vietnam |
| TC-FAC-002 | TC-FAC-002 — Mexico | Mexico |
| TC-FAC-003 | TC-FAC-003 — China | China |
| TC-FAC-004 | TC-FAC-004 — Poland | Poland |
| TC-FAC-005 | TC-FAC-005 — India | India |

#### Hardcoded Emission Factor Register (EF Register v1.0)

All factors from DEFRA 2025 or curated national sources. GWP basis: IPCC AR5. Natural gas is on a Gross Calorific Value basis. This register is the single source of truth for the entry cascade and the calculation.

| ef_id | Scope | Category | Fuel or Substance | Unit | ef_kgco2e | Status | Applies to |
|-------|-------|----------|-------------------|------|-----------|--------|-----------|
| EF-S1-001 | Scope 1 | Stationary Combustion | Diesel | litres | 2.57082 | PRIMARY | TC-FAC-001, TC-FAC-003, TC-FAC-004, TC-FAC-005 |
| EF-S1-002 | Scope 1 | Stationary Combustion | LPG | litres | 1.55713 | PRIMARY | TC-FAC-001, TC-FAC-002, TC-FAC-005 |
| EF-S1-003 | Scope 1 | Stationary Combustion | Natural gas | kWh (Gross CV) | 0.18296 | PRIMARY | TC-FAC-002, TC-FAC-003, TC-FAC-004 |
| EF-S1-004 | Scope 1 | Mobile Combustion | Diesel | litres | 2.57082 | PRIMARY | All plants |
| EF-S1-005 | Scope 1 | Mobile Combustion | Petrol | litres | 2.06916 | PRIMARY | All plants |
| EF-S1-006 | Scope 1 | Fugitive Emissions | R-410A | kg | 1924 | PRIMARY | TC-FAC-001, TC-FAC-002, TC-FAC-003, TC-FAC-005 |
| EF-S1-007 | Scope 1 | Fugitive Emissions | R-134a | kg | 1300 | PRIMARY | TC-FAC-001, TC-FAC-003, TC-FAC-004 |
| EF-S1-008 | Scope 1 | Fugitive Emissions | R-32 | kg | 677 | PRIMARY | TC-FAC-002 |
| EF-S1-009 | Scope 1 | Fugitive Emissions | SF6 | kg | 23500 | PRIMARY | TC-FAC-004 |
| EF-S1-010 | Scope 1 | Fugitive Emissions | R-22 | kg | 1760 | PRIMARY | TC-FAC-005 — Montreal Protocol: EXCLUDED from Scope 1 totals. Memo line only. |
| EF-S2-L01 | Scope 2 | Purchased Electricity | Grid electricity | kWh | 0.681 | PRIMARY | TC-FAC-001 (Vietnam) |
| EF-S2-L02 | Scope 2 | Purchased Electricity | Grid electricity | kWh | 0.444 | PRIMARY | TC-FAC-002 (Mexico) |
| EF-S2-L03 | Scope 2 | Purchased Electricity | Grid electricity | kWh | 0.5306 | PRIMARY | TC-FAC-003 (China) |
| EF-S2-L04 | Scope 2 | Purchased Electricity | Grid electricity | kWh | 0.597 | PRIMARY | TC-FAC-004 (Poland) |
| EF-S2-L05 | Scope 2 | Purchased Electricity | Grid electricity | kWh | 0.7117 | PRIMARY | TC-FAC-005 (India) |
| EF-S2-DH01 | Scope 2 | Purchased Heat | District heating | kWh | 0.33 | PROVISIONAL | TC-FAC-004 only |

**Formula or rules:**

Cascade population (drives the dropdowns in View 2):
- For the selected plant, the available **categories** are the distinct `Category` values among EF register rows whose `Applies to` includes that plant.
- For the selected plant + category, the available **fuels/substances** are the matching rows' `Fuel or Substance` values.
- The **unit** is taken directly from the matched row and is read-only.
- This makes the four structural error classes impossible by construction: a user can never select an unknown plant, an unknown fuel, a wrong unit, or a fuel outside the plant's register scope.

Emissions, per line item:
- `emissions_kg = quantity × ef_kgco2e`
- `emissions_tco2e = emissions_kg ÷ 1000`
- Unrounded values are authoritative for all aggregation. Display rounded to 2 decimal places in tCO2e.

Scope 1 — Stationary Combustion, Mobile Combustion, Fugitive Emissions:
- `emissions_kg = quantity × ef_kgco2e`
- **R-22 special rule:** R-22 (EF-S1-010, FAC-005) is calculated (× 1760) but **never added to the Scope 1 total**. It is shown only as a separate memo line on the dashboard and in the review table: "Fugitive — Montreal Protocol substances (reported separately): [X] tCO2e."

Scope 2 — Location-Based (the only Scope 2 method in this build):
- `emissions_kg = quantity × ef_kgco2e` using the plant's grid electricity factor (EF-S2-L01…L05) and, for FAC-004 only, the district heating factor (EF-S2-DH01).
- Scope 2 total = Purchased Electricity + Purchased Heat.
- **PROVISIONAL flag:** any figure derived from EF-S2-DH01 (FAC-004 district heating) carries the inline flag **[PROVISIONAL EF — see register]** on the dashboard, in the totals, in the review table, and in the export.

Aggregation for the dashboard:
- **Totals panel:** Scope 1 total (excluding R-22), Scope 2 LB total, overall total — across all entered quarters for the plant/year.
- **Scope bar:** Scope 1 total vs Scope 2 LB total.
- **Fuel bar:** emissions summed per fuel/substance across all entered quarters (yearly aggregation).
- **QoQ line:** for each entered quarter, total tCO2e = Scope 1 (excl. R-22) + Scope 2 LB for that quarter.

**Output:** Per-line emissions in tCO2e, and aggregated totals by scope, by fuel, and by quarter, displayed on the dashboard and downloadable as a CSV.

**Edge cases:**
- **Quantity invalid (BAD_QUANTITY):** quantity missing, non-numeric, or ≤ 0 → the line cannot be added; show an inline message. This is the only quantity rule.
- **Duplicate line (DUPLICATE):** a line already exists for the same quarter + category + fuel/substance in the session → block adding the duplicate; show an inline message.
- **Single quarter:** the QoQ line chart shows a single data point.
- **R-22 entered:** calculated and shown as a memo line only; never in Scope 1 totals or the scope bar.
- **FAC-004 district heating entered:** all figures using it carry the PROVISIONAL flag.
- There are no soft warnings (no quantity-spike check, no missing-expected-source nudge) in this build.

---

## Section 10 — Brand and Visual Direction

**Brand reference:** Brand skill file — `the-corporate-brand` skill, uploaded flat to the repo root; Claude Code installs it to `.claude/skills/` in First Session Setup and invokes it for all UI and visual work.

**Hard brand rules that hold even if the skill is not loaded:**
- Background: Chalk (#F2F2F2) — never white or Tailwind gray defaults.
- Header background: Ink (#000000) — wordmark in Chalk, logo box monogram in Chalk.
- Accent: Acid Lime (#C8F135) — used a maximum of twice per page, for critical callouts only (e.g. the PROVISIONAL flag, a hard-error state).
- Fonts: Playfair Display 700 for display headlines; DM Sans 300 for body text.
- No border-radius on any structural element. No gradients. No drop shadows.

**Visual feel:** Professional and corporate; clean, high-contrast, data-forward.

**Reference or inspiration:** Governed entirely by the brand skill.

---

## Section 11 — API and Credentials

This tool connects to no external services. There are no API keys, tokens, or credentials of any kind. Everything (EF register, plant register, calculation, charts, CSV export) runs client-side.

| Service | What it does in this tool | Key required | Where key is stored |
|---------|--------------------------|-------------|-------------------|
| (none) | — | — | — |

**Credentials readiness:** No credentials needed. No pre-build credential tasks.

> Security rule still applies as a standing principle: no secret of any kind should ever be committed to GitHub. This build has none to manage.

---

## Section 12 — Out of Scope — Phase 2

| Deferred feature | Reason it is deferred |
|-----------------|----------------------|
| Market-based Scope 2 and the electricity contracts (FAC-002 I-REC, FAC-004 GoO) | Consciously dropped from the MVP; no display surface once the market-based toggle was removed. |
| Market-based toggle on any chart | Dropped from the MVP. |
| Multiple plants in one session | One plant per session by design; removes the world map and multi-plant bar chart. |
| World map with proportional plant bubbles | Requires multiple plants. |
| Multi-plant breakdown bar chart | Requires multiple plants. |
| More than one year per session | One year per session by design. |
| CSV upload as an input path | Guided in-app entry is the only input method for this build. |
| Data quality field (metered/estimated) and notes field | Dropped to keep entry as simple as possible; removes the ESTIMATED_DATA flag. |
| Soft warnings (quantity spike, missing expected source) | Dropped to keep the MVP simple. |
| Any persistence, accounts, database, or audit trail | Session-only Tier 1 tool by design. |
| PDF export | CSV export only. |

---

## Section 13 — Acceptance Criteria

| # | What to verify | Expected result | Done? |
|---|---------------|-----------------|-------|
| 1 | Setup view loads | Plant dropdown shows all 5 plants; Year dropdown present; Continue locks plant + year and advances to Entry | [ ] |
| 2 | Category dropdown is plant-aware | For a selected plant, only categories valid for that plant (per the EF register `Applies to`) appear | [ ] |
| 3 | Fuel dropdown is plant + category aware | Only fuels/substances valid for the plant and chosen category appear; unit auto-sets read-only from the matched row | [ ] |
| 4 | Invalid combinations impossible | There is no way to enter an unknown plant, unknown fuel, wrong unit, or out-of-scope fuel through the UI | [ ] |
| 5 | BAD_QUANTITY block | A line with missing, non-numeric, or ≤ 0 quantity cannot be added; inline message shown | [ ] |
| 6 | DUPLICATE block | A second line for the same quarter + category + fuel cannot be added; inline message shown | [ ] |
| 7 | Multiple quarters in one session | Line items can be added across Q1–Q4 within the single chosen year and appear correctly grouped in the running table | [ ] |
| 8 | Per-line calculation | Review view shows emissions_tco2e = quantity × ef_kgco2e ÷ 1000 for each line, matching the register factor | [ ] |
| 9 | Scope 1 total excludes R-22 | R-22 appears only as the memo line; it is never included in the Scope 1 total or the scope bar | [ ] |
| 10 | Scope 2 is location-based only | Scope 2 total = grid electricity + district heating using the plant's LB factors; no market-based figure anywhere | [ ] |
| 11 | PROVISIONAL flag | Any FAC-004 district heating figure carries [PROVISIONAL EF — see register] on the dashboard, totals, review, and export | [ ] |
| 12 | Totals panel | Scope 1, Scope 2 LB, and overall totals in tCO2e are correct across all entered quarters | [ ] |
| 13 | Scope bar | Two bars (Scope 1, Scope 2 LB) render with correct values | [ ] |
| 14 | Fuel bar (yearly) | Emissions per fuel aggregated across all entered quarters render correctly | [ ] |
| 15 | QoQ line | Total tCO2e per entered quarter renders; a single entered quarter shows a single point | [ ] |
| 16 | CSV export | Export downloads a CSV with one row per line item, all fields per Section 3, plus R-22 memo and PROVISIONAL flags preserved | [ ] |
| 17 | Start over | Clears all session data and returns to Setup | [ ] |
| 18 | Brand applied | Chalk background, Ink header, Playfair Display headlines, DM Sans body, no rounded corners/gradients/shadows; Acid Lime used sparingly | [ ] |
| 19 | Deploy | Tool builds and is accessible at the Netlify URL; loads correctly on desktop | [ ] |

> Criteria are derived from Sections 8 (views), 9 (logic), and 3 (arms). Claude Code must not mark a feature complete without meeting its acceptance criterion.

---

## Section 14 — Build Path

**This tool's tier:** Tier 1

### Pre-build steps — complete these before opening Claude Code

- [ ] Tool Architect skill — interview complete, this spec is written and confirmed by the builder
- [ ] Project Governor skill — CLAUDE.md and PROGRESS.md produced from this spec
- [ ] GitHub repo created by the builder
- [ ] product-spec.md uploaded to the GitHub repo root
- [ ] CLAUDE.md uploaded to the GitHub repo root
- [ ] PROGRESS.md uploaded to the GitHub repo root
- [ ] `the-corporate-brand` skill file uploaded to the GitHub repo root
- [ ] Netlify connected to the GitHub repo (Netlify MCP is not active)
- [ ] No credentials to prepare — this tool uses none

> Claude Code organizes these files into the correct folder structure (docs/, .claude/skills/) automatically at the start of the first session.

### Tier 1 — build session

- [ ] Open Claude Code in the project folder (GitHub repo connected to Netlify)
- [ ] Claude Code runs First Session Setup: creates docs/, moves reference files, installs the brand skill
- [ ] Claude Code reads product-spec.md, CLAUDE.md, and PROGRESS.md
- [ ] Claude Code builds the tool
- [ ] Test locally before deploying
- [ ] **Netlify MCP not active:** push to main → Netlify deploys. No environment variables to set.

---

## Section 15 — Open Questions

| Question | Who answers it | Blocking? |
|----------|---------------|-----------|
| Exact plant display names — should the Plant dropdown show fuller site names (e.g. "TC-FAC-001 — Hanoi") rather than country labels? | Builder | No — can resolve during build; country labels are a working default |
| Year dropdown range — which years should be selectable? (Default proposed: 2022–2026) | Builder | No — can resolve during build |

---

## Section 16 — Tool Version History

| Version | Date | What changed in the tool |
|---------|------|--------------------------|
| v1.0 | 2026-06-13 | Initial build |

---

*This spec is written for Claude Code. It assumes zero prior context. Every decision, rule, and requirement is explicit enough that the builder can hand this document to Claude Code without a single verbal explanation.*
