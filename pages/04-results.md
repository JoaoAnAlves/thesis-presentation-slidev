---
layout: section
act: Act 4
---

# Results

Three scenarios on real factory data

---
clicks: 1
# Chart stays steady going into slide 17 (measured: plain fade dims it mid-way).
transition: view-transition
---

# Scenario 1: 2025 baseline

<div class="stage-chart">
  <ForecastChart series="baseline2025" :highlight="$clicks >= 1" />
</div>

<div class="stage-side">

Trained to Jan 2025, then forecasts the rest of the year.

<p v-click="1" class="warn">Aug–Dec: actuals sit near the lower bound.</p>

<p class="muted">Assessed visually, one representative SKU.</p>

</div>

<!-- TODO(João): review wording -->

<!--
Bridge in: With the pipeline explained, the first question is whether it behaves as designed on a year we can check.

Key points:
- Trained to Jan 2025, forecasts the rest of 2025.
- Actuals mostly within or near the band.
- [click] Clearest deviation Aug–Dec, near the lower bound.
- Alerts: inactive items, under 1 year of history ("low data").
- Honesty: accuracy is assessed visually for one representative SKU, not measured across the catalog.

Target time: 1:10

Bridge out: That is a normal year. What does the plan look like if a shock hits during it?
-->

---
clicks: 3
---

# Scenario 2: war shock

<div class="stage-chart">
  <ForecastChart series="baseline2025" :scenario="$clicks >= 2" />
</div>

<div class="stage-side">

<div v-click="1" class="ref-chip">Reference: Ukraine 2022 → <span class="warn num">×2.61</span></div>

<PlanGrid v-click="3" />

<p v-click="3" class="muted">What-if stress test, not a prediction.</p>

</div>

<!-- TODO(João): review wording -->

<!--
Bridge in: Same SKU, same baseline, same chart. Now I switch on the war scenario.

Key points:
- [click] Multiplier anchored on the 2022 Ukraine outbreak (e.g. +160.8% → ×2.61).
- [click] Dotted line = the scenario's projected impact on top of the baseline.
- [click] Planning grid shows the new value with the baseline in parentheses.
- Critical vs Information warnings.
- Framed as a what-if stress test, not a prediction.

Target time: 1:10

Bridge out: Both scenarios so far ran under controlled conditions. What happens on live data, with nobody supervising?
-->

---
clicks: 3
---

# Scenario 3: live 2026, unsupervised

<div class="stage-chart">
  <ForecastChart series="live2026" />
</div>

<div class="stage-side">

<WeightBars :stage="Math.min($clicks, 2)" />

<div v-click="3" class="callout">Plan still produced. No crash.</div>

</div>

<!-- TODO(João): review wording -->

<!--
Bridge in: Same chart again, but this is live 2026 data and the run was not supervised.

Key points:
- [click] Six models were expected; only Chronos, Granite and XGBoost completed.
- [click] Weights renormalized over the three survivors.
- [click] The plan was still produced; the system did not crash.
- Honest finding: the forecast did not follow the real downward trend, linked to Item-ID resets fragmenting history.

Target time: 1:10

Bridge out: The mechanisms held up. What did the people who would use it think?
-->

---

# Partner feedback

<span class="placeholder">Slide 19 · placeholder · content in Phase 4</span>

<!--
Key points:
- Label it as the industrial partner's view (Tecnicamente's two managers).
- Gains: automated purchase quantities, explicit purchase-timing windows, less manual analysis.
- Figures considered operationally credible.
- Requested next: planned-vs-spent comparison, linking re-coded items.

Target time: 0:45
-->

---

# Objectives scorecard

<span class="placeholder">Slide 20 · placeholder · ObjectivesCard in Phase 2</span>

<!--
Key points:
- Same four objectives as slide 4, each with a status: Implemented / Demonstrated / Measured.
- Measured is not met; Objective 1 is closest, since per-model error was measured.
- The validation is functional: mechanisms work as designed on real data.

Target time: 0:45
-->
