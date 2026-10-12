<!--
Forecast chart for the thread SKU: actual demand, combined forecast, 90% band,
plus optional layers switched on by props.

Two sizes:

  full (default)  600 × 360, with y ticks and a legend. Slides 16–18.
                  Put it inside `.stage-chart` (styles/index.css).
  compact         372 × 232, drawn at its real size (16 px labels, no y ticks).
                  Slides 12–13, which share one position so the blue line does
                  not move between them.

Usage (layers driven by the click counter):

  <ForecastChart series="baseline2025" :highlight="$clicks >= 1" />
  <ForecastChart series="baseline2025" :scenario="$clicks >= 2" />

  <ForecastChart
    series="scenario1" compact
    :show-band="$clicks >= 1"
    :highlight-month="$clicks >= 2 ? '2025-07' : null"
    :show-safety-bracket="$clicks >= 3"
  />

Props added for slides 12–13:
  compact             the small size described above
  showBand            band visible; when it turns on, it grows out of the line
  showForecast        blue line (and its legend entry) visible
  highlightMonth      'YYYY-MM' of a forecast month: soft column + dot
  showSafetyBracket   teal bracket from the line to the upper bound at that month
  actualsAfterTrain   series "scenario1" only: also draw actuals after trainEnd

Slot: anything put inside <ForecastChart>…</ForecastChart> is drawn in the plot,
under the blue line. It receives `line(values, startIndex)`, `x`, `y` and
`forecastStart` (index of the first forecast month). Slide 12 uses it for the
six model lines.

DATA: series "baseline2025" / "live2026" read data/sku-mock.json; series
"scenario1" reads data/sku.json → scenario1. Both are MOCK for now. Band
values (rangeUp / rangeDown) are read from the file, never computed here.
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import sku from '../data/sku.json'
import data from '../data/sku-mock.json'

const props = withDefaults(defineProps<{
  /** Which dataset to draw */
  series?: keyof typeof data.series | 'scenario1'
  /** Show the amber deviation region (needs `deviation` in the dataset) */
  highlight?: boolean
  /** Draw the dotted scenario line (needs `scenario` in the dataset) */
  scenario?: boolean
  compact?: boolean
  showBand?: boolean
  showForecast?: boolean
  highlightMonth?: string | null
  showSafetyBracket?: boolean
  actualsAfterTrain?: boolean
}>(), {
  series: 'baseline2025',
  highlight: false,
  scenario: false,
  compact: false,
  showBand: true,
  showForecast: true,
  highlightMonth: null,
  showSafetyBracket: false,
  actualsAfterTrain: false,
})
const { isPrintMode } = useNav()

const BAND_GROW_MS = 600 // how long the band takes to grow out of the line
const SAFETY_LABEL_W = 212 // width of the pill behind the safety-stock label (compact units)

type Series = {
  label: string
  months: string[]
  actual: (number | null)[]
  forecast: (number | null)[]
  lower: (number | null)[]
  upper: (number | null)[]
  scenario?: number[]
  deviation?: { from: number, to: number, label: string }
}

// ----- Series "scenario1": history up to trainEnd, then forecast and band -----
const s1 = sku.scenario1
const forecastStart = s1.actual.filter(a => a.month <= s1.trainEnd).length
function scenario1(): Series {
  const months = s1.actual.map(a => a.month)
  const gap = Array.from({ length: forecastStart }, () => null)
  return {
    label: 'Scenario 1',
    months,
    actual: s1.actual.map((a, i) => (i < forecastStart || props.actualsAfterTrain ? a.qty : null)),
    forecast: [...gap, ...s1.blended.map(b => b.qty)],
    lower: [...gap, ...s1.blended.map(b => b.rangeDown)],
    upper: [...gap, ...s1.blended.map(b => b.rangeUp)],
  }
}
// One fixed scale for everything slides 12–13 can draw (history, band, model
// lines), so the scale never changes between clicks or slides.
const s1Values = [
  ...s1.actual.slice(0, forecastStart).map(a => a.qty),
  ...s1.blended.flatMap(b => [b.rangeUp, b.rangeDown]),
  ...s1.models.flatMap(m => m.forecast),
]
const s1Domain = [Math.max(0, Math.min(...s1Values) - 15), Math.max(...s1Values) + 15]

const isScenario1 = computed(() => props.series === 'scenario1')
const s = computed<Series>(() => (isScenario1.value ? scenario1() : data.series[props.series as keyof typeof data.series] as Series))
const isMock = computed(() => (isScenario1.value ? s1._mock : data._mock))

// ----- Geometry: margins around the plot, for each size -----
const G = computed(() => (props.compact
  ? { W: 372, H: 232, left: 4, right: 4, top: 34, bottom: 34 }
  : { W: 600, H: 360, left: 44, right: 14, top: 34, bottom: 30 }))
const PW = computed(() => G.value.W - G.value.left - G.value.right)
const PH = computed(() => G.value.H - G.value.top - G.value.bottom)
const domain = computed(() => (isScenario1.value ? s1Domain : data.yDomain))

const step = computed(() => PW.value / (s.value.months.length - 1))
const x = (i: number) => G.value.left + i * step.value
// Values below the axis are drawn on the axis, never under it.
function y(v: number) {
  const [lo, hi] = domain.value
  return G.value.top + PH.value * (1 - Math.max(0, (v - lo) / (hi - lo)))
}

// Turns an array of values into an SVG path; a null value breaks the line.
// `start` shifts the whole array to the right (used for forecast-only arrays).
function line(values: (number | null)[], start = 0) {
  let d = ''
  let pen = 'M'
  values.forEach((v, i) => {
    if (v == null) {
      pen = 'M'
      return
    }
    d += `${pen}${x(start + i).toFixed(1)},${y(v).toFixed(1)} `
    pen = 'L'
  })
  return d.trim()
}

// ----- Band: grows from the line (grow = 0) to its full width (grow = 1) -----
const grow = ref(props.showBand ? 1 : 0)
let frame = 0
watch(() => props.showBand, (on) => {
  cancelAnimationFrame(frame)
  if (!on || isPrintMode.value) {
    grow.value = on ? 1 : 0
    return
  }
  const t0 = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - t0) / BAND_GROW_MS, 1)
    grow.value = 1 - (1 - t) ** 3 // ease-out
    if (t < 1)
      frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
})
onBeforeUnmount(() => cancelAnimationFrame(frame))

// Band = upper bound left-to-right, then lower bound right-to-left, closed.
const bandPath = computed(() => {
  const { forecast, upper, lower } = s.value
  const edge = (bound: (number | null)[]) => bound
    .map((v, i) => {
      const mid = forecast[i]
      return v == null || mid == null ? null : `${x(i).toFixed(1)},${y(mid + (v - mid) * grow.value).toFixed(1)}`
    })
    .filter(p => p != null)
  return `M${edge(upper).join(' L')} L${edge(lower).reverse().join(' L')} Z`
})

// ----- Highlighted month and safety-stock bracket -----
// The month is remembered after the prop goes back to null, so the marks can fade out in place.
const lastMonth = ref(props.highlightMonth)
watch(() => props.highlightMonth, (m) => {
  if (m)
    lastMonth.value = m
})
const mark = computed(() => {
  const i = s.value.months.indexOf(lastMonth.value ?? '')
  const mid = s.value.forecast[i]
  const up = s.value.upper[i]
  if (i < 0 || mid == null || up == null)
    return null
  return { x: x(i), yMid: y(mid), yUp: y(up), colX: x(i) - step.value / 2, colW: step.value }
})

// Amber region: half a month of padding either side, clamped to the plot area.
const deviationBox = computed(() => {
  const dev = s.value.deviation
  if (!dev)
    return null
  const x0 = Math.max(G.value.left, x(dev.from) - step.value / 2)
  const x1 = Math.min(G.value.left + PW.value, x(dev.to) + step.value / 2)
  return { x: x0, width: x1 - x0, label: dev.label }
})

// Compact size: a label only every January and July, written "Jul 24".
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const compactTicks = computed(() => s.value.months
  .map((m, i) => ({ i, m }))
  .filter(t => /-(01|07)$/.test(t.m))
  .map(t => ({ i: t.i, label: `${MONTH_NAMES[+t.m.slice(5) - 1]} ${t.m.slice(2, 4)}` })))

// Each chart instance needs its own clip-path id.
const clipId = `scenario-clip-${useId()}`
</script>

<template>
  <!-- TODO(João): review wording (legend, axis, badge and bracket labels below) -->
  <svg
    class="forecast-chart" :class="{ compact }" :viewBox="`0 0 ${G.W} ${G.H}`"
    role="img" aria-label="Demand forecast chart"
  >
    <defs>
      <!-- The scenario line is revealed by widening this rectangle from 0 to the plot width. -->
      <clipPath :id="clipId">
        <rect
          class="scenario-clip"
          :x="G.left - 4"
          :y="0"
          :height="G.H"
          :style="{ width: scenario ? `${PW + 8}px` : '0px' }"
        />
      </clipPath>
    </defs>

    <!-- Grid and axes -->
    <g v-if="!compact" class="axis">
      <g v-for="t in data.yTicks" :key="t">
        <line :x1="G.left" :x2="G.left + PW" :y1="y(t)" :y2="y(t)" class="grid-line" />
        <text :x="G.left - 8" :y="y(t) + 4" text-anchor="end">{{ t }}</text>
      </g>
      <text
        v-for="(m, i) in s.months"
        :key="m"
        :x="x(i)"
        :y="G.H - 10"
        text-anchor="middle"
      >{{ m }}</text>
    </g>
    <g v-else class="axis">
      <line :x1="G.left" :x2="G.left + PW" :y1="G.top + PH + 6" :y2="G.top + PH + 6" class="axis-line" />
      <text v-for="t in compactTicks" :key="t.i" :x="x(t.i)" :y="G.H - 8" text-anchor="middle">{{ t.label }}</text>
    </g>

    <!-- Highlighted month: soft column behind everything -->
    <rect
      v-if="mark" class="month-column" :class="{ on: !!highlightMonth }"
      :x="mark.colX" :y="G.top" :width="mark.colW" :height="PH + 6"
    />

    <!-- Layer 1: 90% prediction interval -->
    <path :d="bandPath" class="band" :class="{ off: !showBand }" />

    <!-- Layer 2: deviation highlight (amber = what changed on this click) -->
    <g v-if="deviationBox" class="deviation" :class="{ on: highlight }">
      <rect :x="deviationBox.x" :y="G.top" :width="deviationBox.width" :height="PH" />
      <text :x="deviationBox.x + deviationBox.width / 2" :y="G.top + PH - 10" text-anchor="middle">
        {{ deviationBox.label }}
      </text>
    </g>

    <!-- Extra lines from the slide (slide 12: the six model lines) -->
    <slot :line="line" :x="x" :y="y" :forecast-start="forecastStart" />

    <!-- Layer 3: combined forecast and actual demand -->
    <path :d="line(s.forecast)" class="forecast fades" :class="{ off: !showForecast }" />
    <path :d="line(s.actual)" class="actual" />

    <!-- Layer 4: scenario impact, dotted, drawn in from the left -->
    <path
      v-if="s.scenario"
      :d="line(s.scenario)"
      class="scenario-line"
      :clip-path="`url(#${clipId})`"
    />

    <!-- Highlighted month: dot on the line, then the safety-stock bracket -->
    <g v-if="mark">
      <circle class="month-dot" :class="{ on: !!highlightMonth }" :cx="mark.x" :cy="mark.yMid" r="5" />
      <g class="safety" :class="{ on: showSafetyBracket }">
        <path :d="`M${mark.x - 5} ${mark.yUp}h10M${mark.x} ${mark.yUp}V${mark.yMid}M${mark.x - 5} ${mark.yMid}h10`" />
        <!-- Pill in the slide background, so the label stays readable over the band. -->
        <rect class="safety-pill" :x="mark.x - 12 - SAFETY_LABEL_W" :y="(mark.yUp + mark.yMid) / 2 - 12" :width="SAFETY_LABEL_W + 4" height="24" rx="12" />
        <text :x="mark.x - 20" :y="(mark.yUp + mark.yMid) / 2 + 5" text-anchor="end">
          safety stock = 1.65·RMSE<tspan class="sub" dy="4">t</tspan>
        </text>
      </g>
    </g>

    <!-- Legend -->
    <g v-if="!compact" class="legend" :transform="`translate(${G.left}, 14)`">
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
    <g v-else class="legend">
      <text :x="G.left" y="16" class="legend-actual">actual</text>
      <text :x="G.left + 62" y="16" class="legend-forecast fades" :class="{ off: !showForecast }">blended forecast</text>
      <g class="legend-band" :class="{ off: !showBand }">
        <rect :x="G.left + 204" y="4" width="14" height="14" rx="2" class="band" />
        <text :x="G.left + 223" y="16">90% band</text>
      </g>
    </g>

    <!-- Shown for as long as the chart reads a mock file. -->
    <text v-if="isMock" :x="G.W - G.right" :y="compact ? 16 : 18" text-anchor="end" class="mock">{{ compact ? 'MOCK' : 'MOCK DATA' }}</text>
  </svg>
</template>

<style scoped>
.forecast-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
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
.axis-line {
  stroke: var(--chart-axis);
  stroke-width: 1.5;
}

.band {
  fill: var(--chart-band);
  stroke: none;
  transition: opacity 0.2s ease;
}
.band.off {
  opacity: 0;
}
.forecast {
  fill: none;
  stroke: var(--chart-forecast);
  stroke-width: 3;
  stroke-linejoin: round;
}
.actual {
  fill: none;
  stroke: var(--chart-actual);
  stroke-width: 3;
  stroke-linejoin: round;
}
/* Blue line and its legend entry. A parent can delay the fade-in by setting
   --forecast-delay on the chart (slide 12 does, to wait for its merge). */
.fades {
  transition: opacity 0.4s ease var(--forecast-delay, 0s);
}
.fades.off {
  opacity: 0;
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

/* ---------- Highlighted month and safety stock ---------- */
.month-column,
.month-dot,
.safety {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.month-column.on,
.month-dot.on,
.safety.on {
  opacity: 1;
}
.month-column {
  fill: color-mix(in srgb, var(--chart-forecast) 12%, transparent);
}
.month-dot {
  fill: var(--chart-forecast);
  stroke: var(--c-bg);
  stroke-width: 2;
}
.safety path {
  fill: none;
  stroke: var(--c-plan);
  stroke-width: 3;
  stroke-linecap: round;
}
.safety text {
  fill: var(--c-plan);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
}
.safety-pill {
  fill: var(--c-bg);
  opacity: 0.9;
}
.safety text .sub {
  font-size: 12px;
}

.mock {
  fill: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}

/* ---------- Compact size: drawn 1:1, so 16 px here is 16 px on the slide ---------- */
.compact .axis text,
.compact .legend text {
  font-family: var(--font-body);
  font-size: 16px;
}
.compact .legend-actual {
  fill: var(--chart-actual);
}
.compact .legend-forecast {
  fill: var(--chart-forecast);
  font-weight: 600;
}
.legend-band {
  transition: opacity 0.4s ease;
}
.legend-band.off {
  opacity: 0;
}
.compact .mock {
  font-size: 16px;
  letter-spacing: 0.08em;
}

@media print, (prefers-reduced-motion: reduce) {
  .forecast-chart * {
    transition: none !important;
  }
}
</style>
