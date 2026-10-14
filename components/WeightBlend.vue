<!--
From six errors to six weights to one forecast (Inverse Error Weighting).

  step 0   six purple bars: the RMSE of each model
  step 1   the bars morph into weights (taller = lower error); two tags mark
           the highest-error and lowest-error models for about 2 s, then the
           formula and a small note appear below
  step 2   each forecast line takes an opacity proportional to its weight for
           about 1 s, then the six lines merge into one blue line
  step 3   a person icon and one line: the manager can replace the weights

Usage (the formula is written in the slide, so KaTeX renders it):

  <WeightBlend :step="$clicks">

  $$ w_i = ... $$

  </WeightBlend>

The layout is fixed: every part has its place from the start and only fades
in or changes height, so nothing moves between clicks.

The chart on the right is <ForecastChart compact>. Slide 13 shows the same
chart at the same position, so the blue line does not move between the slides.
The six model lines are passed into the chart through its slot.

DATA: `data/sku.json` → scenario1 is MOCK for now. The component needs
`models[].short`, `.rmse` and `.forecast` (one value per forecast month) and
`blended[].qty`.
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { automaticWeights } from '../composables/useBlend'
import { baseUnit, fmtInt, fmtPct } from '../composables/useFormat'
import sku from '../data/sku.json'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { isPrintMode } = useNav()

const WEIGH_SECONDS = 1 // click 2: how long the lines show their weight as opacity
const MERGE_SECONDS = 1 // then how long the six lines take to merge

// ----- Inverse Error Weighting, computed from the data file -----
const models = sku.scenario1.models
const blended = sku.scenario1.blended.map(b => b.qty) // the combined forecast, from the data
const weights = automaticWeights() // shared with slides 13–14 (composables/useBlend.ts)
const unit = baseUnit(sku.unit) // 'kg / month' → 'kg'

// ----- Geometry (px) -----
const W = 868
const H = 370
const px = (n: number) => `${n}px`
// Bars (left)
const LEFT_W = 456
const BAR_PITCH = LEFT_W / models.length
const BAR_W = 44
const BAR_MAX = 146 // height of the tallest bar
const BASE_Y = 204 // y of the bar baseline
const maxRmse = Math.max(...models.map(m => m.rmse))
const maxWeight = Math.max(...weights)
// The two bars that get a tag during the morph, found from the data.
const worst = models.findIndex(m => m.rmse === maxRmse)
const best = models.findIndex(m => m.rmse === Math.min(...models.map(n => n.rmse)))
const TAG_W = 232
const TAG_H = 24
const tags = [
  { i: worst, text: 'highest error → lowest weight', row: 0 },
  { i: best, text: 'lowest error → highest weight', row: 1 },
].map(t => ({
  ...t,
  // centred under its bar, but kept inside the bar area
  x: Math.min(Math.max((t.i + 0.5) * BAR_PITCH - TAG_W / 2, 0), LEFT_W - TAG_W),
  y: 236 + t.row * (TAG_H + 4),
}))
const bars = computed(() => models.map((m, i) => ({
  id: m.id,
  name: m.short,
  tagged: i === worst || i === best,
  x: i * BAR_PITCH + (BAR_PITCH - BAR_W) / 2,
  h: BAR_MAX * (props.step >= 1 ? weights[i] / maxWeight : m.rmse / maxRmse),
  rmse: fmtInt(m.rmse),
  weight: fmtPct(weights[i]),
})))
// Rows under the bars
const FORMULA_Y = 240
const FORMULA_H = 66
const NOTE_Y = 314
const MANAGER_Y = 344
// Line chart (right). Slide 13 starts its chart on this exact box and then
// moves it into `.chart-frame`: keep CH_X, CH_W and the top of this component
// in step with the `--from-12-*` values in styles/index.css.
const CH_X = 496
const CH_W = 372

// ----- Click 2: the six lines move onto the blended line -----
// `merge` goes from 0 (six separate lines) to 1 (all on the blended line).
const merge = ref(props.step >= 2 ? 1 : 0)
let frame = 0
watch(() => props.step, (now, before) => {
  cancelAnimationFrame(frame)
  if (now === 2 && before === 1 && !isPrintMode.value) {
    const t0 = performance.now()
    const tick = (time: number) => {
      // nothing moves during the first WEIGH_SECONDS: the lines only change opacity
      const x = Math.min(Math.max(((time - t0) / 1000 - WEIGH_SECONDS) / MERGE_SECONDS, 0), 1)
      merge.value = x * x * (3 - 2 * x) // ease in and out
      if (x < 1)
        frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }
  else {
    merge.value = now >= 2 ? 1 : 0
  }
})
onBeforeUnmount(() => cancelAnimationFrame(frame))
// From click 2, a line is as strong as its model's weight (the largest weight = fully opaque).
const lineOpacity = (i: number) => (props.step >= 2 ? weights[i] / maxWeight : 1)
// Values of the six lines on their way to the blended line.
const liveValues = computed(() => models.map(m => m.forecast.map((v, t) => v + (blended[t] - v) * merge.value)))
</script>

<template>
  <!-- TODO(João): review wording (all labels on this slide) -->
  <div class="wb" :class="{ weighted: step >= 1, merged: step >= 2, manager: step >= 3 }" :style="{ width: px(W), height: px(H) }">
    <!-- Bars: RMSE at click 0, weights from click 1 -->
    <span class="wb-title before">average walk-forward RMSE ({{ unit }})</span>
    <span class="wb-title after">weight · taller = lower error</span>
    <div v-for="b in bars" :key="b.id" class="wb-bar" :class="{ tagged: b.tagged }" :style="{ left: px(b.x), width: px(BAR_W), top: px(BASE_Y - BAR_MAX), height: px(BAR_MAX) }">
      <i :style="{ height: px(b.h) }" />
      <span class="wb-value" :style="{ bottom: px(b.h + 3) }">
        <span class="before">{{ b.rmse }}</span>
        <span class="after">{{ b.weight }}</span>
      </span>
    </div>
    <div class="wb-base" :style="{ top: px(BASE_Y), width: px(LEFT_W) }" />
    <span v-for="b in bars" :key="`n-${b.id}`" class="wb-name" :style="{ left: px(b.x + BAR_W / 2), top: px(BASE_Y + 6) }">{{ b.name }}</span>

    <!-- Short-lived tags during the morph (click 1) -->
    <span v-for="t in tags" :key="t.text" class="wb-tag" :style="{ left: px(t.x), top: px(t.y), width: px(TAG_W), height: px(TAG_H) }">{{ t.text }}</span>

    <!-- Formula (written in the slide) and note, after the tags -->
    <div class="wb-formula" :style="{ top: px(FORMULA_Y), height: px(FORMULA_H), width: px(LEFT_W) }">
      <slot />
    </div>
    <p class="wb-note" :style="{ top: px(NOTE_Y) }">
      RMSE floored at 0.001 · weights renormalised over models available each month · <i>M<sub>t</sub></i> = models available in month <i>t</i>
    </p>

    <!-- Manager override, click 3 -->
    <p class="wb-manager" :style="{ top: px(MANAGER_Y) }">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.400 3.600-8 8-8s8 3.600 8 8" /></svg>
      manager can replace these weights
      <span>→ next</span>
    </p>

    <!-- Six forecasts → one blended forecast -->
    <div class="wb-chart" :style="{ left: px(CH_X), width: px(CH_W) }">
      <ForecastChart series="scenario1" compact :show-band="false" :show-forecast="step >= 2">
        <template #default="{ line, forecastStart }">
          <path v-for="(m, i) in models" :key="`g${i}`" class="c-model ghost" :d="line(m.forecast, forecastStart)" />
          <g class="c-live">
            <path v-for="(v, i) in liveValues" :key="`l${i}`" class="c-model" :d="line(v, forecastStart)" :style="{ opacity: lineOpacity(i) }" />
          </g>
        </template>
      </ForecastChart>
      <!-- Sits where the chart writes "blended forecast" from click 2 on. -->
      <span class="wb-legend">6 model forecasts</span>
    </div>
  </div>
</template>

<style scoped>
.wb {
  position: relative;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.2;
}
.wb > * {
  position: absolute;
  margin: 0;
}

/* Two texts share one place: `.before` shows at click 0, `.after` from click 1. */
.before,
.after {
  transition: opacity 0.4s ease;
}
.after,
.weighted .before {
  opacity: 0;
}
.weighted .after {
  opacity: 1;
}

/* ---------- Bars ---------- */
.wb-title {
  top: 0;
  left: 0;
  color: var(--c-muted);
  white-space: nowrap;
}
.wb-bar i {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 5px 5px 0 0;
  background: var(--chart-model);
  transition: height 0.8s ease;
}
.wb-value {
  position: absolute;
  left: 50%;
  translate: -50% 0;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: bottom 0.8s ease;
}
.wb-value .after {
  position: absolute;
  left: 50%;
  top: 0;
  translate: -50% 0;
  font-weight: 600;
}
/* Amber outline on the two tagged bars while the tags show. */
.wb-bar.tagged i {
  outline: 3px solid transparent;
  outline-offset: 2px;
}
.wb-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--c-warn);
  border-radius: 999px;
  background: var(--c-surface);
  white-space: nowrap;
  opacity: 0;
}
/* Only while click 1 is the current click: in, hold for about 2 s, out. */
.weighted:not(.merged) .wb-tag {
  animation: wb-tag 2.6s ease 0.3s both;
}
.weighted:not(.merged) .wb-bar.tagged i {
  animation: wb-outline 2.6s ease 0.3s both;
}
@keyframes wb-tag {
  12%, 85% { opacity: 1; }
}
@keyframes wb-outline {
  12%, 85% { outline-color: var(--c-warn); }
}
.wb-base {
  left: 0;
  border-top: 1.5px solid var(--chart-axis);
}
.wb-name {
  translate: -50% 0;
  white-space: nowrap;
}

/* ---------- Formula, note, manager ---------- */
.wb-formula,
.wb-note,
.wb-manager {
  left: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.wb-formula {
  display: flex;
  align-items: center;
  justify-content: center;
}
.wb-formula :deep(p),
.wb-formula :deep(.katex-display) {
  margin: 0;
}
.wb-note {
  color: var(--c-muted);
  white-space: nowrap;
}
/* They share the tags' place, so they wait until the tags are gone. */
.weighted .wb-formula {
  opacity: 1;
  transition-delay: 2.7s;
}
.weighted .wb-note {
  opacity: 1;
  transition-delay: 2.9s;
}
.merged .wb-formula,
.merged .wb-note {
  transition-delay: 0s;
}
.wb-note sub {
  font-size: 0.75em;
}
.wb-manager {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  white-space: nowrap;
}
.wb-manager svg {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1.8;
  stroke-linecap: round;
}
.wb-manager span {
  color: var(--c-muted);
  font-weight: 400;
}
.manager .wb-manager {
  opacity: 1;
}

/* ---------- Line chart ---------- */
.wb-chart {
  top: 0;
}
.wb-legend {
  position: absolute;
  top: 0;
  left: 66px; /* after "actual" in the chart's legend */
  color: var(--chart-model);
  line-height: 20px;
  white-space: nowrap;
  transition: opacity 0.4s ease;
}
.merged .wb-legend {
  opacity: 0;
  transition-delay: 1.5s;
}
/* The chart's own blue line and legend entry wait for the merge to finish. */
.merged .wb-chart {
  --forecast-delay: 1.7s;
}
.c-model {
  fill: none;
  stroke: var(--chart-model);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Click 2 runs in three beats: opacity by weight (the inline style on each
   line), then the merge (script), then the swap to the blue line (delays here and above). */
.c-live .c-model {
  transition: opacity 0.4s ease;
}
.c-live {
  transition: opacity 0.3s ease;
}
.merged .c-live {
  opacity: 0;
  transition-delay: 1.9s;
}
/* Faint copies stay behind after the merge, so the six lines remain readable. */
.c-model.ghost {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.merged .c-model.ghost {
  opacity: 0.22;
  transition-delay: 1.9s;
}
@media print, (prefers-reduced-motion: reduce) {
  .wb * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
