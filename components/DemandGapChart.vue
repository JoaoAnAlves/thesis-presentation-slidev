<!--
"What a static plan misses": a flat MRP-plan line against real monthly demand.

  stage 0   flat grey "MRP plan" line only
  stage 1   orange actual-demand line draws in
  stage 2   the gaps are shaded and labelled: plan above demand = waste /
            overstock, demand above plan = stock-out

Usage:  <DemandGapChart :stage="$clicks" />

Reads data/sku.json: months[], actual[] (one value per month), mrpPlan (number).
-->
<script setup lang="ts">
import { computed, useId } from 'vue'
import data from '../data/sku.json'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

// ----- Geometry: same 600 x 360 drawing as ForecastChart, so both fit `.stage-chart` -----
const W = 600
const H = 360
const M = { left: 44, right: 14, top: 34, bottom: 30 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom

// Vertical range: the data with some headroom, rounded to the nearest 50.
const values = [...data.actual, data.mrpPlan]
const Y_MIN = Math.floor((Math.min(...values) - 40) / 50) * 50
const Y_MAX = Math.ceil((Math.max(...values) + 40) / 50) * 50
const ticks: number[] = []
for (let v = Y_MIN + 50; v < Y_MAX; v += 50) ticks.push(v)

const step = PW / (data.months.length - 1)
const x = (i: number) => M.left + i * step
const y = (v: number) => M.top + PH * (1 - (v - Y_MIN) / (Y_MAX - Y_MIN))
const planY = y(data.mrpPlan)

const actualPath = `M${data.actual.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L')}`

// The area between the two lines: along the demand line, then back along the plan.
// It is drawn twice, each time clipped to one side of the plan line, so no
// crossing points have to be calculated.
const gapPath = `${actualPath} L${x(data.months.length - 1).toFixed(1)},${planY.toFixed(1)} L${x(0).toFixed(1)},${planY.toFixed(1)} Z`

// Each label sits at the month with the largest gap on its side, halfway between the lines.
function labelAt(sign: 1 | -1) {
  let best = 0
  data.actual.forEach((v, i) => {
    if ((v - data.mrpPlan) * sign >= (data.actual[best] - data.mrpPlan) * sign) // on a tie, the later month
      best = i
  })
  // Keep the text inside the plot at the left and right edges.
  const lx = Math.min(Math.max(x(best), M.left + 60), M.left + PW - 60)
  return { x: lx, y: (y(data.actual[best]) + planY) / 2 + 4 }
}
const stockOut = labelAt(1) // demand above plan
const overstock = labelAt(-1) // plan above demand

const uid = useId()
const clipAbove = `gap-above-${uid}`
const clipBelow = `gap-below-${uid}`
const showDemand = computed(() => props.stage >= 1)
const showGaps = computed(() => props.stage >= 2)
</script>

<template>
  <!-- TODO(João): review wording (legend, gap labels, mock badge) -->
  <svg class="demand-gap-chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="MRP plan against actual demand">
    <defs>
      <clipPath :id="clipAbove">
        <rect :x="M.left" :y="M.top" :width="PW" :height="planY - M.top" />
      </clipPath>
      <clipPath :id="clipBelow">
        <rect :x="M.left" :y="planY" :width="PW" :height="M.top + PH - planY" />
      </clipPath>
    </defs>

    <!-- Grid and axes -->
    <g class="axis">
      <g v-for="t in ticks" :key="t">
        <line :x1="M.left" :x2="M.left + PW" :y1="y(t)" :y2="y(t)" class="grid-line" />
        <text :x="M.left - 8" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
      </g>
      <text v-for="(m, i) in data.months" :key="m" :x="x(i)" :y="H - 10" text-anchor="middle">{{ m }}</text>
    </g>

    <!-- Stage 2: shaded gaps -->
    <g class="gaps" :class="{ on: showGaps }">
      <path :d="gapPath" class="gap-stockout" :clip-path="`url(#${clipAbove})`" />
      <path :d="gapPath" class="gap-overstock" :clip-path="`url(#${clipBelow})`" />
    </g>

    <!-- Stage 0: flat plan -->
    <line :x1="M.left" :x2="M.left + PW" :y1="planY" :y2="planY" class="plan" />

    <!-- Stage 1: demand line, drawn in from the left -->
    <path :d="actualPath" pathLength="1" class="demand" :class="{ on: showDemand }" />

    <!-- Stage 2: gap labels (on top of the lines) -->
    <g class="gaps" :class="{ on: showGaps }">
      <text :x="stockOut.x" :y="stockOut.y" text-anchor="middle" class="label-stockout">stock-out</text>
      <text :x="overstock.x" :y="overstock.y" text-anchor="middle" class="label-overstock">waste / overstock</text>
    </g>

    <!-- Legend -->
    <g class="legend" :transform="`translate(${M.left}, 14)`">
      <line x1="0" x2="18" y1="0" y2="0" class="plan" />
      <text x="24" y="4">MRP plan</text>
      <g class="legend-demand" :class="{ on: showDemand }">
        <line x1="100" x2="118" y1="0" y2="0" class="demand-key" />
        <text x="124" y="4">Actual demand</text>
      </g>
    </g>

    <text v-if="data._mock" :x="W - M.right" y="18" text-anchor="end" class="mock">MOCK DATA</text>
  </svg>
</template>

<style scoped>
.demand-gap-chart {
  display: block;
  width: 100%;
  height: auto;
}

.axis text,
.legend text {
  fill: var(--chart-axis);
  font-family: var(--font-mono);
  font-size: 11px;
}
.grid-line {
  stroke: var(--chart-grid);
  stroke-width: 1;
}

.plan {
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 3;
}

/* Line-draw: pathLength="1" makes the browser treat the path as 1 unit long.
   One dash of length 1 covers it all; an offset of 1 pushes that dash fully
   off the path (nothing visible), and moving the offset to 0 slides it on. */
.demand {
  fill: none;
  stroke: var(--chart-actual);
  stroke-width: 3;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 1.4s ease-in-out;
}
.demand.on {
  stroke-dashoffset: 0;
}
.demand-key {
  stroke: var(--chart-actual);
  stroke-width: 3;
}
.legend-demand {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.legend-demand.on {
  opacity: 1;
}

.gaps {
  opacity: 0;
  transition: opacity 0.6s ease;
}
.gaps.on {
  opacity: 1;
}
.gap-stockout {
  fill: color-mix(in srgb, var(--c-danger) 20%, transparent);
}
.gap-overstock {
  fill: color-mix(in srgb, var(--c-warn) 22%, transparent);
}
.label-stockout,
.label-overstock {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  /* Background-coloured outline keeps the text readable over the lines. */
  paint-order: stroke;
  stroke: var(--c-bg);
  stroke-width: 4px;
}
.label-stockout {
  fill: var(--c-danger);
}
.label-overstock {
  fill: var(--c-warn);
}

.mock {
  fill: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}

@media print {
  .demand,
  .gaps,
  .legend-demand {
    transition: none;
  }
}
</style>
