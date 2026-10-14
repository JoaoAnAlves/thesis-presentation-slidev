<!--
Slide 3: how much one real product's demand moves within a single year.

  stage 0   empty axes
  stage 1   the 2024 sales line draws in (orange)
  stage 2   a bracket from the lowest to the highest month, labelled with the
            ratio ("×2.2 within one year"); the two months get their values

Usage:  <DemandGapChart :stage="$clicks" />

DATA: data/sku.json top level (real, item 101703): months[] and actual[] =
monthly sales in 2024, unit from `unit`. The ratio, the two months and their
values are all computed here from those twelve numbers.
-->
<script setup lang="ts">
import { computed } from 'vue'
import { baseUnit, fmtCompact, fmtQty } from '../composables/useFormat'
import data from '../data/sku.json'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

// ----- Geometry: drawn 1:1 inside `.stage-chart` (590 px), so 16 px text is 16 px -----
const W = 590
const H = 360
const M = { left: 48, right: 34, top: 34, bottom: 34 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom
const px = (n: number) => n.toFixed(1)

// Vertical scale from 0 to a round number above the highest month.
const values = data.actual
const maxV = Math.max(...values)
const minV = Math.min(...values)
const pow = 10 ** Math.floor(Math.log10(maxV / 4))
const tickStep = [1, 2, 2.5, 5, 10].map(k => k * pow).find(v => v >= maxV / 4) ?? maxV / 4
const Y_MAX = Math.ceil((maxV * 1.08) / tickStep) * tickStep
const ticks = Array.from({ length: Math.round(Y_MAX / tickStep) + 1 }, (_, i) => i * tickStep)

const step = PW / (data.months.length - 1)
const x = (i: number) => M.left + i * step
const y = (v: number) => M.top + PH * (1 - v / Y_MAX)

const actualPath = `M${values.map((v, i) => `${px(x(i))},${px(y(v))}`).join(' L')}`

// ----- The swing within the year -----
const unit = baseUnit(data.unit) // 'kg / month' → 'kg'
const iMin = values.indexOf(minV)
const iMax = values.indexOf(maxV)
const ratio = `×${(maxV / minV).toFixed(1)}` // 8,867 / 3,988 → ×2.2
const BRACKET_X = M.left + PW + 16 // just right of the last month
const low = { x: x(iMin), y: y(minV), text: `${fmtQty(minV, unit)} ${data.months[iMin]}` }
const high = { x: x(iMax), y: y(maxV), text: `${fmtQty(maxV, unit)} ${data.months[iMax]}` }

const showDemand = computed(() => props.stage >= 1)
const showSwing = computed(() => props.stage >= 2)
</script>

<template>
  <!-- TODO(João): review wording (legend, ratio label) -->
  <svg class="demand-gap-chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Monthly sales of one product in 2024">
    <!-- Grid and axes -->
    <g class="axis">
      <g v-for="t in ticks" :key="t">
        <line :x1="M.left" :x2="M.left + PW" :y1="y(t)" :y2="y(t)" class="grid-line" />
        <text :x="M.left - 8" :y="y(t) + 5" text-anchor="end">{{ fmtCompact(t) }}</text>
      </g>
      <text v-for="(m, i) in data.months" :key="m" :x="x(i)" :y="H - 8" text-anchor="middle">{{ m }}</text>
      <text :x="M.left - 8" y="16" text-anchor="end">{{ unit }}</text>
    </g>

    <!-- Stage 1: demand line, drawn in from the left -->
    <path :d="actualPath" pathLength="1" class="demand" :class="{ on: showDemand }" />

    <!-- Stage 2: lowest and highest month, joined by a bracket at the right -->
    <g class="swing" :class="{ on: showSwing }">
      <line :x1="low.x" :x2="BRACKET_X" :y1="low.y" :y2="low.y" class="guide" />
      <line :x1="high.x" :x2="BRACKET_X" :y1="high.y" :y2="high.y" class="guide" />
      <path :d="`M${BRACKET_X - 6} ${px(high.y)}h6V${px(low.y)}h-6`" class="bracket" />
      <circle :cx="low.x" :cy="low.y" r="5" class="point" />
      <circle :cx="high.x" :cy="high.y" r="5" class="point" />
      <text :x="low.x" :y="low.y + 26" text-anchor="middle" class="value">{{ low.text }}</text>
      <text :x="high.x" :y="high.y - 14" text-anchor="middle" class="value">{{ high.text }}</text>
      <text :x="BRACKET_X - 12" :y="low.y + 28" text-anchor="end" class="ratio">
        {{ ratio }} within one year
      </text>
    </g>

    <!-- Legend -->
    <g class="legend">
      <text :x="M.left" y="16" class="legend-demand" :class="{ on: showDemand }">actual demand, 2024</text>
    </g>
  </svg>
</template>

<style scoped>
.demand-gap-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.axis text,
.legend text {
  fill: var(--chart-axis);
  font-family: var(--font-body);
  font-size: 16px; /* drawn 1:1: deck minimum */
}
.grid-line {
  stroke: var(--chart-grid);
  stroke-width: 1;
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
.legend .legend-demand {
  fill: var(--chart-actual);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.legend .legend-demand.on {
  opacity: 1;
}

.swing {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.swing.on {
  opacity: 1;
}
.guide {
  stroke: var(--c-muted);
  stroke-width: 1;
  stroke-dasharray: 3 4;
}
.bracket {
  fill: none;
  stroke: var(--c-warn);
  stroke-width: 2;
}
.point {
  fill: var(--chart-actual);
  stroke: var(--c-bg);
  stroke-width: 2;
}
.swing text {
  font-family: var(--font-body);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  /* Background-coloured outline keeps the text readable over the grid. */
  paint-order: stroke;
  stroke: var(--c-bg);
  stroke-width: 4px;
}
.value {
  fill: var(--c-text);
  font-weight: 600;
}
.ratio {
  fill: var(--c-warn);
  font-weight: 700;
}

@media print {
  .demand,
  .swing,
  .legend-demand {
    transition: none;
  }
}
</style>
