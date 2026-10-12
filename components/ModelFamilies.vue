<!--
The six forecasting models as three families, each with a small schematic of
how it sees demand.

  step 0   headers, model names, idea and footer; the three mini-diagrams are
           shown faint, in their final state
  step 1   the mini-diagrams play one after the other (trees, Prophet, foundation)
  step 2   full-width callout at the bottom

Usage:  <ModelFamilies :step="$clicks" />

The layout is fixed: the callout has its place reserved from the start and only
fades in, so nothing moves between clicks.

How the animation works: one clock (`clock`, in seconds) runs from 0 to END
after click 1. Every animated part asks `p(start, duration)` for its progress
(0 → 1) and uses it as an opacity, a stroke offset or a blend factor. To retime
the slide, change the numbers in `T` below.

The drawings are schematic shapes, not data. Sources: thesis Chapter 4,
"Predictive Modeling Methodologies", Tables 4.1 and 4.2.
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const { isPrintMode } = useNav()

// ----- Timeline (seconds after click 1) -----
const T = {
  rows: 0.2, // trees: first row of the feature table starts filling
  rowGap: 0.38, // delay between two rows
  point: 1.9, // arrow, then the "next month" cells
  trend: 2.9, // Prophet: trend line draws
  season: 3.6, // seasonal wave draws
  series: 4.4, // the two combine into one series
  paths: 5.6, // foundation: sampled paths appear one by one
  pathGap: 0.1,
  collapse: 6.8, // paths collapse onto the P70 line
}
const END = 8

const clock = ref(END) // END = everything in its final state
let frame = 0
function stop() {
  cancelAnimationFrame(frame)
}
function play() {
  stop()
  const t0 = performance.now()
  const tick = (now: number) => {
    clock.value = Math.min((now - t0) / 1000, END)
    if (clock.value < END)
      frame = requestAnimationFrame(tick)
  }
  clock.value = 0
  frame = requestAnimationFrame(tick)
}
// Only the forward click 0 → 1 plays. Every other way of arriving (going back
// from click 2, coming back from the next slide, PDF export) shows the end state.
watch(() => props.step, (now, before) => {
  if (now === 1 && before === 0 && !isPrintMode.value)
    play()
  else {
    stop()
    clock.value = END
  }
})
onBeforeUnmount(stop)

/** Progress of one animated part: 0 before `start`, 1 after `start + dur`, eased in between. */
function p(start: number, dur: number) {
  const x = Math.min(Math.max((clock.value - start) / dur, 0), 1)
  return x * x * (3 - 2 * x)
}

// TODO(João): review wording (headers, ideas, footers, diagram labels, callout)
const families = [
  { id: 'tree', title: 'Tree-based', tag: '', models: ['RF', 'XGBoost', 'LightGBM'], idea: 'learns from recent months', foot: 'one model for all items' },
  { id: 'stat', title: 'Statistical', tag: '', models: ['Prophet'], idea: 'trend × yearly season', foot: 'one model per item' },
  { id: 'found', title: 'Foundation', tag: 'zero-shot', models: ['Chronos', 'Granite'], idea: 'pre-trained on large collections of series', foot: 'no training on our data' },
]

// ----- Geometry (px) -----
const W = 868
const COLS_H = 312
const CALLOUT_GAP = 12
const CALLOUT_H = 62
const H = COLS_H + CALLOUT_GAP + CALLOUT_H
const px = (n: number) => `${n}px`

// Every mini-diagram is drawn in the same box, at its real size (1 unit = 1 px
// on the slide), so a 16 px label in the drawing is 16 px on the slide.
const DW = 246
const DH = 158
const line = (pts: number[][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('')

// ---------- 1 · Trees: feature table → next month ----------
const FEATURES = ['lag1', 'lag2', 'lag3', 'MA3', 'EMA3/6', 'month']
const CELL_W = 27
const ROW_H = 18
const ROWS = 4
const GRID_Y = 62 // the column headers are written vertically above the table
const TARGET_X = 190
const TARGET_W = DW - TARGET_X
// How strong each cell is drawn. Arbitrary, only there so the table looks filled.
const shade = (r: number, c: number) => 0.3 + ((r * 7 + c * 5) % 6) * 0.11
const cells = Array.from({ length: ROWS * FEATURES.length }, (_, i) => {
  const r = Math.floor(i / FEATURES.length)
  const c = i % FEATURES.length
  return { r, c, x: c * CELL_W, y: GRID_Y + r * ROW_H, shade: shade(r, c), calendar: c === FEATURES.length - 1 }
})
const cellOpacity = (r: number, c: number) => p(T.rows + r * T.rowGap + c * 0.04, 0.3)

// ---------- 2 · Prophet: trend × yearly season = one series ----------
const X0 = 112 // the two parts are drawn to the right of their labels
const xs = Array.from({ length: 69 }, (_, i) => i / 68)
const trendAt = (u: number) => 0.5 + 0.5 * u
const seasonAt = (u: number) => Math.sin(u * 3 * 2 * Math.PI) // three years
const trendPath = line(xs.map(u => [X0 + u * (DW - X0), 28 - trendAt(u) * 20]))
const seasonPath = line(xs.map(u => [X0 + u * (DW - X0), 48 - seasonAt(u) * 9]))
// Multiplicative, as in the thesis: the seasonal swing grows with the trend.
const seriesPath = line(xs.map(u => [2 + u * (DW - 4), 156 - trendAt(u) * (1 + 0.4 * seasonAt(u)) * 36]))

// ---------- 3 · Foundation: sampled paths → P70 ----------
const NOW_X = 96
const NOW_Y = 58
const END_X = 186
const STEPS = 9
// Small repeatable pseudo-random numbers, so the drawing is the same on every load.
function noise(i: number, k: number) {
  const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453
  return (s - Math.floor(s)) * 2 - 1
}
const historyPath = line(Array.from({ length: 14 }, (_, k) => [2 + k * 7, NOW_Y + 6 + noise(40, k) * 11]).concat([[NOW_X, NOW_Y]]))
const DRIFTS = [-40, -30, -21, -12, -2, 9, 20, 33] // where each path ends, relative to today
const samples = DRIFTS.map((drift, i) =>
  Array.from({ length: STEPS }, (_, k) => {
    const u = k / (STEPS - 1)
    return [NOW_X + u * (END_X - NOW_X), NOW_Y + drift * u ** 0.8 + (k ? noise(i, k) * 5 * u : 0)]
  }),
)
// A percentile of the sampled values at each step. Higher demand is drawn
// higher up (smaller y), so the 70th percentile of demand is the 30th of y.
function percentile(q: number) {
  return Array.from({ length: STEPS }, (_, k) => {
    const ys = samples.map(s => s[k][1]).sort((a, b) => a - b)
    const pos = (1 - q) * (ys.length - 1)
    const lo = Math.floor(pos)
    const hi = Math.min(lo + 1, ys.length - 1)
    return [samples[0][k][0], ys[lo] + (ys[hi] - ys[lo]) * (pos - lo)]
  })
}
const p70 = percentile(0.7)
const median = percentile(0.5)
const p70Path = line(p70)
const medianPath = line(median)
// "median" sits at the end of its line; the longer P70 label goes above the fan.
const medianLabelY = median[STEPS - 1][1] + 6
const ghostPaths = samples.map(line)
// The bright copies of the paths move from their own shape onto the P70 line.
const livePaths = computed(() => {
  const c = p(T.collapse, 0.8)
  return samples.map(s => line(s.map(([x, y], k) => [x, y + (p70[k][1] - y) * c])))
})
const liveOpacity = (i: number) => p(T.paths + i * T.pathGap, 0.3) * (1 - p(T.collapse + 0.5, 0.4))
</script>

<template>
  <div class="fam" :class="{ faint: step === 0, summed: step >= 2 }" :style="{ width: px(W), height: px(H) }">
    <div class="fam-cols" :style="{ height: px(COLS_H) }">
      <section v-for="f in families" :key="f.id" class="fam-col">
        <header>
          <strong>{{ f.title }}</strong>
          <span v-if="f.tag">· {{ f.tag }}</span>
        </header>
        <ul class="fam-models">
          <li v-for="m in f.models" :key="m">
            <i />{{ m }}
          </li>
        </ul>
        <p class="fam-idea">
          {{ f.idea }}
        </p>

        <!-- 1 · Trees -->
        <svg v-if="f.id === 'tree'" class="fam-diagram" :width="DW" :height="DH" :viewBox="`0 0 ${DW} ${DH}`" aria-hidden="true">
          <text v-for="(name, c) in FEATURES" :key="name" class="d-label" :transform="`translate(${c * CELL_W + 18} ${GRID_Y - 6}) rotate(-90)`">{{ name }}</text>
          <text class="d-label" :x="DW" :y="GRID_Y - 6" text-anchor="end">next month</text>
          <g v-for="cell in cells" :key="`${cell.r}-${cell.c}`">
            <rect class="d-slot" :x="cell.x" :y="cell.y" :width="CELL_W - 2" :height="ROW_H - 3" rx="3" />
            <rect
              :class="cell.calendar ? 'd-calendar' : 'd-history'" :x="cell.x" :y="cell.y" :width="CELL_W - 2" :height="ROW_H - 3" rx="3"
              :opacity="cell.shade * cellOpacity(cell.r, cell.c)"
            />
          </g>
          <g v-for="r in ROWS" :key="r">
            <rect class="d-slot" :x="TARGET_X" :y="GRID_Y + (r - 1) * ROW_H" :width="TARGET_W" :height="ROW_H - 3" rx="3" />
            <rect class="d-model-fill" :x="TARGET_X" :y="GRID_Y + (r - 1) * ROW_H" :width="TARGET_W" :height="ROW_H - 3" rx="3" :opacity="p(T.point + 0.3 + (r - 1) * 0.08, 0.3)" />
          </g>
          <path class="d-arrow" :d="`M${FEATURES.length * CELL_W + 2} ${GRID_Y + ROWS * ROW_H / 2 - 1.5}h18m-5 -4l5 4l-5 4`" :opacity="p(T.point, 0.3)" />
          <text class="d-label" x="0" :y="DH - 4">one row = one item, one month</text>
        </svg>

        <!-- 2 · Prophet -->
        <svg v-else-if="f.id === 'stat'" class="fam-diagram" :width="DW" :height="DH" :viewBox="`0 0 ${DW} ${DH}`" aria-hidden="true">
          <text class="d-label" x="0" y="24">trend</text>
          <text class="d-label" x="0" y="53">yearly season</text>
          <text class="d-label strong" x="0" y="90">trend × season = series</text>
          <path class="d-axis" :d="`M${X0} 48H${DW}M0 68H${DW}`" />
          <path class="d-part" :d="trendPath" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1 - p(T.trend, 0.6)" />
          <path class="d-part" :d="seasonPath" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1 - p(T.season, 0.6)" />
          <path class="d-model" :d="seriesPath" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1 - p(T.series, 0.9)" />
        </svg>

        <!-- 3 · Foundation -->
        <svg v-else class="fam-diagram" :width="DW" :height="DH" :viewBox="`0 0 ${DW} ${DH}`" aria-hidden="true">
          <path class="d-axis" :d="`M${NOW_X} 2V98`" />
          <text class="d-label" x="0" y="114">history</text>
          <text class="d-label" :x="NOW_X + 6" y="114">sampled futures</text>
          <path class="d-actual" :d="historyPath" />
          <path v-for="(d, i) in ghostPaths" :key="`g${i}`" class="d-sample ghost" :d="d" />
          <path v-for="(d, i) in livePaths" :key="`s${i}`" class="d-sample" :d="d" :opacity="liveOpacity(i)" />
          <g :opacity="p(T.collapse + 0.3, 0.5)">
            <path class="d-median" :d="medianPath" />
            <text class="d-label" :x="END_X + 5" :y="medianLabelY">median</text>
            <path class="d-model" :d="p70Path" />
            <text class="d-label model" :x="DW" y="15" text-anchor="end">P70 (validation)</text>
          </g>
          <text class="d-label" x="0" y="136">Chronos: sampled paths → P70</text>
          <text class="d-label" x="0" y="155">Granite: one forecast</text>
        </svg>

        <footer>{{ f.foot }}</footer>
      </section>
    </div>

    <!-- Takeaway (step 2) -->
    <div class="fam-callout" :style="{ top: px(COLS_H + CALLOUT_GAP), height: px(CALLOUT_H) }">
      <p>Different assumptions → one family's weakness is diluted, not passed to the planner.</p>
      <p class="fam-example">
        e.g. foundation models struggle with long runs of zero sales
      </p>
    </div>
  </div>
</template>

<style scoped>
.fam {
  position: relative;
  font-size: 14px;
  line-height: 1.3;
}

/* ---------- Columns ---------- */
.fam-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.fam-col {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.fam-col header {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.fam-col header strong {
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.fam-col header span {
  color: var(--c-muted);
  font-size: 12.5px;
}
.fam-models {
  display: flex;
  gap: 14px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.fam-models li {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  list-style: none;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.25;
  white-space: nowrap;
}
.fam-models i {
  width: 9px;
  height: 9px;
  flex: none;
  border-radius: 50%;
  background: var(--chart-model);
}
.fam-idea {
  margin: 8px 0 0;
  color: var(--c-muted);
  font-size: 13px;
  line-height: 1.25;
}
.fam-col footer {
  margin-top: 8px;
  padding-top: 7px;
  border-top: 1px solid var(--c-line);
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.25;
}

/* ---------- Mini-diagrams ---------- */
.fam-diagram {
  display: block;
  flex: none;
  align-self: center;
  margin-top: auto; /* pushes diagram and footer to the bottom, so the three line up */
  overflow: visible;
  transition: opacity 0.4s ease;
}
.faint .fam-diagram {
  opacity: 0.4;
}
.fam-diagram path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.d-label {
  fill: var(--chart-axis);
  font-family: var(--font-body);
  font-size: 16px; /* deck minimum for any text, chart labels included */
}
.d-label.strong {
  fill: var(--c-text);
}
.d-label.model {
  fill: var(--chart-model);
  font-weight: 600;
}
.d-slot {
  fill: none;
  stroke: var(--chart-grid);
  stroke-width: 1;
}
.d-history {
  fill: var(--chart-actual);
}
.d-calendar {
  fill: var(--chart-axis);
}
.d-model-fill {
  fill: var(--chart-model);
}
.d-arrow {
  stroke: var(--chart-axis);
  stroke-width: 1.5;
}
.d-axis {
  stroke: var(--chart-grid);
  stroke-width: 1;
  stroke-dasharray: 3 3;
}
.d-part {
  stroke: var(--chart-axis);
  stroke-width: 1.6;
}
.d-actual {
  stroke: var(--chart-actual);
  stroke-width: 1.6;
}
.d-model {
  stroke: var(--chart-model);
  stroke-width: 2.2;
}
.d-sample {
  stroke: var(--chart-model);
  stroke-width: 1;
}
.d-median {
  stroke: var(--chart-axis);
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
  opacity: 0.7;
}
.d-sample.ghost {
  opacity: 0.22;
}

/* ---------- Step 2: takeaway ---------- */
.fam-callout {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 0 16px;
  border-left: 4px solid var(--c-accent);
  border-radius: 0 8px 8px 0;
  background: var(--c-surface);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.summed .fam-callout {
  opacity: 1;
}
.fam-callout p {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}
.fam-callout p.fam-example {
  color: var(--c-muted);
  font-size: 12.5px;
  font-weight: 400;
}

@media print, (prefers-reduced-motion: reduce) {
  .fam * {
    transition: none !important;
  }
}
</style>
