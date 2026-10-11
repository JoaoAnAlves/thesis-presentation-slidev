<!--
Three-tier architecture as vertical tiers, continuing slide 6: the stations
are now screen tiles at the top, and the shared-plan band at the bottom is the
central database (same position and size as on slide 6).

  step 0   everything visible
  step 1   request-path animation: a blue pulse follows a training request
           (Office → Webservice → DB and back → Engine → DB → Webservice →
           Office) while an amber pulse shows a Dock request being answered
           in the meantime; the six model dots turn green one by one
           while the Engine is busy. The arrowhead a pulse is heading for
           lights up in the pulse's colour and the opposite one fades
  step 2   one "why" chip under each server box

Usage:  <ArchitectureTiers :step="$clicks" />

The layout is fixed: every box has a known position in px, so nothing moves
between clicks and the request-path pulses can use the same coordinates.
-->
<script setup lang="ts">
import { useIsSlideActive, useNav } from '@slidev/client'
import { onUnmounted, reactive, watch } from 'vue'
import type { ModelState } from './ModelDots.vue'
import { stationIcons } from './stationIcons'
import type { StationId } from './stationIcons'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// ----- Tune the request-path animation here -----
const SPEED = 272 // px per second the pulses travel
const DWELL = 1 // seconds a pulse waits at each labelled stop
const DOT_GAP = 0.4 // seconds between one model dot turning green and the next
const HEAD_HOLD = 0.2 // seconds an arrowhead stays lit after the pulse has passed (0 = exactly in step)

// TODO(João): review wording (all labels below)
const tiles: { id: StationId, name: string }[] = [
  { id: 'office', name: 'Office' },
  { id: 'dock', name: 'Dock' },
  { id: 'work', name: 'Work' },
]
// Central Webservice: four responsibilities, each with a small line icon.
const webDoes = [
  { label: 'gateway', icon: 'M3 12h11M10 8l4 4-4 4M14 4h6v16h-6' },
  { label: 'access control', icon: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3' },
  { label: 'business logic', icon: 'M4 6h7v12H4M11 12h8M16 9l3 3-3 3' },
  { label: 'persistence', icon: 'M5 6c0-1.700 3.100-3 7-3s7 1.300 7 3-3.100 3-7 3-7-1.300-7-3ZM5 6v12c0 1.700 3.100 3 7 3s7-1.300 7-3V6M5 12c0 1.700 3.100 3 7 3s7-1.300 7-3' },
]
// Analytical Engine: the six models, in the order their dots turn green.
const models = ['RF', 'XGBoost', 'LightGBM', 'Prophet', 'Chronos', 'Granite']
const whys = ['partner\'s choice · lightweight Java', 'ML ecosystem · async jobs']
const stored = ['sales history', 'model performance', 'production plans']

// ----- Geometry (px) -----
// Width, column centres, connector height and band height are the same as in
// FactoryFloor, so the band lands on exactly the same pixels as on slide 6.
const W = 868
const GAP = 16
const COL_W = (W - 2 * GAP) / 3
const colX = (i: number) => i * (COL_W + GAP) + COL_W / 2

const CLIENT_H = 58
const TILE_W = 170
const TILE_H = 27
const TILE_Y = 25

const SERVER_Y = 88
const SERVER_H = 224
const BOX_W = [320, 370] // webservice, engine (about 15% wider)
const BOX_H = 152
const BOX_Y = SERVER_Y + 30
const BOX_PAD = 14 // distance from the server tier's edge to a box
const boxX = [BOX_PAD, W - BOX_PAD - BOX_W[1]] // left edge of each server box
const boxCx = boxX.map((x, i) => x + BOX_W[i] / 2) // centre of each server box
const REST_X = [boxX[0] + BOX_W[0], boxX[1]] // the gap between the two boxes
const REST_Y = BOX_Y + BOX_H / 2
const CHIP_Y = BOX_Y + BOX_H + 8

const LINK_H = 22
const BAND_Y = SERVER_Y + SERVER_H + LINK_H
const BAND_H = 34
const H = BAND_Y + BAND_H

const px = (n: number) => `${n}px`

// ----- Request path (step 1) -----
// Same idea as the ripple on slide 6: the path is cut into straight segments,
// each segment is its own dot, and each dot is visible only while it travels.
// `run` lays segments end to end along a list of points, starting at time t,
// and returns the time the last one finishes. Every later start time is built
// from those return values, so nothing is timed by hand.
type Pt = [number, number]
interface Seg { x1: number, y1: number, x2: number, y2: number, start: number, dur: number, tone: 'req' | 'other' }
const segments: Seg[] = []
function run(tone: Seg['tone'], t: number, pts: Pt[]) {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]
    const [x2, y2] = pts[i]
    const dur = Math.hypot(x2 - x1, y2 - y1) / SPEED
    segments.push({ x1, y1, x2, y2, start: t, dur, tone })
    t += dur
  }
  return t
}

// Named points. A screen's requests leave along the bottom edge of the client
// tier to the single entry wire, then go down to the Webservice.
const officeOut: Pt = [colX(0), CLIENT_H]
const dockOut: Pt = [colX(1), CLIENT_H]
const entry: Pt = [boxCx[0], CLIENT_H]
const webTop: Pt = [boxCx[0], BOX_Y]
const webBottom: Pt = [boxCx[0], BOX_Y + BOX_H]
const dbUnderWeb: Pt = [boxCx[0], BAND_Y]
const restLeft: Pt = [REST_X[0], REST_Y]
const restRight: Pt = [REST_X[1], REST_Y]
const engineBottom: Pt = [boxCx[1], BOX_Y + BOX_H]
const dbUnderEngine: Pt = [boxCx[1], BAND_Y]

// The moments when something reacts (a label fades in, a box flashes).
const at: Record<string, number> = {}

// Blue: the training request, up to the hand-off.
let t = 0
at.ask = t
t = run('req', t, [officeOut, entry, webTop])
at.role = t
t = run('req', t + DWELL, [webBottom, dbUnderWeb])
at.history = t
t = run('req', t + DWELL, [dbUnderWeb, webBottom])
t = run('req', t, [restLeft, restRight])
at.train = t

// Amber: a Dock request, starting just after the engine got busy.
let u = at.train + 0.4
at.dockAsk = u
u = run('other', u, [dockOut, entry, webTop])
at.webOther = u
u = run('other', u + 0.15, [webBottom, dbUnderWeb])
u = run('other', u + HEAD_HOLD + 0.1, [dbUnderWeb, webBottom])
u = run('other', u, [webTop, entry, dockOut])
at.answered = u

// Blue again: the engine finishes one dwell after the Dock got its answer, and
// never before all six model dots are green.
t = Math.max(at.answered + DWELL, at.train + models.length * DOT_GAP + DWELL)
at.trainEnd = t
t = run('req', t, [engineBottom, dbUnderEngine])
at.written = t
t = run('req', t + DWELL, [dbUnderWeb, webBottom])
at.webBack = t
t = run('req', t + 0.12, [webTop, entry, officeOut])
at.shown = t

// ----- Connectors and their arrowheads -----
// Each connector is a line from `p` to `q` with an arrowhead at both ends.
// The arrowheads are driven by the same `segments` list as the dots: for every
// segment that runs along a connector, the head it is heading for gets a "lit"
// animation and the opposite head a "dim" animation, with that segment's own
// start time and duration. Nothing here is timed separately.
const HEAD_LEN = 7
const HEAD_HALF = 5
const connectors: { id: string, p: Pt, q: Pt }[] = [
  { id: 'entry', p: [boxCx[0], CLIENT_H], q: [boxCx[0], SERVER_Y] },
  { id: 'web-db', p: [boxCx[0], SERVER_Y + SERVER_H], q: [boxCx[0], BAND_Y] },
  { id: 'engine-db', p: [boxCx[1], SERVER_Y + SERVER_H], q: [boxCx[1], BAND_Y] },
  { id: 'rest', p: [REST_X[0] + 6, REST_Y], q: [REST_X[1] - 6, REST_Y] },
]
// Does segment g run along the line p–q? Returns +1 if it travels p → q,
// -1 for q → p, 0 if it is somewhere else.
function travels(g: Seg, p: Pt, q: Pt) {
  const axis = p[0] === q[0] ? 0 : 1 // 0: vertical connector (same x), 1: horizontal (same y)
  const along = 1 - axis
  const g1 = [g.x1, g.y1]
  const g2 = [g.x2, g.y2]
  if (g1[axis] !== p[axis] || g2[axis] !== p[axis])
    return 0
  const overlap = Math.min(Math.max(g1[along], g2[along]), q[along]) - Math.max(Math.min(g1[along], g2[along]), p[along])
  return overlap > 0 ? Math.sign(g2[along] - g1[along]) : 0
}
// A chevron with its tip at `tip`, pointing away from `from`.
function chevron(tip: Pt, from: Pt) {
  const len = Math.hypot(tip[0] - from[0], tip[1] - from[1])
  const dx = (tip[0] - from[0]) / len
  const dy = (tip[1] - from[1]) / len
  const bx = tip[0] - dx * HEAD_LEN
  const by = tip[1] - dy * HEAD_LEN
  return `M${bx - dy * HEAD_HALF} ${by + dx * HEAD_HALF} L${tip[0]} ${tip[1]} L${bx + dy * HEAD_HALF} ${by - dx * HEAD_HALF}`
}
const heads = connectors.flatMap(c => [
  { key: `${c.id}-p`, d: chevron(c.p, c.q), toward: -1, c },
  { key: `${c.id}-q`, d: chevron(c.q, c.p), toward: 1, c },
]).map((h) => {
  const hits = segments.map(g => ({ g, dir: travels(g, h.c.p, h.c.q) })).filter(x => x.dir !== 0)
  const one = (name: string, g: Seg) => `${name} ${(g.dur + HEAD_HOLD).toFixed(2)}s linear ${g.start.toFixed(2)}s`
  // "Dim" first, "lit" last: when both run at once (two pulses passing in
  // opposite directions) the later animation wins, so both heads stay lit.
  const dim = hits.filter(x => x.dir !== h.toward).map(x => one('arch-head-dim', x.g))
  const lit = hits.filter(x => x.dir === h.toward).map(x => one(`arch-head-${x.g.tone}`, x.g))
  return { key: h.key, d: h.d, animation: [...dim, ...lit].join(', ') }
})

// The engine box pulses a whole number of times between `train` and `trainEnd`.
const busyLen = at.trainEnd - at.train
const busyBeats = Math.round(busyLen / 0.7)

const sec = (n: number) => `${n.toFixed(2)}s`
// All timings as CSS variables on the root, e.g. --t-role: 0.38s
const timing: Record<string, string> = { '--busy-beat': sec(busyLen / busyBeats), '--busy-beats': String(busyBeats) }
for (const [k, v] of Object.entries(at))
  timing[`--t-${k}`] = sec(v)
// Labels that disappear again: how long each stays.
timing['--len-ask'] = sec(at.shown - at.ask)
timing['--len-train'] = sec(at.trainEnd - at.train + 0.3)

// ----- Model dots -----
// The dots are a component with a `states` prop, so they are driven from here
// with timers instead of CSS delays. The timers start at the same moment the
// CSS animations do: when step 1 is reached on the visible slide.
const dotStates = reactive<Record<string, ModelState>>({})
let timers: ReturnType<typeof setTimeout>[] = []
function resetDots(state: ModelState) {
  timers.forEach(clearTimeout)
  timers = []
  for (const m of models)
    dotStates[m] = state
}
const isActive = useIsSlideActive()
const { isPrintMode } = useNav()
watch(
  () => isActive.value && props.step >= 1,
  (playing) => {
    // PDF export has no animation: show the end state straight away.
    if (isPrintMode.value) {
      resetDots(props.step >= 1 ? 'ok' : 'idle')
      return
    }
    resetDots('idle') // also resets when the slide is left or re-entered
    if (playing) {
      models.forEach((m, k) => {
        timers.push(setTimeout(() => (dotStates[m] = 'ok'), (at.train + (k + 1) * DOT_GAP) * 1000))
      })
    }
  },
  { immediate: true },
)
onUnmounted(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="tiers" :class="{ play: step >= 1, why: step >= 2 }" :style="{ width: px(W), height: px(H), ...timing }">
    <!-- Static connections between the tiers -->
    <svg class="wires" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
      <line v-for="c in connectors" :key="c.id" :x1="c.p[0]" :y1="c.p[1]" :x2="c.q[0]" :y2="c.q[1]" />
      <!-- Arrowheads: neutral at rest, animated from the pulse timeline at step 1 -->
      <path v-for="h in heads" :key="h.key" :d="h.d" class="head" :style="step >= 1 ? { animation: h.animation } : {}" />
    </svg>

    <!-- Client tier -->
    <div class="tier" :style="{ top: 0, height: px(CLIENT_H) }">
      <span class="tier-label"><strong>CLIENT</strong> · Angular</span>
      <span class="tier-aside">
        <svg viewBox="0 0 24 24" class="aside-icon" aria-hidden="true">
          <path d="M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3" />
        </svg>
        role-based login
      </span>
    </div>
    <div
      v-for="(t, i) in tiles"
      :key="t.id"
      class="tile"
      :class="t.id"
      :style="{ left: px(colX(i) - TILE_W / 2), top: px(TILE_Y), width: px(TILE_W), height: px(TILE_H) }"
    >
      <svg viewBox="0 0 24 24" class="flat-icon" aria-hidden="true">
        <path :d="stationIcons[t.id]" />
      </svg>
      {{ t.name }}
    </div>

    <!-- Server tier -->
    <div class="tier" :style="{ top: px(SERVER_Y), height: px(SERVER_H) }">
      <span class="tier-label"><strong>SERVER</strong></span>
    </div>

    <!-- Central Webservice -->
    <div class="service web" :style="{ left: px(boxX[0]), top: px(BOX_Y), width: px(BOX_W[0]), height: px(BOX_H) }">
      <div class="service-name">
        Central Webservice
      </div>
      <div class="service-tech">
        Java · Quarkus
      </div>
      <ul class="web-does">
        <li v-for="d in webDoes" :key="d.label">
          <svg viewBox="0 0 24 24" class="does-icon" aria-hidden="true"><path :d="d.icon" /></svg>
          {{ d.label }}
        </li>
      </ul>
    </div>

    <!-- Analytical Engine: the larger, accented box -->
    <div class="service engine" :style="{ left: px(boxX[1]), top: px(BOX_Y), width: px(BOX_W[1]), height: px(BOX_H) }">
      <div class="service-name">
        Analytical Engine
      </div>
      <div class="service-tech">
        Python 3.12 · FastAPI
      </div>
      <ModelDots class="engine-models" :models="models" :states="dotStates" />
    </div>

    <span
      v-for="(w, i) in whys"
      :key="w"
      class="deck-chip why-chip"
      :style="{ left: px(boxCx[i]), top: px(CHIP_Y) }"
    >{{ w }}</span>

    <!-- Connector labels -->
    <span class="wire-label" :style="{ left: px(boxCx[0] + 12), top: px(CLIENT_H + 7) }">HTTPS · JSON · single entry point</span>
    <span class="wire-label mid" :style="{ left: px((REST_X[0] + REST_X[1]) / 2), top: px(REST_Y - 23) }">internal REST</span>
    <span class="wire-label mid" :style="{ left: px((REST_X[0] + REST_X[1]) / 2), top: px(REST_Y + 8) }">job hand-off</span>
    <span v-for="x in boxCx" :key="x" class="wire-label" :style="{ left: px(x + 12), top: px(SERVER_Y + SERVER_H + 3) }">SQL</span>

    <!-- Request-path labels (step 1). TODO(João): review wording -->
    <span class="flow-label brief end" :style="{ 'left': px(boxCx[0] - 13), 'top': px(CLIENT_H + 6), '--d': 'var(--t-ask)', '--len': 'var(--len-ask)' }">Run training</span>
    <span class="flow-label end" :style="{ 'left': px(boxCx[0] - 13), 'top': px(CLIENT_H + 6), '--d': 'var(--t-shown)' }">results shown</span>
    <span class="flow-label" :style="{ 'left': px(boxCx[0] + 12), 'top': px(SERVER_Y + 7), '--d': 'var(--t-role)' }">role checked</span>
    <span class="flow-label end" :style="{ 'left': px(boxCx[0] - 13), 'top': px(SERVER_Y + SERVER_H + 2), '--d': 'var(--t-history)' }">history loaded</span>
    <span class="flow-label brief end" :style="{ 'left': px(boxX[1] + BOX_W[1] - 14), 'top': px(BOX_Y + 14), '--d': 'var(--t-train)', '--len': 'var(--len-train)' }">training…</span>
    <span class="flow-label end" :style="{ 'left': px(boxCx[1] - 13), 'top': px(SERVER_Y + SERVER_H + 2), '--d': 'var(--t-written)' }">results written</span>
    <span class="flow-label other" :style="{ 'left': px(colX(1) - 6), 'top': px(CLIENT_H + 6), '--d': 'var(--t-answered)' }">answered immediately</span>

    <!-- Request-path dots -->
    <svg class="pulses" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
      <circle
        v-for="(g, k) in segments"
        :key="k"
        r="6"
        class="dot"
        :class="g.tone"
        :style="{
          '--x1': px(g.x1),
          '--y1': px(g.y1),
          '--x2': px(g.x2),
          '--y2': px(g.y2),
          '--d': sec(g.start),
          '--dur': sec(g.dur),
        }"
      />
    </svg>

    <!-- Database: same band as slide 6 -->
    <div class="db-band" :style="{ top: px(BAND_Y), height: px(BAND_H) }">
      <span><strong>CENTRAL DATABASE</strong> · single source of truth</span>
      <span class="db-items">{{ stored.join(' · ') }}</span>
    </div>
  </div>
</template>

<style scoped>
.tiers {
  position: relative;
  font-size: 14px;
  line-height: 1.3;
}
.tiers > * {
  position: absolute;
}

/* ---------- Tiers ---------- */
.tier {
  left: 0;
  width: 100%;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--c-surface) 55%, transparent);
}
.tier-label,
.tier-aside {
  position: absolute;
  top: 5px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}
.tier-label {
  left: 14px;
}
.tier-label strong {
  color: var(--c-text);
  font-weight: 600;
}
.tier-aside {
  right: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  letter-spacing: 0;
}
.aside-icon {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linejoin: round;
}

/* ---------- Client tiles ---------- */
.tile {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid var(--c-line);
  border-radius: 8px;
  background: var(--c-surface);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
}
.flat-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ---------- Server boxes ---------- */
.service {
  padding: 11px 12px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.service-name {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
}
.service-tech {
  margin-top: 2px;
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 12px;
}
/* The engine is where the thesis work lives, so it carries the accent. */
.engine {
  border: 2px solid var(--c-accent);
}

/* Webservice: 2 × 2 grid of icon + label */
.web-does {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 10px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  font-size: 13px;
}
.web-does li {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  list-style: none;
  white-space: nowrap;
}
.does-icon {
  width: 17px;
  height: 17px;
  flex: none;
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Engine: the six model dots (see ModelDots.vue) */
.engine-models {
  margin-top: 15px;
}

/* Connector labels */
.wire-label {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.4;
  white-space: nowrap;
}
.wire-label.mid {
  translate: -50% 0;
}

/* "Why" chips keep their place from the start and only fade in (step 2). */
.why-chip {
  translate: -50% 0;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.why .why-chip {
  opacity: 1;
}

/* ---------- Wires ---------- */
.wires {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}
.head {
  transform-box: fill-box;
  transform-origin: center;
}

/* ---------- Database band (copied from FactoryFloor's .band) ---------- */
.db-band {
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border: 1.5px solid var(--c-accent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--c-accent) 8%, var(--c-surface));
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}
.db-band strong {
  color: var(--c-accent);
  font-weight: 600;
}
.db-items {
  letter-spacing: 0;
}

/* ---------- Request path (step 1) ----------
   Adding `play` starts every animation below at the same instant; each one
   then waits its own delay, taken from the --t-… variables set in the script. */
.pulses {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
/* No fill mode: a dot is invisible before and after its own run. */
.dot {
  fill: var(--c-accent);
  opacity: 0;
  filter: drop-shadow(0 0 4px var(--c-accent));
}
.dot.other {
  fill: var(--c-warn);
  filter: drop-shadow(0 0 4px var(--c-warn));
}
.play .dot {
  animation: travel var(--dur) linear var(--d);
}
@keyframes travel {
  from { translate: var(--x1) var(--y1); opacity: 1; }
  to { translate: var(--x2) var(--y2); opacity: 1; }
}

.flow-label {
  color: var(--c-accent);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  opacity: 0;
}
.flow-label.other {
  color: var(--c-warn);
}
.flow-label.end {
  translate: -100% 0; /* right-aligned: ends at `left` */
}
.flow-label.mid {
  translate: -50% 0;
}
.play .flow-label {
  opacity: 1;
  animation: label-in 0.35s ease var(--d) backwards;
}
/* A brief label fades in, stays for --len, and fades out again. */
.play .flow-label.brief {
  opacity: 0;
  animation: label-brief var(--len) linear var(--d) backwards;
}
@keyframes label-in {
  from { opacity: 0; }
}
@keyframes label-brief {
  0% { opacity: 0; }
  8%, 92% { opacity: 1; }
  100% { opacity: 0; }
}

/* Boxes react when a dot reaches them. One element can run several
   animations, each with its own delay. */
.play .tile.office {
  animation: hit 0.6s ease var(--t-ask), hit 0.6s ease var(--t-shown);
}
.play .tile.dock {
  animation: hit-other 0.6s ease var(--t-dockAsk), hit-other 0.6s ease var(--t-answered);
}
.play .web {
  animation: hit 0.6s ease var(--t-role), hit-other 0.6s ease var(--t-webOther), hit 0.6s ease var(--t-webBack);
}
.play .db-band {
  animation: hit 0.6s ease var(--t-history), hit 0.6s ease var(--t-written);
}
.play .engine {
  animation: busy var(--busy-beat) ease-in-out var(--t-train) var(--busy-beats);
}
@keyframes hit {
  30% {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-accent) 25%, transparent);
  }
}
@keyframes hit-other {
  30% {
    border-color: var(--c-warn);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-warn) 25%, transparent);
  }
}
@keyframes busy {
  50% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--c-accent) 28%, transparent);
  }
}

@media print, (prefers-reduced-motion: reduce) {
  .tiers * {
    animation: none !important;
    transition: none !important;
  }
}
</style>

<!-- Not scoped: the arrowhead animations are assigned from the script as inline
     styles, and Vue renames keyframes inside scoped styles, so they must keep
     their plain names. Identical 0% and 100% = hold this look for the whole run. -->
<style>
@keyframes arch-head-req {
  0%, 100% { stroke: var(--c-accent); stroke-width: 2.500; scale: 1.3; opacity: 1; }
}
@keyframes arch-head-other {
  0%, 100% { stroke: var(--c-warn); stroke-width: 2.500; scale: 1.3; opacity: 1; }
}
@keyframes arch-head-dim {
  0%, 100% { opacity: 0.25; }
}
</style>
