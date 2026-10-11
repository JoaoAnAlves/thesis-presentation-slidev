# Act 2 — Design (slides 5–8) · spec + script drafts

Target: ~3:20 of talking (+ ~5 s on the Act 2 divider).
Scripts are drafts in English. Rewrite them in your own voice, say them out loud, and time them.
Every on-screen text below is a draft → mark TODO(João).

Source of truth: thesis Ch. 3 (requirements, use cases, conceptual architecture) and Ch. 4.1 (three-tier architecture, communication, implementation scope).

---

## Slide 5 — From problems to requirements (~50 s)

**Purpose:** each requirement exists because of a concrete problem. Nothing was added "because AI".

**Visual: `RequirementMap` component** (two columns joined by lines)
- Left column = the problems, repeated from slide 3 (same wording, same icons, so the jury recognises them):
  1. Demand is seasonal and shock-driven
  2. Factory data is incomplete and noisy
  3. Planners know things the data doesn't
  4. Demand must become raw materials
  5. Stock expires
  6. Disruptions change demand and lead times
  7. Different people need different information
- Right column = requirements, short names only, colored by group:
  - **Forecast** (accent blue): Req-01 History aggregation · Req-03 Ensemble of models · Req-04 Safety margin
  - **Data quality** (blue): Req-02 Data quality audit
  - **Human** (purple or white): Req-05 Human-in-the-loop override
  - **Plan** (orange-ish, or keep blue): Req-06 Recipe (BOM) explosion · Req-07 Waste-aware stock (FEFO) · Req-08 Scenario simulation
  - **Views** (grey): Req-09 Role-based views

Mapping (problem → requirements):
| Problem | Requirement(s) |
|---|---|
| 1 Demand seasonal/shocks | 01, 03, 04 |
| 2 Data noisy | 02 |
| 3 Planner knowledge | 05 |
| 4 Demand → materials | 06 |
| 5 Stock expires | 07 |
| 6 Disruptions | 08 |
| 7 Different people | 09 |

**Clicks**
- 0: left column only (problems, recognised from slide 3).
- 1: Forecast group appears, lines connect from problems 1–2.
- 2: Human (05).
- 3: Plan group (06–08).
- 4: Views (09). Small footnote: "Requirements describe *what* the system does, not *how*."

**Script draft (~110 words)**
> "Each of the problems from the start became one or more requirements. Because demand is seasonal and hit by shocks, the system must build on years of history, combine several forecasting methods instead of trusting one, and keep a safety margin sized to how volatile each item is. Because real factory data is incomplete, it must check data quality before forecasting. Because the planner knows things the data doesn't, they must be able to override it. Then the planning side: turn product demand into raw materials through the recipe, use the stock that expires first, and simulate disruptions. And finally, different people in the factory need different views of the result."

**Bridge in:** "To build this, I turned each objective into concrete requirements."
**Bridge out:** "Requirements say *what*. Next is *who* uses it."

**Q&A risk:** the mentor flagged the what/how separation. If asked, say that the requirements were rewritten to describe capabilities, and that the methods (inverse error weighting, walk-forward, and so on) belong to the implementation chapter.

---

## Slide 6 — Three stations, three roles (~45 s)

**Purpose:** the system is designed around real places in a factory, not around a screen.

**Visual: `FactoryFloor` component** (simple top-down floor plan, flat icons)
- Office Room (left): desk + chart icon. Actors: Manager/Admin + **System Timer** (clock icon).
- DockStation (bottom right): truck + pallets. Actors: Operator, Manager.
- WorkStation (top right): production line. Actors: Operator, Manager.
- Thin dashed lines from each station to a small "system" hex in the middle (reuse the MRP hex from HeroLoop).

**Clicks**
- 0: empty floor plan with the three zones labelled.
- 1: Office Room lights up → 3 tags: *review forecasts · override · run scenarios*. Clock icon: *timer triggers training*.
- 2: DockStation → *inbound / outbound schedule · view stock · disruption impact*.
- 3: WorkStation → *recipes · ingredient stock · production schedule · alerts*.
- 4: small honest note at the bottom (grey): **"Prototype: one interface, Manager and Operator roles. Station-specific screens are future work."**

**Script draft (~95 words)**
> "Who uses it? I designed the system around three places in a factory. The Office Room is where the manager reviews forecasts, overrides them, and runs what-if scenarios. There's also a system timer that triggers retraining automatically. The DockStation is the loading bay: inbound and outbound schedules, stock, and how a disruption shifts deliveries. The WorkStation is the production floor: recipes, ingredient stock and alerts. To be clear about scope: the prototype implements these as one interface with two roles, Manager and Operator. Separate screens per station are future work."

**Bridge out:** "Three stations, one system behind them."

**Q&A risk:** the DockStation role split (only the Manager edits stock) was a prototype assumption and was not validated with the partner (thesis §3.3). Say that if asked.

---

## Slide 7 — Architecture (~60 s)

**Purpose:** heavy computation is kept separate from day-to-day requests, so the system stays responsive and one failure doesn't stop everything.

**Visual: `ArchitectureTiers` component** (three columns, built up one at a time, left to right)

| Client-side | Server-side orchestration | Storage |
|---|---|---|
| Angular · Office / Dock / Work screens · role-based login | **Central Webservice** (Java · Quarkus): API gateway, access control, business logic, persistence | **Central DB** (single source of truth) |
| | ⇅ internal REST | · Sales logs (cleaned history) |
| | **Analytical Engine** (Python 3.12 · FastAPI): data cleaning, 6 models, weighting, BOM, planner, alerts | · Model performance metadata · Production schedules |

**Clicks**
- 0: Client column.
- 1: Server column (Quarkus box, then FastAPI box, joined by "internal REST").
- 2: Storage column.
- 3: **request path animation**: a dot travels Client → Quarkus → FastAPI (box pulses "computing…") while Quarkus already shows "free for other requests" → DB → back to Client. This shows the decoupling idea in 2 seconds.
- 4: two small "why" tags: Quarkus → *partner's request, lightweight Java*; Python → *ML ecosystem, async jobs*.

**Script draft (~130 words)**
> "Behind the three stations is a three-tier architecture. On the client side, the Angular screens. Their only job is to show results and send actions. In the middle, two separate services. The Central Webservice, in Java with Quarkus, is the single entry point: it handles requests, access control and business logic. The Analytical Engine, in Python with FastAPI, does the heavy work: cleaning data, running six models, combining them and building the plan. They talk over an internal REST interface, so when someone asks for a long calculation, Quarkus hands it off and stays free to serve the other stations. At the bottom, one central database is the single source of truth. Quarkus was the partner's choice, to build internal knowledge with it. Python was the natural choice for the ML side."

**Bridge out:** "Inside the analytical engine, everything follows one pipeline."

**Q&A risk:** progress and warnings are written to the database and the UI reads them, with no websocket streaming yet. That's a deliberate trade-off (thesis §4.1.3) and appears in future work. Backup: b14 Tech stack, b5 Conceptual architecture (4 layers, Fig 3.4).

---

## Slide 8 — The pipeline (~45 s)

**Purpose:** the map for Act 3. Four stages, each with a clear input and output.

**Visual: `PipelineFlow` component** (4 steps, left to right, **reusing the HeroLoop node icons** so the jury recognises them)

| Train | Refine | Plan | Scenario (optional) |
|---|---|---|---|
| in: sales history | in: 6 forecasts + errors | in: final forecast + band | in: crisis reference (e.g. Ukraine 2022) |
| out: 6 forecasts + error per model | out: **1 forecast + 90% band** (manager can re-weight) | out: raw-material needs, FEFO lots, alerts | out: adjusted plan + warnings |

Small annotations:
- Arrow Train → Refine: *"runs automatically after training"*.
- Above Train: clock + person icon: *"triggered by the manager or the timer"*.
- Under Refine: small person icon: *"human override"*.

**Clicks**
- 0–3: the four stages appear one by one.
- 4 (final): the whole flow **shrinks into the top-right corner** and becomes the `PipelineTracker` used throughout Acts 3–4. The jury sees where the tracker comes from.

**Script draft (~90 words)**
> "Everything the system does follows four stages. Training takes the sales history and produces six forecasts, plus a measure of how wrong each model has been. Refinement runs automatically after training and turns those six into one forecast with a 90% prediction interval. This is also where the manager can step in and change the weights. Planning turns that forecast into raw-material needs, uses expiry dates, and raises alerts. And on request, a scenario can be applied on top to see how a crisis would change the plan. Let's follow one product through it."

**Bridge out:** "Let's follow one product through it." → Act 3 divider.

---

## Components to build in Act 2
- `RequirementMap` (two columns + connecting lines, revealed per group on click)
- `FactoryFloor` (3 zones, per-click highlight, tag lists)
- `ArchitectureTiers` (3 columns built up + request-path dot animation)
- `PipelineFlow` (4 steps with in/out; final click morphs into `PipelineTracker` in the corner)

Reuse: HeroLoop node icons in `PipelineFlow` and the MRP hex in `FactoryFloor`. Same color tokens everywhere.
