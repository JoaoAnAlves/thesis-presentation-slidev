<!--
Forecast chart for the thread SKU: actual demand, combined forecast, 90% band,
plus optional layers switched on by props.

Two sizes:

  full (default)  590 × 360, drawn at its real size inside `.stage-chart`
                  (16 px labels), with y ticks and a legend. Slides 16–18.
                  Put it inside `.stage-chart` (styles/index.css).
  compact         372 × 232, drawn at its real size (16 px labels, no y ticks).
                  Slides 12–13, which share one position so the blue line does
                  not move between them.

Usage (layers driven by the click counter):

  <ForecastChart series="scenario1" from="2025-02" :highlight="$clicks >= 1" :mark-below="0.8" />
  <ForecastChart series="scenario1" from="2025-02" :scenario="$clicks >= 2" />

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
  blend               series "scenario1" only: { qty, rangeUp, rangeDown } (one
                      value per forecast month, e.g. from useBlend). The line
                      and band glide to these values in BLEND_TWEEN_MS, and the
                      file's own line stays behind as a grey dashed ghost.
                      Pass null to glide back to the values in the file.

Slots: anything put inside <ForecastChart>…</ForecastChart> is drawn in the
plot. Both slots receive `line(values, startIndex)`, `x`, `y` and
`forecastStart` (index of the first forecast month).
  default       above the band, under the blue line (slide 12: six model lines)
  #under        under the band as well (slide 14: six model lines)

Props added for slides 16–17 (series "scenario1" only):
  from, to            'YYYY-MM': draw only this window of months
  showActual          false = no actual-demand line at all (slide 17: a what-if
                      is never compared with sales)
  scenario            dotted line from data/sku.json → scenario2.line
  regions             [{ from, to, label? }] periods, shown when `highlight` is
                      on: a thin bracket under the x axis and one label inside
                      the plot, nothing filled. Without `label`, the label is
                      the range of the scenario multipliers in those months
                      ("×0.68 – ×0.78"); amber if the period is above ×1.
  (all series)        a sales month marked `"partial": true` in the data file is
                      never joined to the orange line: it is drawn as a hollow
                      point labelled "partial month"
  draw                the blue line is drawn from left to right in DRAW_MS when
                      `showForecast` turns on (instead of fading in); the band
                      then fades in after it (slide 18)
  markBelow           e.g. 0.8: an orange dot on every month whose actual sales
                      are under 0.8 × forecast, shown when `highlight` is on

DATA (data/sku.json, real, item 101703):
  series "scenario1"   scenario1 (history, forecast, band); dotted line = scenario2
  series "scenario3"   scenario3.blended (forecast, band) for 2026-01 … 2027-01;
                       actual sales = scenario1.actual for the same months, where
                       they exist; dotted line = scenario3.whatIf, and only when
                       `scenario` is on (backup b16, never the main slide)
Both use the same y scale, so slides 16–18 can be compared by eye. Nothing
here reads data/sku-mock.json any more. Band values (rangeUp / rangeDown)
are read from the file, never computed here.
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import sku from '../data/sku.json'
import { baseUnit, fmtCompact, fmtMult } from '../composables/useFormat'
import { useBaselineCheck } from '../composables/useScenarios'
import { useTween } from '../composables/useTween'

const props = withDefaults(defineProps<{
  /** Which dataset to draw */
  series?: 'scenario1' | 'scenario3'
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
  blend?: { qty: number[], rangeUp: number[], rangeDown: number[] } | null
  /** Draw the forecast line left to right when it turns on */
  draw?: boolean
  /** 'YYYY-MM': first and last month drawn (series "scenario1") */
  from?: string | null
  to?: string | null
  showActual?: boolean
  /** Periods marked with a bracket and a label while `highlight` is on */
  regions?: { from: string, to: string, label?: string }[]
  /** Dot where actual < markBelow × forecast, while `highlight` is on */
  markBelow?: number | null
}>(), {
  series: 'scenario1',
  highlight: false,
  scenario: false,
  compact: false,
  showBand: true,
  showForecast: true,
  highlightMonth: null,
  showSafetyBracket: false,
  actualsAfterTrain: false,
  blend: null,
  draw: false,
  from: null,
  to: null,
  showActual: true,
  regions: () => [],
  markBelow: null,
})
const { isPrintMode } = useNav()

const DRAW_MS = 800 // `draw`: how long the blue line takes to be drawn
const BAND_GROW_MS = 600 // how long the band takes to grow out of the line
const BLEND_TWEEN_MS = 800 // how long line and band take to reach a new `blend`
const SAFETY_LABEL_W = 212 // width of the pill behind the safety-stock label (compact units)

type Series = {
  label: string
  months: string[]
  actual: (number | null)[]
  /** sales of months that are not complete: drawn as hollow points, off the line */
  partial: (number | null)[]
  forecast: (number | null)[]
  lower: (number | null)[]
  upper: (number | null)[]
  scenario?: (number | null)[]
  /** multiplier per month, where the scenario has one */
  multiplier?: (number | null)[]
  deviation?: { from: number, to: number, label: string }
}

// ----- Series "scenario1": history up to trainEnd, then forecast and band -----
const s1 = sku.scenario1
const forecastStart = s1.actual.filter(a => a.month <= s1.trainEnd).length
// What is drawn: the file's values, or `blend` when given. The three arrays
// are tweened, so a change of `blend` moves line and band instead of jumping.
const fileQty = s1.blended.map(b => b.qty)
const fileUp = s1.blended.map(b => b.rangeUp)
const fileDown = s1.blended.map(b => b.rangeDown)
const shownQty = useTween(() => props.blend?.qty ?? fileQty, BLEND_TWEEN_MS)
const shownUp = useTween(() => props.blend?.rangeUp ?? fileUp, BLEND_TWEEN_MS)
const shownDown = useTween(() => props.blend?.rangeDown ?? fileDown, BLEND_TWEEN_MS)
// Window: `from`/`to` cut the months that are drawn. i0 = index of the first one.
const allMonths = s1.actual.map(a => a.month)
const i0 = computed(() => Math.max(0, props.from ? allMonths.indexOf(props.from) : 0))
const i1 = computed(() => {
  const i = props.to ? allMonths.indexOf(props.to) : -1
  return i < 0 ? allMonths.length - 1 : i
})
/** index of the first forecast month inside the window (for the slots) */
const windowForecastStart = computed(() => forecastStart - i0.value)
// Scenario 2: the what-if line and its multipliers, matched to the months by name.
const s2 = (sku as { scenario2?: { line: { month: string, qty: number, multiplier: number }[] } }).scenario2
// A month whose sales are incomplete (e.g. the database was copied mid-month).
const isPartial = (a?: { partial?: boolean }) => a?.partial === true
function scenario1(): Series {
  const gap = Array.from({ length: forecastStart }, () => null)
  // Pad to the full list of months, then cut the window out of every array.
  const cut = <T>(values: T[]) => allMonths.map((_, i) => values[i] ?? null).slice(i0.value, i1.value + 1)
  const s2At = (m: string) => s2?.line.find(l => l.month === m)
  return {
    label: 'Scenario 1',
    months: allMonths.slice(i0.value, i1.value + 1),
    actual: cut(s1.actual.map((a, i) => (!isPartial(a) && (i < forecastStart || props.actualsAfterTrain) ? a.qty : null))),
    partial: cut(s1.actual.map((a, i) => (isPartial(a) && (i < forecastStart || props.actualsAfterTrain) ? a.qty : null))),
    forecast: cut([...gap, ...shownQty.value]),
    lower: cut([...gap, ...shownDown.value]),
    upper: cut([...gap, ...shownUp.value]),
    scenario: s2 ? cut(allMonths.map(m => s2At(m)?.qty ?? null)) : undefined,
    multiplier: s2 ? cut(allMonths.map(m => s2At(m)?.multiplier ?? null)) : undefined,
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
// Full size (slides 16–17): the axis starts at 0 and has round ticks.
const s1Max = Math.max(...s1Values, ...s1.actual.map(a => a.qty), ...(s2?.line.map(l => l.qty) ?? []), ...sku.scenario3.blended.map(b => b.rangeUp))
function roundStep(raw: number) {
  const pow = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 2.5, 5, 10].map(k => k * pow).find(v => v >= raw) ?? raw
}
const s1Step = roundStep(s1Max / 4)
const s1Ticks = Array.from({ length: Math.floor(s1Max / s1Step) + 1 }, (_, i) => i * s1Step)
const unit = baseUnit(sku.unit) // 'kg / month' → 'kg'

// ----- Series "scenario3": the live 2026 run -----
const s3 = sku.scenario3
function scenario3(): Series {
  const months = s3.blended.map(b => b.month)
  // The what-if line is only built when the slide asks for it.
  const sold = (m: string, partial: boolean) => {
    const a = s1.actual.find(a => a.month === m)
    return a && isPartial(a) === partial ? a.qty : null
  }
  const whatIf = (m: string) => (props.scenario ? s3.whatIf.line.find(l => l.month === m) : undefined)
  return {
    label: 'Scenario 3',
    months,
    // Sales come from the same series as Scenario 1; months not sold yet stay empty.
    actual: months.map(m => sold(m, false)),
    partial: months.map(m => sold(m, true)),
    forecast: s3.blended.map(b => b.qty),
    lower: s3.blended.map(b => b.rangeDown),
    upper: s3.blended.map(b => b.rangeUp),
    scenario: props.scenario ? months.map(m => whatIf(m)?.qty ?? null) : undefined,
    multiplier: props.scenario ? months.map(m => whatIf(m)?.multiplier ?? null) : undefined,
  }
}

const isScenario1 = computed(() => props.series === 'scenario1')
const isScenario3 = computed(() => props.series === 'scenario3')
/** a series read from data/sku.json (real months, shared y scale) */
const isReal = computed(() => isScenario1.value || isScenario3.value)
const s = computed<Series>(() => (isScenario1.value
  ? scenario1()
  : scenario3()))
const isMock = computed(() => (isScenario1.value ? s1._mock : s3._mock))

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// ----- Geometry: margins around the plot, for each size -----
const G = computed(() => (props.compact
  ? { W: 372, H: 232, left: 4, right: 4, top: 34, bottom: 34 }
  : { W: 590, H: 360, left: 48, right: 22, top: 34, bottom: props.series.startsWith('scenario') ? 42 : 34 }))
// (the real series have a deeper bottom margin on every slide: slide 17 draws
// its period brackets there, and slide 16 must have the same plot area.)
const PW = computed(() => G.value.W - G.value.left - G.value.right)
const PH = computed(() => G.value.H - G.value.top - G.value.bottom)
const domain = computed(() => (props.compact ? s1Domain : [0, s1Max * 1.02]))
const yTicks = computed(() => s1Ticks)

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
const grow = ref(props.showBand || props.draw ? 1 : 0)
let frame = 0
watch(() => props.showBand, (on) => {
  cancelAnimationFrame(frame)
  if (props.draw) // the band fades in at full width (CSS), it does not grow
    return
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

// Periods passed by the slide ('YYYY-MM' → index in the window).
const regionBoxes = computed(() => props.regions.map((r) => {
  const a = s.value.months.indexOf(r.from)
  const b = s.value.months.indexOf(r.to)
  const x0 = Math.max(G.value.left, x(a) - step.value / 3)
  const x1 = Math.min(G.value.left + PW.value, x(b) + step.value / 3)
  // Lowest and highest scenario multiplier of the period, from the data.
  const mult = (s.value.multiplier ?? []).slice(a, b + 1).filter(m => m != null) as number[]
  const lo = Math.min(...mult)
  const hi = Math.max(...mult)
  const range = mult.length ? `${fmtMult(lo)} – ${fmtMult(hi)}` : ''
  return { a, b, x: x0, width: x1 - x0, label: r.label ?? range, above: mult.length > 0 && lo > 1 }
}).filter(r => r.a >= 0 && r.b >= 0))

// Months where sales were well below the forecast (slide 16): one dot each.
const lowDots = computed(() => {
  if (props.markBelow == null)
    return []
  const below = useBaselineCheck(props.markBelow).below
  return s.value.months.flatMap((m, i) => {
    const v = s.value.actual[i]
    return below.includes(m) && v != null ? [{ m, x: x(i), y: y(v) }] : []
  })
})

// Month labels under the full-size chart. Real months ('2025-07') are written
// "Jul 25", one every three months; the mock series already has short names.
const fullTicks = computed(() => s.value.months
  .map((m, i) => ({ i, m }))
  .filter(t => !isReal.value || /-(01|04|07|10)$/.test(t.m))
  .map(t => ({ i: t.i, label: isReal.value ? `${MONTH_NAMES[+t.m.slice(5) - 1]} ${t.m.slice(2, 4)}` : t.m })))

// Compact size: a label only every January and July, written "Jul 24".
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
    :style="{ '--draw-ms': `${DRAW_MS}ms` }"
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
      <g v-for="t in yTicks" :key="t">
        <line :x1="G.left" :x2="G.left + PW" :y1="y(t)" :y2="y(t)" class="grid-line" />
        <text :x="G.left - 8" :y="y(t) + 5" text-anchor="end">{{ fmtCompact(t) }}</text>
      </g>
      <!-- Unit of the y axis, read from the data file -->
      <text v-if="isReal" :x="G.left - 8" y="16" text-anchor="end">{{ unit }}</text>
      <text v-for="t in fullTicks" :key="t.i" :x="x(t.i)" :y="G.H - 8" text-anchor="middle">{{ t.label }}</text>
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

    <!-- Extra lines from the slide that must stay under the band -->
    <slot name="under" :line="line" :x="x" :y="y" :forecast-start="windowForecastStart" />

    <!-- Layer 1: 90% prediction interval -->
    <path :d="bandPath" class="band" :class="{ off: !showBand, late: draw }" />

    <!-- Layer 2: deviation highlight (amber = what changed on this click) -->
    <g v-if="deviationBox" class="deviation" :class="{ on: highlight }">
      <rect :x="deviationBox.x" :y="G.top" :width="deviationBox.width" :height="PH" />
      <text :x="deviationBox.x + deviationBox.width / 2" :y="G.top + PH - 10" text-anchor="middle">
        {{ deviationBox.label }}
      </text>
    </g>


    <!-- Extra lines from the slide (slide 12: the six model lines) -->
    <slot :line="line" :x="x" :y="y" :forecast-start="windowForecastStart" />

    <!-- The file's own line, left behind as a ghost while `blend` is shown -->
    <path v-if="isScenario1" :d="line(fileQty, windowForecastStart)" class="ghost-forecast" :class="{ on: !!blend }" />

    <!-- Layer 3: combined forecast and actual demand -->
    <path :d="line(s.forecast)" class="forecast" :class="[draw ? 'draws' : 'fades', { off: !showForecast }]" pathLength="1" />
    <path v-if="showActual" :d="line(s.actual)" class="actual" />
    <!-- Incomplete months: hollow point, not joined to the line -->
    <g v-if="showActual" class="partial">
      <template v-for="(v, i) in s.partial" :key="i">
        <g v-if="v != null">
          <circle :cx="x(i)" :cy="y(v)" r="5" />
          <text :x="x(i) + 11" :y="y(v) + 5">partial month</text>
        </g>
      </template>
    </g>

    <!-- Layer 4: scenario impact, dotted, drawn in from the left -->
    <path
      v-if="s.scenario"
      :d="line(s.scenario)"
      class="scenario-line"
      :clip-path="`url(#${clipId})`"
    />

    <!-- Periods passed by the slide: bracket under the axis + one label in the plot -->
    <g v-for="r in regionBoxes" :key="r.x" class="period" :class="{ on: highlight, above: r.above }">
      <path :d="`M${r.x} ${G.top + PH + 4}v6h${r.width}v-6`" />
      <text :x="r.x + r.width / 2" :y="G.top + PH - 7" text-anchor="middle">{{ r.label }}</text>
    </g>

    <!-- Months well below the forecast: a dot on the actual line -->
    <g class="low-dots" :class="{ on: highlight }">
      <circle v-for="d in lowDots" :key="d.m" :cx="d.x" :cy="d.y" r="6" />
    </g>

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
    <g v-if="!compact" class="legend" :transform="`translate(${G.left + (showActual ? 0 : -62)}, 0)`">
      <text v-if="showActual" x="0" y="16" class="legend-actual">actual</text>
      <text x="62" y="16" class="legend-forecast fades" :class="{ off: !showForecast }">combined forecast</text>
      <g class="legend-band" :class="{ off: !showBand, late: draw }">
        <rect x="216" y="4" width="14" height="14" rx="2" class="band" />
        <text x="235" y="16">90% band</text>
      </g>
      <g class="legend-scenario" :class="{ on: scenario }">
        <line x1="326" x2="346" y1="11" y2="11" class="scenario-line" />
        <text x="353" y="16">scenario</text>
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
    <text v-if="isMock" :x="G.W - G.right" :y="16" text-anchor="end" class="mock">MOCK</text>
  </svg>
</template>

<style scoped>
.forecast-chart {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

/* Both sizes are drawn 1:1, so 16 px here is 16 px on the slide (deck minimum). */
.axis text,
.legend text {
  fill: var(--chart-axis);
  font-family: var(--font-body);
  font-size: 16px;
}
.legend-actual {
  fill: var(--chart-actual) !important;
}
.legend-forecast {
  fill: var(--chart-forecast) !important;
  font-weight: 600;
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
.partial circle {
  fill: var(--c-bg);
  stroke: var(--chart-actual);
  stroke-width: 2.5;
}
.partial text {
  fill: var(--chart-axis);
  font-family: var(--font-body);
  font-size: 16px;
}
.ghost-forecast {
  fill: none;
  stroke: var(--chart-axis);
  stroke-width: 2;
  stroke-dasharray: 5 4;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.ghost-forecast.on {
  opacity: 0.8;
}
/* Blue line and its legend entry. A parent can delay the fade-in by setting
   --forecast-delay on the chart (slide 12 does, to wait for its merge). */
.fades {
  transition: opacity 0.4s ease var(--forecast-delay, 0s);
}
.fades.off {
  opacity: 0;
}
/* `draw`: the path counts as 1 unit long (pathLength="1"), so a dash of 1
   pushed back by 1 hides it, and moving the offset to 0 draws it. */
.draws {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset var(--draw-ms) ease-in-out;
}
.draws.off {
  stroke-dashoffset: 1;
  transition-duration: 0.3s;
}
/* …and the band waits for the line before it fades in. */
.band.late,
.legend-band.late {
  transition: opacity 0.5s ease var(--draw-ms);
}
.band.late.off,
.legend-band.late.off {
  transition-delay: 0s;
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
  font-size: 16px;
  font-weight: 600;
}

/* ---------- Periods (slide 17) and low months (slide 16) ---------- */
.period,
.low-dots {
  opacity: 0;
  transition: opacity 0.5s ease;
}
.period.on,
.low-dots.on {
  opacity: 1;
}
.period path {
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.5;
}
.period text {
  fill: var(--c-muted);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
/* A period above ×1 is the one to watch: amber. */
.period.above path {
  stroke: var(--c-warn);
}
.period.above text {
  fill: var(--c-warn);
}
.low-dots circle {
  fill: var(--chart-actual);
  stroke: var(--c-bg);
  stroke-width: 2;
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
  font-size: 16px;
  letter-spacing: 0.08em;
}

.legend-band {
  transition: opacity 0.4s ease;
}
.legend-band.off {
  opacity: 0;
}

@media print, (prefers-reduced-motion: reduce) {
  .forecast-chart * {
    transition: none !important;
  }
}
</style>
