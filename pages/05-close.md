---
layout: section
act: 5
title: Close
question: What did it achieve, and what comes next?
covers: [Scorecard, Lessons, Future work]
loopMode: live
labeled: true
labelOpacity: 0.4
---

<!-- TODO(João): review wording (text is in the frontmatter above) -->

<!--
Bridge in: What did it achieve, and what comes next?
-->

---
clicks: 2
---

# What I'm proud of · what I'd do differently

<div class="close-stage">
  <CloseColumns :step="$clicks" />
</div>

<!-- TODO(João): the four items are drafts (data/close.json): choose and rewrite. Review the title and the column titles (CloseColumns.vue) too. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.close-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 132px;
}
</style>

<!--
Bridge in: That's where the work stands. Looking back on it…

Script template (TODO(João): fill in once the four items are final):
Looking back, two things I'm proud of.
[click] First, [proud 1]. Second, [proud 2].
[click] And two things I'd do differently. [differently 1, with the reason], which is why it's first on the next slide. And [differently 2, with the reason].

Drafts currently on the slide (Claude's, from your brief; replace them in data/close.json):
- Proud 1: it held up live. In Scenario 3 only Chronos, Granite and XGBoost completed, the weights were renormalized over those three, and the plan was still produced.
- Proud 2: the pipeline runs end to end, from the raw factory database (slide 9) to an order date (slide 15). There was no recipe table, so the recipes were mined from production records.
- Differently 1: measure the combined forecast across the catalog from day one. Reason: only per-model error was measured; it is the missing measurement on the scorecard (slide 20). …which is why it's first on the next slide.
- Differently 2: keep test settings separate from live settings. Reason on the slide: the Scenario 1 limits broke 3 models in Scenario 3. Thesis §5.4 says "most likely" (validation gates, data-density thresholds or filters tuned to the 2025 data, never fully removed): say it as the likely cause, not a confirmed one. TODO(João): say it in your own words.

Target time: 0:50

Bridge out: Those lessons decide the order of what comes next.
-->

---
clicks: 2
---

# Future work, prioritized

<div class="fw-stage">
  <FutureWorkList :step="$clicks" />
</div>

<!-- TODO(João): review wording (title; rows are in data/future-work.json). Check against thesis Ch. 6. -->

<style>
/* Position in slide pixels (the slide is 980 × 552). */
.fw-stage {
  position: absolute;
  left: var(--slide-pad-x);
  top: 118px;
}
</style>

<!--
Bridge in: Those lessons decide the order of what comes next.

Script draft (TODO(João)):
So the next steps come in two groups.
[click] First, prove that it works. That means measuring the combined forecast across the whole catalog, the lesson from the previous slide, building a history bridge so re-coded items keep their past, and comparing what was planned with what was actually spent. That's how the effect on stock and waste can finally be measured, and the partner asked for both of the last two.
[click] Then, extend it: weekly data and dedicated methods for products that sell irregularly, real-time progress in the interface, and factory capacity and costs in the plan.

Q&A:
- Thesis Ch. 6 also lists using credit notes and quality logs to raise return-risk warnings; it is not on the slide.
- The grey chips say where each item comes from; the linked ones jump to that slide (20 scorecard, 18 Scenario 3, 19 partner, 15 planning).
- Two-stage model for irregular demand (thesis Ch. 6) is no longer named on the slide; only Croston is.
- Croston's method forecasts both when a sale happens and how much is sold; the two-stage approach first checks whether a sale is likely.
- "Polling today" (chip on item 5): TODO(João): I could not find polling described in the thesis text; confirm this is how the interface gets job progress today.

Target time: 0:45

Bridge out: Thank you. I'm happy to take your questions.
-->

---
layout: cover
variant: closing
---

# AI-Enhanced MRP for Food Manufacturing

<p class="thanks">Thank you</p>

<p class="questions">Questions?</p>

<!-- TODO(João): review wording -->

<!--
Bridge in: That is the work, what it showed, and what comes next.

Key points:
- Thank the jury, the supervisor and the partner.
- Hand over to questions.

Target time: 0:20
-->
