<!--
Forecast chart for the thread SKU: actual demand, combined forecast, 90% band,
plus two optional layers switched on by props (deviation highlight, scenario line).

Usage in a slide (layers driven by the click counter):

  <ForecastChart series="baseline2025" :highlight="$clicks >= 1" />
  <ForecastChart series="baseline2025" :scenario="$clicks >= 2" />

The chart has a fixed viewBox, so wherever it is placed it keeps the same
proportions. Put it inside `.stage-chart` (styles/index.css) to keep the same
position on consecutive slides.
-->
<script setup lang="ts">
import { computed, useId } from 'vue'
import data from '../data/sku-mock.json'

const props = withDefaults(defineProps<{
  /** Key of the dataset inside data.series */
  series?: keyof typeof data.series
  /** Show the amber deviation region (needs `deviation` in the dataset) */
  highlight?: boolean
  /** Draw the dotted scenario line (needs `scenario` in the dataset) */
  scenario?: boolean
}>(), {
  series: 'baseline2025',
  highlight: false,
  scenario: false,
})

type Series = {
  label: string
  months: string[]
  actual: (number | null)[]
  forecast: number[]
  lower: number[]
  upper: number[]
  scenario?: number[]
  deviation?: { from: number, to: number, label: string }
}
const s = computed(() => data.series[props.series] as Series)

// ----- Geometry: a 600 x 360 drawing with margins for the axes -----
const W = 600
const H = 360
const M = { left: 44, right: 14, top: 34, bottom: 30 }
const PW = W - M.left - M.right
const PH = H - M.top - M.bottom
const [Y_MIN, Y_MAX] = data.yDomain

const step = computed(() => PW / (s.value.months.length - 1))
const x = (i: number) => M.left + i * step.value
const y = (v: number) => M.top + PH * (1 - (v - Y_MIN) / (Y_MAX - Y_MIN))

// Turns an array of values into an SVG path; a null value breaks the line.
function line(values: (number | null)[]) {
  let d = ''
  let pen = 'M'
  values.forEach((v, i) => {
    if (v == null) {
      pen = 'M'
      return
    }
    d += `${pen}${x(i).toFixed(1)},${y(v).toFixed(1)} `
    pen = 'L'
  })
  return d.trim()
}

// Band = upper bound left-to-right, then lower bound right-to-left, closed.
const bandPath = computed(() => {
  const up = s.value.upper.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
  const low = s.value.lower.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).reverse()
  return `M${up.join(' L')} L${low.join(' L')} Z`
})

// Amber region: half a month of padding either side, clamped to the plot area.
const deviationBox = computed(() => {
  const dev = s.value.deviation
  if (!dev)
    return null
  const x0 = Math.max(M.left, x(dev.from) - step.value / 2)
  const x1 = Math.min(M.left + PW, x(dev.to) + step.value / 2)
  return { x: x0, width: x1 - x0, label: dev.label }
})

// Each chart instance needs its own clip-path id.
const clipId = `scenario-clip-${useId()}`
</script>

<template>
  <!-- TODO(João): review wording (legend, axis and badge labels below) -->
  <svg class="forecast-chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Demand forecast chart">
    <defs>
      <!-- The scenario line is revealed by widening this rectangle from 0 to the plot width. -->
      <clipPath :id="clipId">
        <rect
          class="scenario-clip"
          :x="M.left - 4"
          :y="0"
          :height="H"
          :style="{ width: scenario ? `${PW + 8}px` : '0px' }"
        />
      </clipPath>
    </defs>

    <!-- Grid and axes -->
    <g class="axis">
      <g v-for="t in data.yTicks" :key="t">
        <line :x1="M.left" :x2="M.left + PW" :y1="y(t)" :y2="y(t)" class="grid" />
        <text :x="M.left - 8" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
      </g>
      <text
        v-for="(m, i) in s.months"
        :key="m"
        :x="x(i)"
        :y="H - 10"
        text-anchor="middle"
      >{{ m }}</text>
    </g>

    <!-- Layer 1: 90% prediction interval -->
    <path :d="bandPath" class="band" />

    <!-- Layer 2: deviation highlight (amber = what changed on this click) -->
    <g v-if="deviationBox" class="deviation" :class="{ on: highlight }">
      <rect :x="deviationBox.x" :y="M.top" :width="deviationBox.width" :height="PH" />
      <text :x="deviationBox.x + deviationBox.width / 2" :y="M.top + PH - 10" text-anchor="middle">
        {{ deviationBox.label }}
      </text>
    </g>

    <!-- Layer 3: combined forecast and actual demand -->
    <path :d="line(s.forecast)" class="forecast" />
    <path :d="line(s.actual)" class="actual" />

    <!-- Layer 4: scenario impact, dotted, drawn in from the left -->
    <path
      v-if="s.scenario"
      :d="line(s.scenario)"
      class="scenario-line"
      :clip-path="`url(#${clipId})`"
    />

    <!-- Legend -->
    <g class="legend" :transform="`translate(${M.left}, 14)`">
      <line x1="0" x2="18" y1="0" y2="0" class="actual" />
      <text x="24" y="4">Actual demand</text>
      <line x1="128" x2="146" y1="0" y2="0" class="forecast" />
      <text x="152" y="4">Combined forecast</text>
      <rect x="280" y="-6" width="18" height="12" class="band" />
      <text x="304" y="4">90% PI</text>
      <g class="legend-scenario" :class="{ on: scenario }">
        <line x1="356" x2="374" y1="0" y2="0" class="scenario-line" />
        <text x="380" y="4">Scenario</text>
      </g>
    </g>

    <!-- Shown for as long as the chart reads the mock file. -->
    <text v-if="data._mock" :x="W - M.right" y="18" text-anchor="end" class="mock">MOCK DATA</text>
  </svg>
</template>

<style scoped>
.forecast-chart {
  display: block;
  width: 100%;
  height: auto;
  /* Lets `transition: view-transition` treat the chart as one shared element. */
  view-transition-name: forecast-chart;
}

.axis text,
.legend text {
  fill: var(--chart-axis);
  font-family: var(--font-mono);
  font-size: 11px;
}
.grid {
  stroke: var(--chart-grid);
  stroke-width: 1;
}

.band {
  fill: var(--chart-band);
  stroke: none;
}
.forecast {
  fill: none;
  stroke: var(--chart-forecast);
  stroke-width: 2.5;
  stroke-linejoin: round;
}
.actual {
  fill: none;
  stroke: var(--chart-actual);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.scenario-line {
  fill: none;
  stroke: var(--chart-scenario);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-dasharray: 0.1 7;
}
.scenario-clip {
  transition: width 1.2s ease-in-out;
}
.legend-scenario {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.legend-scenario.on {
  opacity: 1;
}

.deviation {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.deviation.on {
  opacity: 1;
}
.deviation rect {
  fill: color-mix(in srgb, var(--c-warn) 12%, transparent);
  stroke: var(--c-warn);
  stroke-width: 1;
  stroke-dasharray: 4 4;
}
.deviation text {
  fill: var(--c-warn);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
}

.mock {
  fill: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}
</style>
