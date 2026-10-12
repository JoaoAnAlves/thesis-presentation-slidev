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
[click] Then the cut-off moves one month to the right, the model is retrained on a slightly longer history, and tested again. The cut-off starts twelve months before the target month, so this gives twelve folds, and each fold gives one error.
[click] The average error across the folds is the model's RMSE. The same procedure runs for all six models, so each one ends with its own score. Those six scores are what the next step turns into weights.

If asked (what if walk-forward results are missing for a model?): the RMSE of its single date-based hold-out split is used instead → backup b6.
If asked (is the fold error used anywhere else?): yes. The band on the combined forecast uses, when available, the error of the fold whose cut-off falls in the same calendar month as the forecast (slide 13).
If asked (is the comparison between models fair?): not fully. The tree models forecast one month ahead from observed lag values, while Prophet, Chronos and Granite forecast the whole evaluation window from the end of the training data, so the tree models are scored on an easier task and tend to get larger weights → backup b8.
If asked (the RMSE in the formula): it is the average walk-forward error across all folds, bounded below by 0.001 to avoid division by zero.
TODO(João): the drawing shows each test window running from the cut-off to the target month. The thesis only says "the months after it"; check that this matches the code.

Target time: 0:50

Bridge out: Six error scores. How do they become one forecast?
-->

---

# Inverse Error Weighting

<span class="placeholder">Slide 12 · placeholder · WeightBars in Phase 2</span>

<!--
Key points:
- Weight of each model = inverse of its RMSE, normalized over the models that ran.
- RMSE bars morph into weight bars, then into the blended line.
- Renormalizing over the models that ran is what lets it survive failures.

Target time: 1:00
-->

---

# Prediction interval → safety stock

<span class="placeholder">Slide 13 · placeholder · content in Phase 4</span>

<!--
Key points:
- Band = forecast ± 1.65·RMSE = 90% prediction interval. Never call it 95%.
- Distance to the upper bound = safety stock passed to planning.
- Band grows on click.

Target time: 0:50
-->

---

# Human-in-the-loop

<span class="placeholder">Slide 14 · placeholder · needs /video/weights.mp4</span>

<!--
Key points:
- The manager can override the model weights.
- Short recorded clip of the real UI.

Target time: 0:40
-->

---

# Planning: BOM explosion + FEFO

<span class="placeholder">Slide 15 · placeholder · BomTree and FefoLots in Phase 2</span>

<!--
Key points:
- Tree expands finished product → raw materials (net requirements).
- Lots consumed earliest-expiry first; expiring lot flagged.
- Honesty: scrap is a fixed 2%, lead times are simulated (random 2–7 days), lots are synthetic.

Target time: 0:50
-->
