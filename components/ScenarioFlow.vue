<!--
Slide 16: how a scenario works, shown on ONE worked month (April).

  step 0   timeline 2021 | 2022, "war starts · Feb 2022" marker,
           two shaded windows: "year before" / "year of the event"
  step 1   April lights up in both windows; two bars (Apr 2021, Apr 2022)
           and the ratio "×0.68 (−32%)" = duringQty / preQty
  step 2   arrow to the Apr 2025 forecast bar, which shrinks from the
           baseline to the scenario value; amber truck chip "lead time ×3"
  step 3   12 month chips with the real multipliers (<1 muted, >1 amber),
           + grey line: no-data rule and "what-if, not a prediction"

Usage:  <ScenarioFlow :step="$clicks" />

DATA: data/sku.json
  scenario2.reference   the worked example (event, windows, example month,
                        preQty / duringQty). indexed=true → the two bars are
                        an index (year before = 100), not kg.
  scenario1.blended     Apr 2025 baseline forecast (real)
  scenario2.line        Apr 2025 scenario value + all 12 multipliers (real)

Geometry: the SVG is drawn 1:1 in slide pixels (viewBox = W × H), so
font-size 16 in the SVG is 16 px on the slide. Every element has its place
from the start and only fades in; the 2025 bar is the only thing that moves.
-->
<script setup lang="ts">
import { baseUnit, fmtInt, fmtMult } from '../composables/useFormat'
import { monthName } from '../composables/useScenarios'
import sku from '../data/sku.json'
import { stationIcons } from './stationIcons'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const ex = sku.scenario2.reference // the worked example
const unit = baseUnit(sku.unit)

// ----- The worked month -----
const ratio = ex.duringQty / ex.preQty
const pct = Math.round((ratio - 1) * 100)
const pctLabel = `${pct < 0 ? '−' : '+'}${Math.abs(pct)}%`
const barLabel = (v: number) => (ex.indexed ? `index ${fmtInt(v)}` : `${fmtInt(v)} ${unit}`)

const target = `2025-${ex.exampleMonth}`
const base = sku.scenario1.blended.find(b => b.month === target)!.qty
const scen = sku.scenario2.line.find(l => l.month === target)!
const monthLabel = monthName(target)

// ----- Twelve multipliers, one per forecast month -----
const chips = sku.scenario2.line.map(l => ({
  month: l.month,
  name: monthName(l.month),
  text: fmtMult(l.multiplier),
  up: l.multiplier > 1,
  example: l.month === target,
}))

// ----- Geometry (slide px) -----
const W = 868
const H = 236
const WIN = 270 // width of one year window
const SLOT = WIN / 12 // one month
const WIN_Y = 24 // top of the windows
const WIN_H = 28
const BASE_Y = 186 // baseline of all bars
const BAR_H = 100 // tallest bar
const BAR_W = 30

const exIdx = +ex.exampleMonth - 1
const xPre = (exIdx + 0.5) * SLOT // centre of the example month, year before
const xDur = WIN + xPre // same month, year of the event
const xWar = WIN + (+ex.anchor.slice(5, 7) - 0.5) * SLOT // middle of the anchor month

const hPre = BAR_H
const hDur = BAR_H * ratio

const X25 = 570 // centre of the 2025 bar
const scale25 = scen.qty / base // the bar shrinks by this factor
const ARROW_Y = BASE_Y - 40
</script>

<template>
  <!-- TODO(João): review wording -->
  <div class="sf" :style="{ '--scale25': scale25 }">
    <svg class="sf-svg" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <!-- step 0: two year windows with month slots, and the war marker -->
      <g>
        <g v-for="(y, wi) in [ex.preWindow, ex.duringWindow]" :key="y">
          <rect class="win" :x="wi * WIN" :y="WIN_Y" :width="WIN - 2" :height="WIN_H" rx="4" />
          <line
            v-for="k in 11" :key="k" class="slot-tick"
            :x1="wi * WIN + k * SLOT" :x2="wi * WIN + k * SLOT"
            :y1="WIN_Y + 6" :y2="WIN_Y + WIN_H - 6"
          />
          <text class="t-muted" :x="wi * WIN + WIN / 2" :y="WIN_Y - 8" text-anchor="middle">
            {{ y }} · {{ wi === 0 ? 'year before' : 'year of the event' }}
          </text>
        </g>
        <line class="war" :x1="xWar" :x2="xWar" :y1="WIN_Y - 2" :y2="WIN_Y + WIN_H + 14" />
        <text class="t-warn" :x="xWar + 6" :y="WIN_Y + WIN_H + 22">war starts · Feb 2022</text>
      </g>

      <!-- step 1: the example month in both windows, two bars and the ratio -->
      <g class="fade" :class="{ on: step >= 1 }">
        <rect class="slot-on" :x="xPre - SLOT / 2" :y="WIN_Y" :width="SLOT" :height="WIN_H" />
        <rect class="slot-on" :x="xDur - SLOT / 2" :y="WIN_Y" :width="SLOT" :height="WIN_H" />

        <rect class="bar-ref" :x="xPre - BAR_W / 2" :y="BASE_Y - hPre" :width="BAR_W" :height="hPre" rx="2" />
        <rect class="bar-ref" :x="xDur - BAR_W / 2" :y="BASE_Y - hDur" :width="BAR_W" :height="hDur" rx="2" />
        <text class="t-muted" :x="xPre" :y="BASE_Y - hPre - 8" text-anchor="middle">{{ barLabel(ex.preQty) }}</text>
        <text class="t-muted" :x="xDur" :y="BASE_Y - hDur - 8" text-anchor="middle">{{ barLabel(ex.duringQty) }}</text>
        <line class="base" :x1="xPre - 40" :x2="xDur + 40" :y1="BASE_Y" :y2="BASE_Y" />
        <text class="t-text" :x="xPre" :y="BASE_Y + 22" text-anchor="middle">{{ monthLabel }} {{ ex.preWindow }}</text>
        <text class="t-text" :x="xDur" :y="BASE_Y + 22" text-anchor="middle">{{ monthLabel }} {{ ex.duringWindow }}</text>

        <text class="t-ratio" :x="(xPre + xDur) / 2" :y="BASE_Y - 50" text-anchor="middle">
          {{ fmtMult(ratio) }} ({{ pctLabel }})
        </text>
        <text class="t-muted" :x="(xPre + xDur) / 2" :y="BASE_Y + 44" text-anchor="middle">
          same month, year before vs year of the event
        </text>
      </g>

      <!-- step 2: apply it to the same month of the forecast -->
      <g class="fade" :class="{ on: step >= 2 }">
        <path class="arrow" :d="`M${xDur + BAR_W / 2 + 10} ${ARROW_Y} L${X25 - BAR_W} ${ARROW_Y}`" />
        <path class="arrow" :d="`M${X25 - BAR_W - 8} ${ARROW_Y - 7} L${X25 - BAR_W} ${ARROW_Y} L${X25 - BAR_W - 8} ${ARROW_Y + 7}`" />
        <text class="t-accent" :x="(xDur + X25) / 2 + 10" :y="ARROW_Y - 10" text-anchor="middle">{{ fmtMult(scen.multiplier) }}</text>

        <!-- baseline outline stays; the filled bar shrinks to the scenario value -->
        <rect class="bar-ghost" :x="X25 - BAR_W / 2" :y="BASE_Y - BAR_H" :width="BAR_W" :height="BAR_H" rx="2" />
        <rect class="bar-25" :class="{ shrunk: step >= 2 }" :x="X25 - BAR_W / 2" :y="BASE_Y - BAR_H" :width="BAR_W" :height="BAR_H" rx="2" />
        <line class="base" :x1="X25 - 40" :x2="X25 + 40" :y1="BASE_Y" :y2="BASE_Y" />

        <text class="t-text" :x="X25 + BAR_W / 2 + 14" :y="BASE_Y - BAR_H + 14">{{ monthLabel }} 2025 forecast</text>
        <text class="t-muted num-old" :class="{ gone: step >= 2 }" :x="X25 + BAR_W / 2 + 14" :y="BASE_Y - BAR_H + 42">{{ fmtInt(base) }} {{ unit }}</text>
        <text class="num-new" :class="{ shown: step >= 2 }" :x="X25 + BAR_W / 2 + 14" :y="BASE_Y - BAR_H + 42">
          <tspan class="t-big">{{ fmtInt(scen.qty) }} {{ unit }}</tspan>
          <tspan class="t-muted" dx="6">({{ fmtInt(base) }})</tspan>
        </text>
        <text class="t-text" :x="X25" :y="BASE_Y + 22" text-anchor="middle">{{ monthLabel }} 2025</text>

        <!-- truck chip -->
        <g :transform="`translate(${X25 + BAR_W / 2 + 10}, ${BASE_Y - 46})`">
          <rect class="truck-chip" x="0" y="0" width="254" height="30" rx="15" />
          <path class="truck" :d="stationIcons.dock" transform="translate(10, 4) scale(0.9)" />
          <text class="t-warn" x="38" y="21">lead time ×3 → order earlier</text>
        </g>
      </g>
    </svg>

    <!-- step 3: one multiplier per month -->
    <div class="sf-months fade" :class="{ on: step >= 3 }">
      <p class="sf-label">
        one multiplier per product, per month
      </p>
      <ol class="sf-chips">
        <li v-for="c in chips" :key="c.month" :class="{ up: c.up, example: c.example }">
          <span class="m">{{ c.name }}</span>
          <span class="v">{{ c.text }}</span>
        </li>
      </ol>
      <p class="sf-note">
        no data for a month → ×0.00 + Information warning · what-if, not a prediction
      </p>
    </div>
  </div>
</template>

<style scoped>
.sf {
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.3;
}
.sf p {
  margin: 0;
}
.sf-svg {
  display: block;
  overflow: visible;
}
.sf-svg text {
  font-size: 16px;
  font-family: var(--font-body);
}

/* ----- Text colours ----- */
.t-text { fill: var(--c-text); }
.t-muted { fill: var(--c-muted); }
.t-warn { fill: var(--c-warn); }
.t-accent { fill: var(--c-accent); }
.sf-svg .t-ratio {
  fill: var(--c-text);
  font-weight: 700;
  font-size: 20px;
}
.t-big {
  fill: var(--c-text);
  font-weight: 700;
  font-size: 22px;
}

/* ----- Timeline ----- */
.win {
  fill: var(--c-surface);
  stroke: var(--c-line);
}
.slot-tick {
  stroke: var(--c-line);
}
.slot-on {
  fill: var(--c-accent);
  opacity: 0.35;
}
.war {
  stroke: var(--c-warn);
  stroke-width: 2;
}

/* ----- Bars ----- */
.bar-ref {
  fill: var(--c-muted);
}
.base {
  stroke: var(--c-line);
}
.bar-ghost {
  fill: none;
  stroke: var(--c-accent);
  stroke-dasharray: 4 3;
}
/* The 2025 bar: full height (baseline) when it appears, then shrinks from
   the bottom up to the scenario value. The delay lets the audience see the
   baseline first. */
.bar-25 {
  fill: var(--c-accent);
  transform-box: fill-box;
  transform-origin: bottom;
  transition: transform 0.8s ease 0.6s;
}
.bar-25.shrunk {
  transform: scaleY(var(--scale25));
}
.num-old {
  transition: opacity 0.3s ease 0.6s;
}
.num-old.gone {
  opacity: 0;
}
.num-new {
  opacity: 0;
  transition: opacity 0.4s ease 1.2s;
}
.num-new.shown {
  opacity: 1;
}
.arrow {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.truck-chip {
  fill: none;
  stroke: var(--c-warn);
}
.truck {
  fill: var(--c-warn);
}

/* ----- Month chips ----- */
.sf-months {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 16px;
}
.sf-label {
  color: var(--c-text);
}
.sf-chips {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.sf-chips li {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  padding: 0;
}
.sf-chips .m {
  color: var(--c-muted);
}
.sf-chips .v {
  width: 100%;
  border: 2px solid var(--c-line);
  border-radius: 999px;
  background: var(--c-surface);
  color: var(--c-muted);
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.sf-chips .up .v {
  border-color: var(--c-warn);
  color: var(--c-warn);
}
.sf-chips .example .v {
  border-color: var(--c-accent);
}
.sf-note {
  color: var(--c-muted);
}

/* ----- Reveal: fade only ----- */
.fade {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.fade.on {
  opacity: 1;
}
</style>
