---
clicks: 3
---

# Pressure on food manufacturing

<div class="tile-row">
  <StatTile icon="waste" :value="1.3" :decimals="1" prefix="~" suffix=" B" label="tons of food lost or wasted per year" source="Roy et al., 2023" :active="$clicks >= 1" />
  <StatTile icon="workers" :value="70" prefix="~" suffix="%" label="of food-processing firms report labour shortages" source="Sharma, 2025" :active="$clicks >= 2" />
  <StatTile icon="shock" label="Ukraine war · Strait of Hormuz disruption" source="FAO, 2026" :active="$clicks >= 3">2022 · 2026</StatTile>
</div>

<!-- TODO(João): review wording -->

<!--
Bridge in: Why does production planning in food manufacturing need help in the first place?

Script draft (written by Claude from the slide plan; replace with your own):
- [click] Around 1.3 billion tons of food are lost or wasted every year (Roy et al., 2023).
- [click] Around 70% of food-processing firms report labour shortages (Sharma, 2025), so there are fewer people to plan and re-plan by hand.
- [click] And the environment keeps shifting: the 2022 war in Ukraine, the 2026 Strait of Hormuz disruption (FAO, 2026).
- Perishable product, fewer people, unstable supply: planning has little margin for error.

Target time: 0:50

Bridge out: Planning systems already exist in these factories. Why are they not enough?
-->

---
clicks: 2
---

# Why classic MRP falls short here

<div class="stage-chart">
  <DemandGapChart :stage="$clicks" />
</div>

<div class="stage-side">

**MRP assumes**

<ul class="plain-list">
  <li>Static demand</li>
  <li>Fixed lead times</li>
  <li>No shelf life</li>
  <li>Slow reaction to shocks</li>
</ul>

<p v-click="2" class="warn">Result: waste, stock-outs, overproduction.</p>

</div>

<!-- TODO(João): review wording -->

<!--
Bridge in: Planning systems already exist in these factories. Why are they not enough?

Script draft (TODO(João)):
- A classic MRP works from static assumptions: demand is taken as given, lead times are fixed, and shelf life is not part of the calculation.
- [click] This is one real product in 2024: demand more than doubles between April and August.
- [click] A plan that assumes stable demand will be wrong in both directions.

On screen (data/sku.json, item 101703, real): lowest month April, 3,988 kg; highest August, 8,867 kg; ×2.2 within one year.

Target time: 1:00

Bridge out: So what should a tool do about it, without replacing the MRP the factory already runs?
-->

---
clicks: 4
---

# Goal and objectives

<p class="lead">A decision-support tool that works <strong>alongside</strong> the existing MRP.</p>

<ObjectivesCard :revealed="$clicks" />

<!-- TODO(João): review wording -->

<!--
Bridge in: So what should a tool do about it, without replacing the MRP the factory already runs?

Script draft (written by Claude from the slide plan; replace with your own):
- The goal is a decision-support tool that works alongside the existing MRP. It does not replace it.
- [click] Objective 1: better prediction of demand and of the materials needed.
- [click] Objective 2: inventory optimization.
- [click] Objective 3: less waste.
- [click] Objective 4: resilience to disruptions.
- I come back to these four at the end and say honestly how far each one got.

Target time: 0:50

Bridge out: What must the system do, and for whom?
-->
