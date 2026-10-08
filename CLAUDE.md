# CLAUDE.md — Thesis Defense Deck (Slidev)

## 1. What this project is

A Slidev presentation for my Master's thesis defense at FCT NOVA (Electrical & Computer Engineering).

- **Thesis:** "Intelligent Production Planning in Food Manufacturing: Enhancing MRP System with AI"
- **Author:** João Alves (supervisor: Prof. Filipa Ferrada; industrial partner: Tecnicamente)
- **Format:** ~20 min talk + ~1 h jury Q&A
- **Mentor's brief:** present the core of the development work and the results.
- **Deck = two parts:** (1) a ~23-slide main talk, (2) a backup appendix used only during Q&A.

Reference material lives in `reference/` (thesis PDF, thesis figures, old February deck). Treat the thesis as the single source of truth for every number, name and claim. If something is not in the thesis, ask me. Never invent figures.

## 2. How I want to work with you

- I'm learning Slidev. For anything non-trivial (custom Vue components, click-driven animations, layouts, export), **write the full code first, then explain briefly what each part does and why**, so I can refine it myself. For simple slide text edits, just do them.
- Work in **phases** (section 9). Stop at the end of each phase, summarize what changed, and wait for my review.
- Before large refactors or adding a dependency, tell me what and why first.
- Run `npm run dev` / build checks yourself where possible; report errors, don't hide them.
- If git is initialized, keep commits small and descriptive (one per phase or component).

## 3. Technical conventions

- Entry: `slides.md` holds the global headmatter and imports sections via `src:`:
  - `pages/01-problem.md`, `02-design.md`, `03-how-it-works.md`, `04-results.md`, `05-close.md`, `99-backup.md`
- Custom components in `components/` (auto-imported). Custom layouts in `layouts/`. Styles in `styles/index.css` (UnoCSS utilities are fine).
- Static assets (screenshots, recorded clips, logos) in `public/`, referenced as `/img/...`, `/video/...`.
- Chart/data files in `data/*.json`, imported by components. Never hard-code chart data inside slides.
- Animations, in order of preference: `v-click` / `v-clicks` / `v-after` → click-aware components using `$clicks` / `useSlideContext()` → `v-motion`. One consistent default slide transition (`fade` or `slide-left`); no flashy mixes.
- Math: KaTeX (`$...$`, `$$...$$`), native in Slidev.
- Diagrams: hand-built SVG Vue components preferred (they animate better). Mermaid only for backup slides.
- Speaker notes: every main slide gets notes in its trailing `<!-- -->` block (key points + target time). These become my script draft.
- Backup slides get `routeAlias: bN` (b1, b2, …) so a backup index slide can jump to them with `<Link to="bN">`.
- Must work for: `npm run dev`, `npx slidev export` (PDF fallback; needs `playwright-chromium`), and `npx slidev build` (static SPA; I'll later host it on my own server as a portfolio piece).
- Must work **offline** at the defense: no CDN fonts or images at runtime; bundle everything locally.

## 4. Visual identity

Continue the look of the February deck (the jury saw it):
- Dark background (near-black `#0B0D10`), white primary text, electric-blue accent (around `#1E9BF0`), one warm accent for warnings/alerts (amber/red), muted grey for secondary text.
- Circuit/hexagon line motif used sparingly (title + section dividers only).
- Footer on main slides: date · short title · "João Alves | Tecnicamente" · slide number.
- One idea per slide. Large type. Max ~25 words of on-screen text per slide outside charts.
- Consistent chart colors everywhere, matching the thesis figures: **orange = actual demand**, **blue = combined (master) forecast**, **shaded blue = 90% prediction interval**, **dotted = scenario impact**, **purple = individual model output**.

## 5. Writing rules for on-screen text and notes

- Clear, direct technical English. No hype.
- Banned words: delve, testament, crucial, pivotal, "in conclusion", furthermore, moreover, leverage, beacon, landscape, realm, spearhead, game-changer, revolutionary, seamless, drastically.
- **Honesty rules (non-negotiable):**
  - The validation is **functional**: it shows the mechanisms work as designed on real data, not that stock or waste were reduced.
  - The combined forecast's error was **not** measured across the catalog; Scenario 1 accuracy is assessed visually for one representative SKU.
  - BOM quantities are **reconstructed** from production records (not validated by the company); scrap is a fixed 2%; lead times are **simulated** (random 2–7 days); inventory lots are **synthetic**.
  - The band is ±1.65·RMSE = **90% prediction interval** (upper bound = one-sided 95%). Never call it 95%.
  - Partner feedback came from Tecnicamente's two managers (my superiors), not independent planners. Label it as the industrial partner's view.
  - Do not claim MES integration, real-time lead-time adjustment, R² evaluation, or measured waste reduction.

## 6. The storytelling spine

Follow **one SKU** through the whole technical part (the item from thesis Figs. 5.8 / 5.14; I'll confirm the ID and provide its data):

sales history → 6 model forecasts → walk-forward errors → inverse-error weights → blended forecast + band → safety stock → BOM explosion → FEFO lots → alert → war scenario.

A small `PipelineTracker` component (Train → Refine → Plan → Scenario) appears in the corner of Act 3–4 slides and highlights the current stage.

## 7. Slide plan (main talk, target ≈20 min)

### Act 1 — The problem (~3 min)
1. **Title**: "AI-Enhanced MRP for Food Manufacturing". Hex/circuit motif.
2. **Pressure on food manufacturing**: ~1.3 B tons of food lost/wasted per year (Roy et al., 2023); ~70% of food-processing firms report labour shortages (Sharma, 2025); shocks: 2022 Ukraine war, 2026 Strait of Hormuz disruption (FAO, 2026). Numbers count up on click.
3. **Why classic MRP falls short here**: static demand assumptions, fixed lead times, no perishability awareness, slow reaction to shocks → waste, stock-outs, overproduction. Split "MRP assumes" vs "food reality".
4. **Goal + 4 objectives**: decision-support tool working *alongside* existing MRP. Objectives: (1) better demand/material prediction, (2) inventory optimization, (3) less waste, (4) resilience to disruptions. Build as a reusable `ObjectivesCard` component (reused on slide 20).

### Act 2 — Design (~4 min)
5. **Requirements**: Req-01…09 grouped as Forecast (01–04), Human (05), Plan (06–08), Views (09). Each links back to a problem from slide 3.
6. **Three stations**: Office Room (strategy, overrides, scenarios), DockStation (inbound/outbound, stock), WorkStation (recipes, schedules, alerts). Actors: Manager/Admin, Operator, System Timer.
7. **Architecture**: 3 tiers. Client (Angular, role-based screens) → Server (Quarkus central webservice + FastAPI/Python 3.12 analytical engine, internal REST) → Central DB (sales logs, model performance metadata, production schedules). Build up layer by layer. One line on why Quarkus (partner request) and Python (ML ecosystem, async jobs).
8. **The pipeline**: Train → Refine → Plan → (Scenario). Introduces the tracker component.

### Act 3 — How it works, following the SKU (~6 min)
9. **Working with a live factory database**: 2014–2026 records; noise columns removed; months without sales zero-filled; no recipe table → recipes mined from production events (grouped by document/session/workstation; QTY_REQ = average consumed/produced ratio; fish/meat keyword guard).
10. **Six models, three families**: tree-based (Random Forest, XGBoost, LightGBM; one global model across items), Prophet (per item, multiplicative yearly seasonality), foundation zero-shot (Chronos t5-small at P70, Granite TTM with context 512). Six lines appear on the SKU chart.
11. **Walk-forward validation**: cut-off starts 12 months before the target, advances monthly, retrain, score on unseen months. Animated sliding window.
12. **Inverse Error Weighting**:
    $$w_{i,t}=\frac{1/\mathrm{RMSE}_i}{\sum_{j\in M_t}1/\mathrm{RMSE}_j},\qquad \hat y_t=\sum_{i\in M_t} w_{i,t}\,\hat y_{i,t}$$
    RMSE bars morph into weight bars, then into the blended line. Note: renormalized over the models that ran, so it survives failures.
13. **Prediction interval → safety stock**: $\hat y_t \pm 1.65\,\mathrm{RMSE}_t$ (90% PI); distance to the upper bound = safety stock passed to planning. Band grows on click.
14. **Human-in-the-loop**: manager overrides model weights; short recorded clip of the real UI (`/video/weights.mp4`).
15. **Planning: BOM explosion + FEFO**: tree expands finished product → raw materials (net requirements); lots consumed earliest-expiry first; expiring lot flagged.

### Act 4 — Results (~5 min)
16. **Scenario 1 — 2025 baseline**: trained to Jan 2025, forecasts the rest of 2025; actuals mostly within/near the band; clearest deviation Aug–Dec near the lower bound. Alerts: inactive items, <1 year history ("low data").
17. **Scenario 2 — war shock**: multiplier anchored on the 2022 Ukraine outbreak (e.g. +160.8% → ×2.61); grid shows the new value with the baseline in parentheses; Critical vs Information warnings. Framed as a what-if stress test, not a prediction.
18. **Scenario 3 — live 2026, unsupervised**: only Chronos, Granite and XGBoost completed; the system did not crash; weights renormalized over the survivors; the plan was still produced. Animate three models dropping out. Honest finding: the forecast did not follow the real downward trend, linked to Item-ID resets fragmenting history.
19. **Partner feedback**: gains = automated purchase quantities, explicit purchase-timing windows, less manual analysis; figures considered operationally credible; requested next = planned-vs-spent comparison, linking re-coded items. Labelled as the industrial partner's view.
20. **Objectives scorecard**: reuse `ObjectivesCard` with a status per objective: Implemented ✓ / Demonstrated ✓ / Measured ✗ (Obj. 1 closest, since per-model error was measured).

### Act 5 — Close (~2 min)
21. **What I'm proud of / what I'd do differently**: content comes from me later; leave placeholders.
22. **Future work, prioritized**: (1) catalog-wide error of the combined forecast, (2) Item-ID history bridge, (3) planned-vs-spent tracking, (4) weekly granularity + Croston / two-stage model for intermittent demand, (5) real-time progress streaming, capacity and cost constraints.
23. **Thank you**: mirrors the title slide.

## 8. Backup appendix (Q&A support)

Slide B0 = clickable index of all backups. Initial list (I'll add more):
- b1 Model configuration (thesis Table 4.2) · b2 Model-specific data prep (Table 4.1)
- b3 Sequence diagrams: Training, Refinement, Refinement with user, Planning, Scenario (thesis Figs 4.2–4.6)
- b4 Use-case diagrams (Figs 3.1–3.3) · b5 Conceptual architecture (Fig 3.4)
- b6 Walk-forward details and the fallback to a hold-out split
- b7 Why 1.65 (90% PI, one-sided 95% upper bound)
- b8 Evaluation limitations (tree models one-step vs multi-step; clipping threshold over the full series; hyperparameters chosen on 2025)
- b9 BOM mining algorithm and its limits · b10 Synthetic lots and simulated lead times
- b11 Scenario multiplier logic (including the 0.00× default when no reference data exists)
- b12 Scenario 3 model failures: what I know about the cause
- b13 Partner questionnaire (Q1–Q10) · b14 Tech stack details
- b15 Scope evolution since the February presentation

## 9. Phases

1. **Scaffold**: folder structure, headmatter, theme/styles, footer, transition, section files with placeholder slides for all 23 main slides + the backup index. Verify `npm run dev`.
2. **Core components**: `PipelineTracker`, `ObjectivesCard`, `ForecastChart` (actual/forecast/band/scenario/model lines from JSON, click-driven reveal), `WeightBars`, `BomTree`, `FefoLots`, `WalkForward`. Use mock JSON shaped like the real data until I provide it, and mark it clearly as mock.
3. **Content — Acts 1–2**, with speaker notes.
4. **Content — Acts 3–4**, with speaker notes.
5. **Act 5 + backup appendix.**
6. **Polish**: timing pass (notes total ≈ 2,600 words), consistency check of every number against the thesis, PDF export, offline test, `slidev build`.

## 10. Assets I will provide (ask when needed, don't fake them)

- Thesis PDF + exported figures → `reference/`
- Real data for the thread SKU (actuals, 6 model forecasts, RMSEs, weights, band, scenario line) → `data/`
- UI screenshots and short screen recordings → `public/img`, `public/video`
- Logos (FCT NOVA, Tecnicamente) → `public/img/logos`