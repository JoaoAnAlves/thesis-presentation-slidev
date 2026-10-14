---
layout: section
act: 3
title: How it works
question: How does one product's history become a purchase plan?
covers: [Data, Models, Weighting, Planning]
loopMode: live
focus: [data, models, forecast, plan]
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: How does one product's history become a purchase plan?
-->

---
clicks: 2
---

# Real data, real gaps

<PipelineTracker stage="train" />

<DataProvenance :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: Before any model runs: what data is there to work with?

Script draft (TODO(João): no script came with the request; this is Claude's draft from the thesis text, replace with your own):
The system runs on a live factory database, and that database does not hold everything a planner needs. So I split the inputs into three groups. Real: sales from 2014 to 2026, inventory records and production records. Reconstructed from those records: the monthly demand series, cleaned and with empty months filled with zero; the recipes; and the shelf life of each item, taken as the median time between production and expiry. Simulated, because it is not in the data at all: lead times, drawn at random between two and seven days; two synthetic stock lots per item; and a fixed 2% scrap.
[click] The recipes deserve a closer look, because there is no recipe table. Each production event shows what entered stock, the parent, and what was consumed, the components. For each pair I take the ratio of consumed to produced, and average it over all events. That average is the required quantity. A keyword guard stops fish components being linked to meat products, and the other way round.
[click] So: forecasting runs on real data. Planning runs on reconstructed and simulated inputs. It shows that the logic works, not the factory's real stock position.

If asked (are the recipes right?): the BOM was not validated with the company. The quantities are estimates from real production records (documents since January 2024), not the manufacturer's actual recipes.
If asked (several products in one event): each component is attributed to every product made in that event, which can overstate some ratios.
If asked (products with no component found): they get a placeholder component at a 1:1 ratio, marked as mock data, so the planner can still process them.
If asked (the lots): two synthetic lots per item, dated relative to the simulation date of 15 February 2025: one expiring two days later, one after the estimated shelf life (seven days when no valid dates exist). Quantities come from the item's inventory records.
Backups: b2 Model-specific data prep, b9 BOM mining, b10 Synthetic lots and simulated lead times.

Target time: 0:50

Bridge out: With one clean monthly series per item, what do the models make of it?
-->

---
clicks: 2
---

# Six models, three families

<PipelineTracker stage="train" />

<ModelFamilies :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: With one clean monthly series per item, what do the models make of it?

Script draft (TODO(João): no script came with the request; this is Claude's draft from the thesis text, replace with your own):
I do not trust one model, so the system runs six, from three families, and each family looks at demand in a different way.
The tree-based models, Random Forest, XGBoost and LightGBM, do not read a time series. They read a table: the demand of the last three months, moving averages, the calendar month. From one row they predict the next month. One model is trained for all items.
Prophet is the statistical one. It splits each item's series into a trend and a yearly season, and it is fitted item by item.
Chronos and Granite are foundation models. They were pre-trained on large collections of time series and I use them as they are, with no training on the factory's data. Chronos returns many sampled futures, and I take the 70th percentile.
[click] (let the three diagrams play: table → next month; trend and season → one series; sampled paths → P70)
[click] Why three families? Because they make different assumptions, they fail in different places. A weakness of one family, for example the foundation models with long runs of zero sales, is diluted in the combined forecast instead of going straight to the planner.

Validation uses P70; predict_service uses the median (P50). Inconsistency, on the errata list.
If asked (why P70 and not the median?): the thesis only states the effect: taking the 70th percentile of Chronos' sampled paths biases its forecast upward. TODO(João): write your reason for choosing it here.
If asked (why one tree model for all items?): each of the three is trained once across all items, and the item ID is left out of the features, so the model learns how demand relates to its recent history in general instead of memorizing individual items.
If asked (the P95 cap): demand is capped at each item's 95th percentile, and that threshold is computed over the full series, evaluation months included, which makes the tree models' RMSE optimistic → backup b8.
If asked (hyperparameters): one parameter set per model for the whole catalog, chosen during development by comparing forecasts with 2025 demand, so Scenario 1 reflects some tuning on that period → backup b8.
If asked (the drawing): Prophet's seasonality is multiplicative, so peaks scale with the item's volume. The feature table also has the EMA3/EMA6 ratio and a holiday flag, not drawn. The dashed line in the fan is the median of the sampled paths; P70 sits above it. Granite returns one forecast, with no sampled paths.
Backups: b1 Model configuration (Table 4.2), b2 Model-specific data prep (Table 4.1), b8 Evaluation limitations.

Target time: 1:00

Bridge out: Six forecasts for the same item. How do I know which ones to trust?
-->

---
clicks: 2
---

# How wrong is each model?

<PipelineTracker stage="train" />

<WalkForward :step="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: Six forecasts for the same item. How do I know which ones to trust?

Script draft (TODO(João): no script came with the request; this is Claude's draft from the thesis text, replace with your own):
To weight the models I first need to know how wrong each one usually is, and I want that measured on data the model has not seen. This is walk-forward validation. I pick a cut-off date. The model is trained only on the months before it, and tested on the months after it.
[click] Then the cut-off moves one month to the right, the models are retrained on a slightly longer history, and tested again. The cut-off starts twelve months before the target month, so this gives twelve folds, and every fold scores all six models.
[click] For each model, the average error over the folds is its RMSE. So each model ends with one score, and those six scores are what the next step turns into weights.

Key point: Each fold scores all six models over the whole catalog (one pooled RMSE per model per fold). RMSEᵢ = average of those fold RMSEs (walk_forward_validation_service._compute_average_metrics). Weights are per model, the same for every product. The per-calendar-month fold error is reused later for the band (slide 13).

If asked (what if walk-forward results are missing for a model?): the RMSE of its single date-based hold-out split is used instead → backup b6.
If asked (is the fold error used anywhere else?): yes. The band on the combined forecast uses, when available, the error of the fold whose cut-off falls in the same calendar month as the forecast (slide 13).
If asked (is the comparison between models fair?): not fully. The tree models forecast one month ahead from observed lag values, while Prophet, Chronos and Granite forecast the whole evaluation window from the end of the training data, so the tree models are scored on an easier task and tend to get larger weights → backup b8.
If asked (why not one weight per product?): weights are per model, the same for every product, because each fold's RMSE is pooled over the whole catalog. Per-product weights = possible improvement.
If asked (the RMSE in the formula): it is the average walk-forward error across all folds, bounded below by 0.001 to avoid division by zero.
TODO(João): the drawing shows each test window running from the cut-off to the target month. The thesis only says "the months after it"; check that this matches the code.

Target time: 0:50

Bridge out: Six error scores. How do they become one forecast?
-->

---
clicks: 3
---

# From errors to weights

<PipelineTracker stage="refine" />

<WeightBlend :step="$clicks">

$$
w_{i,t} = \dfrac{1/\mathrm{RMSE}_i}{\sum_{j\in M_t} 1/\mathrm{RMSE}_j}
\qquad
\hat y_t = \sum_{i\in M_t} w_{i,t}\,\hat y_{i,t}
$$

</WeightBlend>

<!-- TODO(João): review wording -->

<!--
Bridge in: Six error scores. How do they become one forecast?

Script draft (TODO(João): no script came with the request; this is Claude's draft, replace with your own):
These are the six scores from the previous slide: the average walk-forward RMSE of each model.
[click] Each model gets a weight that is the inverse of its error, divided by the sum of all the inverses. So the bars flip: the model with the lowest error gets the tallest bar. No model is thrown away; a weaker one just counts for less. Two details: the RMSE has a floor of 0.001, so nothing divides by zero, and the weights are renormalised over the models that are available in each month, the set M_t in the formula.
[click] With the weights, the six forecasts become one: for each month, the blended forecast is the weighted sum of the six. This blue line is what the rest of the system works with.
[click] And these weights are a starting point. The manager can replace them, which I show in two slides.

If asked (are the weights different per product?): no. The weights are per model, computed over the whole catalog, so in practice they are the same for every product. Per-item weights are future work.
If asked (why not just the best model?): No single model is best for every product or month; the mix is more stable; and it survives model failures (Scenario 3).
If asked (why keep the weak models?): the thesis frames it as down-weighting rather than discarding, so the system favours the more accurate models without manual model selection.
If asked (what happens when a model fails?): the weights are renormalised over the models that produced a forecast for that month, so the combined forecast stays valid. That is what happened in Scenario 3 (slide 18).
If asked (manual weights): when the manager supplies weights, they replace the computed ones and are normalised in the same way.
On-screen numbers: real, item 101703 (data/sku.json → scenario1).

Target time: 1:00

Bridge out: One line is still a single guess. How sure is it?
-->

---
clicks: 3
---

# How wrong could it be?

<p class="slide-sub">From error to safety stock</p>

<PipelineTracker stage="refine" :pulse="$clicks >= 3 ? 'plan' : undefined" />

<!-- The chart starts on slide 12's box, then moves into the shared frame
     (styles/index.css, "Chart frame"). The move only plays when arriving forwards. -->
<div class="chart-frame" :class="{ 'enter-from-12': $nav.navDirection > 0 }">
  <ForecastChart
    series="scenario1" compact
    :show-band="$clicks >= 1"
    :highlight-month="$clicks >= 2 ? '2025-07' : null"
    :show-safety-bracket="$clicks >= 3"
  />
</div>

<div class="chart-frame-side">
<div v-click="1" class="band-formula">

$$
\hat y_t \pm 1.65\,\mathrm{RMSE}_t
$$

<p class="band-label">90% prediction interval</p>
</div>

<p v-click="2">Each month uses the error from the same calendar month in walk-forward.</p>

<ToPlanningBox month="2025-07" :show="$clicks >= 3" />
</div>

<!-- TODO(João): review wording (title, subtitle, formula label, caption; chart labels are in ForecastChart.vue, the box in ToPlanningBox.vue) -->

<style>
.band-formula {
  font-size: 30px;
}
.band-formula .katex-display {
  margin: 0 0 4px;
  text-align: left;
}
.band-formula .katex-display > .katex {
  text-align: left;
}
.band-formula .band-label {
  color: var(--chart-forecast);
  font-size: 18px;
  font-weight: 600;
}
</style>

<!--
Bridge in: One line is still a single guess. How sure is it?

Script draft (TODO(João)):
One line isn't enough to plan with. The question is how wrong it could be.
[click] The answer comes from walk-forward validation: for every month, I already know how far each model was off in that same calendar month, and I combine those errors with the same weights. That error, times 1.65, gives this band. It's a 90% prediction interval, so the upper bound is exceeded only about 5% of the time.
[click] (point at the highlighted month: its band uses the error from that calendar month)
[click] The distance from the forecast to that upper bound is the safety stock. For July, that's 8,041 kilos plus 5,804, so planning receives 13,845. (Real numbers for item 101703, as printed in the box.) This is what goes to planning: not just the forecast, but forecast plus safety stock. Before that, though, the manager can still step in.

Q&A:
- Why 1.65? → backup b7 (90% prediction interval; the upper bound is a one-sided 95% limit; assumes approximately normal forecast errors). Never call the band 95%.
- Was the coverage checked? Coverage was not measured catalog-wide.
- The RMSE is pooled over the catalog (see Fig 5.14) → per-item error scaling is the first fix.
On-screen numbers: real, item 101703 (data/sku.json → scenario1).

Target time: 0:45

Bridge out: Before the forecast goes to planning, can a person correct the model?
-->

---
clicks: 4
---

# Human-in-the-loop

<p class="slide-sub">The manager can re-weight the models</p>

<PipelineTracker stage="refine" />

<WeightOverride :step="$clicks" />

<!-- TODO(João): review wording (title, subtitle; the rest is in WeightOverride.vue) -->

<!--
Bridge in: Before the forecast goes to planning, can a person correct the model?

Script draft (TODO(João)):
Those weights are a default, not a final answer. The manager knows things the data doesn't: a supplier problem, a new client, or simply that one model behaves strangely for this product. So the manager can change the weights.
[click] Behind the blue line are the six model forecasts. (Chronos is the purple one; its bar is the only one still purple.)
[click] Here I give Chronos half of the weight, and the blue line moves toward it. The others are rescaled so the total stays at 100%, and everything after it is recalculated: the forecast, the band, and the safety stock that goes to planning. Giving more weight to a less accurate model also widens the band, so the safety stock goes up.
[click] Notice the band changes too, because it uses the same weights.
[click] And this is the same action in the prototype.

Q&A:
- Do overrides help? Not measured. The thesis shows the mechanism works, not that manual weights improve the forecast.
- The default stays automatic: without an override the system uses the inverse-error weights.
- TODO(João): check what the prototype does when all weights are set to 0 (division by zero in the normalization?) and write the answer here.
- Thesis wording: manual weights replace the computed ones and are normalized in the same way.
On-screen numbers: real forecasts and weights for item 101703 (data/sku.json → scenario1). The override shown (Chronos = 50%) is an illustration, not a result.

Target time: 0:45

Bridge out: With a forecast and a safety stock, what has to be bought, and when?
-->

---
clicks: 3
---

# Planning

<p class="slide-sub">From product demand to raw-material orders</p>

<PipelineTracker stage="plan" />

<div class="plan-stage">
  <BomTree :expanded="$clicks >= 1" :focus="$clicks >= 2" :dim-others="$clicks === 2" :show-routes="$clicks >= 3" />
  <FefoLots class="plan-lots" :show="$clicks >= 2" />
  <OrderTimeline class="plan-order" :show="$clicks >= 3" />
  <p v-click="1" class="plan-foot">Recipes reconstructed from production records · lead times simulated · stock lots synthetic</p>
</div>

<!-- TODO(João): review wording (title, subtitle, footnote; the rest is in BomTree.vue, FefoLots.vue, OrderTimeline.vue) -->

<style>
/* Positions are in slide pixels (the slide is 980 × 552). Every block has its
   place from the start and only fades in, so nothing moves between clicks. */
.plan-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 116px;
  width: 868px;
}
.plan-lots {
  position: absolute;
  left: 0;
  top: 196px;
  width: 100%;
}
.plan-order {
  position: absolute !important;
  left: 0;
  top: 300px; /* the lot cards end at 281 */
  width: 100%;
}
.plan-foot {
  position: absolute;
  left: 0;
  top: 370px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
  white-space: nowrap;
}
</style>

<!--
Bridge in: With a forecast and a safety stock, what has to be bought, and when?

Script draft (TODO(João)):
Planning takes the 15,241 kilos and turns them into ingredients. (It is the "to planning" total slide 14 ends on, with the manager's override. The recipe, lots and dates below are still MOCK.)
[click] The system uses the recipe, the bill of materials, to multiply the product demand by the quantity of each ingredient per unit, plus 2% for scrap. If a recipe contains an intermediate product, it's exploded again.
[click] Then it looks at the stock. Lots are used first-expired, first-out: the one that expires earliest goes first. If a lot will expire before it's needed, the system raises a waste alert instead of counting on it. What's left is the net requirement.
[click] Finally, working back from the date it's needed, minus the supplier lead time and a three-day buffer, it gives the order: 6,876 kilos of fish fillet by the 23rd of June. (MOCK recipe and lots: 6,996 − 120 = 6,876. TODO(João): the mock lots are far too small for a real plan of 15,241 kg; replace data/sku.json → planning.) If that date has already passed, the alert becomes critical.

Q&A:
- Are the recipes right? The BOM is reconstructed from production records, not validated by the company → backup b9.
- Scrap is a fixed 2% and the buffer a fixed 3 days; neither is estimated from data.
- TODO(João): verify the gross-need formula against intelligent_planner_service_final.py (scrap on the forecast only, or re-applied at each BOM level?). The slide currently applies it at each level (BomTree prop applyScrapPerLevel).
- Lead times are simulated (random 2–7 days) and the stock lots are synthetic → backup b10.
- Everything on this slide is MOCK (invented recipe, lots and dates in data/sku.json → planning). It shows the logic, not the factory's real stock.

Target time: 1:00

Bridge out: That's the full pipeline on one product. Now: what happened when I ran it on real data?
-->
