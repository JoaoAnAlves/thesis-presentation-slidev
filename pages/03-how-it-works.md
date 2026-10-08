---
layout: section
act: Act 3
---

# How it works

Following one SKU through the pipeline

---

# Working with a live factory database

<span class="placeholder">Slide 9 · placeholder · content in Phase 4</span>

<!--
Key points:
- Records from 2014 to 2026; noise columns removed; months without sales zero-filled.
- No recipe table: recipes mined from production events (grouped by document / session / workstation).
- QTY_REQ = average consumed/produced ratio; fish/meat keyword guard.
- Honesty: BOM quantities are reconstructed, not validated by the company.

Target time: 0:50
-->

---

# Six models, three families

<span class="placeholder">Slide 10 · placeholder · ForecastChart in Phase 2</span>

<!--
Key points:
- Tree-based: Random Forest, XGBoost, LightGBM (one global model across items).
- Prophet: per item, multiplicative yearly seasonality.
- Foundation, zero-shot: Chronos t5-small at P70, Granite TTM with context 512.
- Six lines appear on the SKU chart.

Target time: 1:00
-->

---

# Walk-forward validation

<span class="placeholder">Slide 11 · placeholder · WalkForward in Phase 2</span>

<!--
Key points:
- Cut-off starts 12 months before the target and advances monthly.
- Retrain at each step, score on unseen months.
- Animated sliding window.

Target time: 0:50
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
