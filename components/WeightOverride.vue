<!--
Slide 14: the manager re-weights the models, and everything after the weights
is recomputed.

  step 0   identical to the end of slide 13: automatic weights, chart with band,
           "to planning" box for the highlighted month
  step 1   the six model forecasts appear behind the band: the boosted model
           in purple, the other five in light grey; the other five bars turn
           grey too, so bar and line share a colour
  step 2   a slider knob appears on the boosted bar and moves to its new
           weight; the other bars shrink; the chart's line and band move to
           the new values, and the old line stays as a grey dashed ghost
  step 3   the box shows old numbers struck through and new numbers in teal;
           a caption appears
  step 4   a clip of the prototype fades in over the chart

Usage:  <WeightOverride :step="$clicks" />
        <WeightOverride :step="$clicks" boost="Prophet" :boost-weight="0.4" />

`boost` is the model's name as written on the bars (or its id in the data file).
Without the props, the override is MANAGER_OVERRIDE in composables/useBlend.ts,
which slide 15 also uses for its plan. Prefer changing it there: with the props,
slide 15 would no longer start from the number this slide ends on.

All numbers come from composables/useBlend.ts (data/sku.json → scenario1, MOCK).

The pieces are placed directly on the slide (positions in slide pixels); the
chart sits in the shared `.chart-frame` (styles/index.css), as on slide 13.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { MANAGER_OVERRIDE, toPlanning, useBlend } from '../composables/useBlend'
import { fmtPct } from '../composables/useFormat'
import { useTween } from '../composables/useTween'

const props = withDefaults(defineProps<{
  step?: number
  boost?: string
  boostWeight?: number
}>(), { step: 0, boost: MANAGER_OVERRIDE.model, boostWeight: MANAGER_OVERRIDE.weight })

const MONTH = '2025-07' // the month highlighted on slide 13
const TWEEN_MS = 800 // bars; the chart uses its own BLEND_TWEEN_MS (also 800)

const { models, months, automatic, withOverride } = useBlend()
// The boosted model, found by name or id (capital letters do not matter).
const boosted = models.find(m => [m.short, m.id].some(n => n.toLowerCase() === props.boost.toLowerCase())) ?? models[0]
const manual = withOverride(boosted.id, props.boostWeight)
const compared = computed(() => props.step >= 1) // model lines visible
const overridden = computed(() => props.step >= 2)

// Bars: the weights glide from automatic to manual.
const weights = useTween(() => (overridden.value ? manual.weights : automatic.weights), TWEEN_MS)
const rows = computed(() => models.map((m, i) => ({ id: m.id, name: m.short, weight: weights.value[i] })))

// Chart: null = the values stored in the file (same picture as slide 13).
const chartBlend = computed(() => (overridden.value ? manual : null))

// Box: the new numbers for the highlighted month.
const t = months.indexOf(MONTH)
const boxOverride = computed(() => (props.step >= 3 ? toPlanning(manual, t) : null))
</script>

<template>
  <!-- TODO(João): review wording (labels, caption, clip label) -->
  <div class="wo" :class="{ compared, overridden, recomputed: step >= 3 }">
    <p class="wo-label">
      <span class="before">automatic: inverse error</span>
      <span class="after">manual: {{ boosted.short }} set to {{ fmtPct(boostWeight, 0) }}</span>
    </p>
    <div class="wo-bars">
      <WeightBars :rows="rows" :handle="boosted.id" :show-handle="overridden" :mute-others="compared" />
    </div>
    <div class="wo-box">
      <ToPlanningBox :month="MONTH" :override="boxOverride" />
    </div>
    <p class="wo-caption">
      Weights renormalized. Forecast, band and safety stock recomputed.
    </p>

    <div class="chart-frame">
      <ForecastChart series="scenario1" compact :highlight-month="MONTH" show-safety-bracket :blend="chartBlend">
        <!-- The six model forecasts, under the band. The boosted one is drawn last, on top. -->
        <template #under="{ line, forecastStart }">
          <g class="wo-models">
            <path v-for="m in models.filter(m => m !== boosted)" :key="m.id" class="other" :d="line(m.forecast, forecastStart)" />
            <path class="boosted" :d="line(boosted.forecast, forecastStart)" />
          </g>
        </template>
      </ForecastChart>
    </div>

    <PrototypeClip
      class="wo-clip" :at="4" src="/video/weights.mp4" poster="/img/weights-poster.png"
      label="Same action in the prototype"
    />
  </div>
</template>

<style scoped>
/* Left column, in slide pixels. */
.wo-label,
.wo-bars,
.wo-box,
.wo-caption {
  position: absolute;
  left: var(--slide-pad-x);
  width: 305px;
  margin: 0;
  font-size: 16px;
  line-height: 1.35;
}
.wo-label {
  top: 122px;
  color: var(--c-muted);
}
/* Two texts share one place. */
.wo-label span {
  transition: opacity 0.4s ease;
}
.wo-label .after {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--c-text);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
}
.overridden .wo-label .before {
  opacity: 0;
}
.overridden .wo-label .after {
  opacity: 1;
}
.wo-bars {
  top: 150px;
}
.wo-box {
  top: 316px;
}
.wo-caption {
  top: 436px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.recomputed .wo-caption {
  opacity: 1;
}
/* Model lines. The chart is drawn 1.45× larger than its own units, so these
   widths come out as about 2 px and 1.5 px on the slide. */
.wo-models {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.compared .wo-models {
  opacity: 1;
}
.wo-models path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.wo-models .other {
  stroke: var(--chart-axis);
  stroke-width: 1.05;
  opacity: 0.35;
}
.wo-models .boosted {
  stroke: var(--chart-model);
  stroke-width: 1.4;
  opacity: 0.85;
}
/* Over the chart: same frame, a little larger so it covers the chart fully. */
.wo-clip {
  position: absolute;
  left: calc(var(--frame-left) - 8px);
  top: calc(var(--frame-top) - 22px);
  width: calc(var(--frame-width) + 8px);
}

@media print, (prefers-reduced-motion: reduce) {
  .wo * {
    transition: none !important;
  }
}
</style>
