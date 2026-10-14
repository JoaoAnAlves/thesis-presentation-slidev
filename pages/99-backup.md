---
routeAlias: b0
---

# Backup index

<div class="backup-index">
<Link to="b1"><span class="num">B1</span> Model configuration</Link>
<Link to="b2"><span class="num">B2</span> Model-specific data prep</Link>
<Link to="b3"><span class="num">B3</span> Sequence diagrams</Link>
<Link to="b4"><span class="num">B4</span> Use-case diagrams</Link>
<Link to="b5"><span class="num">B5</span> Conceptual architecture</Link>
<Link to="b6"><span class="num">B6</span> Walk-forward details</Link>
<Link to="b7"><span class="num">B7</span> Why 1.65</Link>
<Link to="b8"><span class="num">B8</span> Evaluation limitations</Link>
<Link to="b9"><span class="num">B9</span> BOM mining algorithm</Link>
<Link to="b10"><span class="num">B10</span> Synthetic lots and simulated lead times</Link>
<Link to="b11"><span class="num">B11</span> Scenario multiplier logic</Link>
<Link to="b12"><span class="num">B12</span> Scenario 3 model failures</Link>
<Link to="b13"><span class="num">B13</span> Partner questionnaire</Link>
<Link to="b14"><span class="num">B14</span> Tech stack details</Link>
<Link to="b15"><span class="num">B15</span> Scope evolution</Link>
<Link to="b16"><span class="num">B16</span> Scenario 3 + war what-if</Link>
</div>

<style>
.backup-index {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px 20px;
  font-size: 17px;
}
.backup-index a {
  display: flex;
  color: var(--c-text);
}
.backup-index .num {
  flex: 0 0 2.6em;
  color: var(--c-accent);
}
</style>

---
routeAlias: b1
---

# Model configuration

Thesis Table 4.2

<span class="placeholder">B1 · placeholder · content in Phase 5</span>

---
routeAlias: b2
---

# Model-specific data prep

Thesis Table 4.1

<span class="placeholder">B2 · placeholder · content in Phase 5</span>

---
routeAlias: b3
---

# Sequence diagrams

Training, Refinement, Refinement with user, Planning, Scenario · thesis Figs 4.2–4.6

<span class="placeholder">B3 · placeholder · content in Phase 5</span>

---
routeAlias: b4
---

# Use-case diagrams

Thesis Figs 3.1–3.3

<span class="placeholder">B4 · placeholder · content in Phase 5</span>

---
routeAlias: b5
---

# Conceptual architecture

Thesis Fig 3.4

<span class="placeholder">B5 · placeholder · content in Phase 5</span>

---
routeAlias: b6
---

# Walk-forward details

Including the fallback to a hold-out split

<span class="placeholder">B6 · placeholder · content in Phase 5</span>

---
routeAlias: b7
---

# Why 1.65

90% prediction interval; upper bound = one-sided 95%

<span class="placeholder">B7 · placeholder · content in Phase 5</span>

---
routeAlias: b8
---

# Evaluation limitations

Tree models one-step vs multi-step; clipping threshold over the full series; hyperparameters chosen on 2025

<span class="placeholder">B8 · placeholder · content in Phase 5</span>

---
routeAlias: b9
---

# BOM mining algorithm

The algorithm and its limits

<span class="placeholder">B9 · placeholder · content in Phase 5</span>

<img src="/img/recipe_builder_white.png" alt="Recipe Builder screen" class="backup-shot">

<!-- TODO(João): review wording; the Recipe Builder screenshot is parked here from slide 6 -->

---
routeAlias: b10
---

# Synthetic lots and simulated lead times

What is synthetic and why

<span class="placeholder">B10 · placeholder · content in Phase 5</span>

---
routeAlias: b11
---

# Scenario multiplier logic

Including the 0.00× default when no reference data exists

<span class="placeholder">B11 · placeholder · content in Phase 5</span>

---
routeAlias: b12
---

# Scenario 3 model failures

What I know about the cause

<span class="placeholder">B12 · placeholder · content in Phase 5</span>

---
routeAlias: b13
# B13 is split over two slides: this one reads B13a, the next B13b (see slide-bottom.vue).
backupSuffix: a
---

# Partner questionnaire · Q1–Q5

<PartnerQuestionnaire :part="1" />

<p class="pq-foot">Open questions, meeting of Aug 2026 · answers summarized from my notes · <Link to="partner">← back to slide 19</Link> · <Link to="b13b">Q6–Q10 →</Link></p>

<!-- TODO(João): check wording against the thesis (§5.5, Appendix A), don't strengthen it. Text is in data/questionnaire.json. -->

<style>
.pq-foot {
  position: absolute;
  left: var(--slide-pad-x);
  bottom: 44px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
</style>

<!--
Questions shortened from thesis Appendix A; answers summarized from §5.5.
Respondents: Tecnicamente's two managers (my superiors, not planners at the client). Partner's view, not an independent evaluation.
-->

---
routeAlias: b13b
backupSuffix: b
backupContinues: true
---

# Partner questionnaire · Q6–Q10

<PartnerQuestionnaire :part="2" />

<p class="pq-foot">Open questions, meeting of Aug 2026 · answers summarized from my notes · <Link to="partner">← back to slide 19</Link> · <Link to="b13">← Q1–Q5</Link></p>

<!-- TODO(João): check wording against the thesis (§5.5, Appendix A), don't strengthen it. Text is in data/questionnaire.json. -->

<style>
.pq-foot {
  position: absolute;
  left: var(--slide-pad-x);
  bottom: 44px;
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
}
</style>

<!--
Questions shortened from thesis Appendix A; answers summarized from §5.5.
Q8 and Q10 are not on slide 19; Q9 (ownership: purchasing and planning) is in its Q&A notes.
-->

---
routeAlias: b14
---

# Tech stack details

<span class="placeholder">B14 · placeholder · content in Phase 5</span>

---
routeAlias: b15
---

# Scope evolution

Since the February presentation

<span class="placeholder">B15 · placeholder · content in Phase 5</span>

---
routeAlias: b16
---

# Scenario 3 + war what-if

<div class="stage-chart">
  <ForecastChart series="scenario3" scenario />
</div>

<div class="stage-side">

Same 2022 monthly pattern as in 2025.

<p class="warn">A stress test: it is not compared with sales.</p>

<p class="muted">Thesis Fig. 5.25 · reference: Ukraine war, 2022</p>

</div>

<!-- TODO(João): review wording -->

<!--
Real data, item 101703 (data/sku.json → scenario3 and scenario3.whatIf). Blue + band = the live 2026 forecast; dotted = the war what-if on that run; orange = actual sales for January and February 2026; the hollow point is March, a partial month (database copied mid-March).

The dotted line applies the same 2022 month-by-month multipliers as Scenario 2 did on 2025. It falls in spring because 2022 sales fell in spring. March 2026 is a partial month, so there is no sales decline to compare it with: a what-if is never scored against sales. TODO(João): your caption said "closeness to the real drop is not accuracy"; I replaced it because there is no confirmed drop.
-->
