---
layout: section
act: 4
title: Results
question: Does it hold up on real data?
covers: [Baseline, Shock, Live 2026, Partner view]
loopMode: stress
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: Does it hold up on real data?
-->

---
clicks: 1
# `layer` (styles/index.css): slide 17 fades in on top; both show the same twelve months, so the blue line and band do not move.
transition: layer
---

# Scenario 1: 2025 baseline

<div class="stage-chart">
  <ForecastChart
    series="scenario1" from="2025-02" to="2026-01" actuals-after-train
    :highlight="$clicks >= 1" :mark-below="0.8"
  />
</div>

<div class="stage-side">

Trained to Jan 2025, then forecasts the next 12 months.

<BaselineCaption v-click="1" />

<p class="muted">Assessed visually, one representative SKU.</p>

</div>

<!-- TODO(João): review wording. The orange caption is written by BaselineCaption.vue from the data (months inside the band; months under 80% of the forecast). Match thesis wording there. -->

<!--
Bridge in: With the pipeline explained, the first question is whether it behaves as designed on a year we can check.

Key points:
- Real data, item 101703 (data/sku.json → scenario1). Trained to Jan 2025, forecasts Feb 2025 to Jan 2026.
- The chart shows only the twelve forecast months (Feb 2025 to Jan 2026). Orange = what was actually sold. All twelve months are inside the 90% band.
- [click] The dots mark the months where sales were under 80% of the forecast. From the data that is four months, not three: March (6,775 vs 9,004 kg, 75%), August (72%), November (77%) and December (72%). TODO(João): your brief expected Aug, Nov and Dec only; March qualifies too under the same rule.
- Alerts: inactive items, under 1 year of history ("low data").
- Honesty: accuracy is assessed visually for one representative SKU, not measured across the catalog.

Target time: 1:10

Bridge out: That is a normal year. What does the plan look like if a shock hits during it?
-->

---
clicks: 4
transition: layer
---

# Scenario 2: war shock

<div class="stage-chart">
  <ForecastChart
    series="scenario1" from="2025-02" to="2026-01" :show-actual="false"
    :scenario="$clicks >= 2"
    :highlight="$clicks >= 3"
    :regions="[{ from: '2025-03', to: '2025-07' }, { from: '2025-09', to: '2025-10' }]"
  />
</div>

<div class="stage-side">

<div v-click="1" class="ref-chip">Reference: Ukraine war, 2022</div>

<p class="muted">What-if stress test, not a prediction.</p>

<div v-click="4" class="scn-plan">
  <ScenarioGrid :months="['2025-04', '2025-09', '2025-10']" />
  <p class="muted">War reference: supplier lead times ×3</p>
</div>

</div>

<!-- TODO(João): review wording (chip, the what-if line). Replace "War reference: supplier lead times ×3" with the real Critical warning text for 101703 when exported. -->

<style>
.scn-plan {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>

<!--
Bridge in: Same product, same baseline forecast. Now I switch on the war scenario.

Script draft (TODO(João)):
The blue line and the band are the Scenario 1 forecast from the previous slide. There is no sales line here on purpose: this is a what-if stress test, not a prediction.
[click] The reference is 2022, the year the war in Ukraine started.
[click] In 2022, after the war started, sales of this product fell in spring and rose in autumn. The system replays that pattern on the 2025 forecast: about a third less from March to July, then up to 38% more in September. The dotted line is the result.
[click] Those are the two periods that matter: between 0.68 and 0.78 times the baseline from March to July, and between 1.28 and 1.38 in September and October.
[click] Planning is then recomputed with the scenario quantities. For this product: April, September and October, the new value in bold with the baseline in parentheses. And the war reference also stretches supplier lead times. TODO(João): "lead times ×3" is your placeholder; I found "extending supplier lead times" in the thesis but not the factor.

Numbers (data/sku.json → scenario2, item 101703): lowest ×0.68 in April, highest ×1.38 in September, ×1.28 in October. TODO(João): March to July are ×0.77, ×0.68, ×0.76, ×0.75, ×0.78, about a quarter less on average; "about a third" only fits April. Check the wording.

Q&A:
- ×2.61 (+160.8%) is the thesis's illustrative example of how the multiplier is computed; it is not this product.
- Items with no 2022 reference data get a 0.00× multiplier and an Information warning.
- Critical vs Information warnings: items with usable reference history vs items without.
- Why no sales line: a what-if is never scored against actual sales. It replays 2022 on the 2025 forecast; 2025 had no such shock.

Target time: 1:10

Bridge out: Both scenarios so far ran under controlled conditions. What happens on live data, with nobody supervising?
-->

---
clicks: 3
---

# Scenario 3: live 2026, unsupervised

<div class="stage-chart">
  <ForecastChart series="scenario3" draw :show-forecast="$clicks >= 3" :show-band="$clicks >= 3" />
</div>

<div class="stage-side live-side">

<WeightBars :stage="Math.min($clicks, 2)" />

<div v-click="2" class="callout after-bars">Plan still produced.</div>

<p v-click="3" class="muted after-line">Sales data only to mid-March 2026 — too early to judge accuracy.</p>

</div>

<!-- TODO(João): review wording (callout, grey line; labels in WeightBars.vue). No trend wording on this slide: March 2026 is a partial month. -->

<style>
.live-side {
  gap: 12px;
}
/* Two things appear a little after their click, once the animation before
   them has finished: the box after the bars have grown (about 1 s), the
   grey line after the blue line is drawn and the band is in (about 1.3 s).
   Stepping back hides them at once. */
.live-side .after-bars:not(.slidev-vclick-hidden) {
  transition: opacity 0.4s ease 1s;
}
.live-side .after-line:not(.slidev-vclick-hidden) {
  transition: opacity 0.4s ease 1.3s;
}
</style>

<!--
Bridge in: Same product again, but this is live 2026 data and the run was not supervised.

Script draft (TODO(João)):
In 2026 I let the system run live, without supervision.
[click] Three of the six models didn't complete.
[click] It recomputed the weights over the three that did, from their own errors, and still produced the plan.
[click] Here is the 2026 forecast. The database was copied in mid-March, so I only have two full months of sales to compare: too early to say anything about accuracy. What this scenario shows is that the system kept working when half of its models failed.

What is on screen:
- Start: the chart frame with only the actual sales: January and February 2026 as an orange line, March as a hollow point labelled "partial month" (the database was copied in mid-March). The six weights of the 2025 run on the right.
- Click 2: the 2026 weights are 21% Chronos, 22% Granite, 57% XGBoost. The system did not crash.
- Click 3: forecast around 7,700 to 8,000 kg a month, with its band. Never read March as a full month or as a sales decline.

On-screen numbers: real, item 101703 (data/sku.json → scenario1.models, scenario3). The 2026 weights are the two-decimal values shown by the prototype; replace with the training export when available.

Q&A:
- 2025 weights renormalized over the three survivors would be about 23 / 22 / 55% (Chronos / Granite / XGBoost). The real 2026 weights are 21 / 22 / 57% because the 2026 run re-validated the survivors and computed the weights from those errors. That is why the bars go through zero on the slide.
- The prototype's interface calls the weight "Current Adjustment Factor".
- Thesis §5.4 / Fig 5.24 describe a downward trend in the live window; that came from the incomplete March month (DB copied mid-March). Answer: "I found this while preparing the defense and removed the claim. Scenario 3 shows resilience, not accuracy."
- Item-ID resets remain a real data issue → future work #2.
- The war what-if on this run (thesis Fig 5.25) → backup b16. It is a stress test, never compared with sales.
- Why three models failed → backup b12.

Target time: 1:10

Bridge out: The mechanisms held up. What did the people who would use it think?
-->

---
clicks: 3
# Backup b13 links back here (<Link to="partner">).
routeAlias: partner
---

# What the partner said

<p class="slide-sub">Industrial partner's view</p>

<p class="fb-source"><Link to="b13">10 open questions</Link> · meeting, Aug 2026 · Tecnicamente's two managers · not an independent evaluation</p>

<div class="fb-stage">
  <FeedbackColumns :step="$clicks" />
</div>

<!-- TODO(João): review wording (title, subtitle, source line; column text is in data/feedback.json). Verify wording against thesis questionnaire section; don't strengthen it. -->

<style>
/* Positions are in slide pixels (the slide is 980 × 552). */
.fb-source {
  position: absolute;
  left: var(--slide-pad-x);
  top: 114px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
/* The link to backup b13 looks like the text around it; underline on hover only. */
.fb-source a {
  color: inherit;
  text-decoration: none;
}
.fb-source a:hover {
  text-decoration: underline;
}
.fb-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 164px;
}
</style>

<!--
Bridge in: The system ran on live data. But is it useful to the people who'd use it?

Script draft (TODO(João)):
I also asked the industrial partner for feedback: ten open questions, discussed in a meeting in August, answered by Tecnicamente's two managers. They're my superiors and not planners at the client, so this is the partner's view, not an independent evaluation.
[click] They valued getting purchase quantities automatically, with an explicit window for when to buy, and less manual analysis.
[click] They considered the figures operationally credible, and saw the re-weighting and the crisis simulation as useful in practice.
[click] They asked for two things next: comparing planned with actually spent, and linking items that were re-coded, the same problem we saw in Scenario 3. Both are in my future work.

Q&A:
- Waste reduction (Q2) is their expectation, not measured: they linked the explicit purchase windows to less waste from buying too early or too late.
- Q9: the tool belongs to purchasing and planning, not IT or floor operations.
- No scores: the questions were open, and the answers are summarized from my meeting notes.
- Evaluator bias: both respondents followed the project closely and were my superiors; an independent evaluation is future work → backup b13 (click "10 open questions").
- "Operationally credible" is the thesis's reading of the Q3 answer (the figures "reflect the quantities actually required"), not their literal words.

Target time: 0:45

Bridge out: So, back to the four objectives I set at the start.
-->

---
clicks: 4
---

# Objectives scorecard

<p class="slide-sub">Back to the four objectives</p>

<div class="sc-stage">
  <ObjectivesScorecard :step="$clicks" />
</div>

<!-- TODO(João): review wording (title, subtitle; the rest is in data/objectives.json and ObjectivesScorecard.vue). Verify against thesis Ch. 6. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.sc-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 118px;
}
</style>

<!--
Bridge in: So, back to the four objectives I set at the start.

Script draft (TODO(João)):
Back to the four objectives.
[click] All four were implemented: the ensemble for prediction, safety stock and recipe explosion for inventory, FEFO for waste, and the scenario engine plus fault tolerance for resilience.
[click] All four were demonstrated on real data in the three scenarios, with synthetic lots for the waste part.
[click] What I can't claim is that they were measured in real operation. Only the first is partly measured: each model's error, but not the combined forecast across the catalog.
[click] So, every objective has a working mechanism, and none has yet been measured in real use. That's exactly what the next phase has to do.

Q&A:
- Ch. 1 §1.3 promised a quantitative evaluation. With synthetic lots and simulated lead times only a qualitative one was possible; this is stated in Ch. 6.
- ◐ on objective 1 = each model's walk-forward error was measured; the combined forecast was assessed visually for one representative item, not across the catalog.
- The next step is the planned-vs-spent comparison, which is also what the partner asked for (Q7).
- The ✗ marks are grey on purpose: not measured is a limit of scope, not a failed result. The validation is functional.

Target time: 0:50

Bridge out: That's where the work stands. Looking back on it…
-->
