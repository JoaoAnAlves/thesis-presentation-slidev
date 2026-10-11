<!--
The four pipeline stages as cards, each with what goes in and what comes out.

  step 0   everything visible: an IN row (what each stage takes from outside),
           the four cards, and an OUT row
  step 1   a data token travels the pipeline: IN → card → OUT for each stage,
           then along the arrow to the next card
  step 2   the whole flow shrinks into the top-right corner and becomes the
           PipelineTracker used through Acts 3 and 4, while a closing line
           fades in

Usage:  <PipelineFlow :step="$clicks" />

The layout is fixed (known px positions), so the token can use the same
coordinates as the cards.
-->
<script setup lang="ts">
import { useIsSlideActive, useNav } from '@slidev/client'
import { nextTick, onMounted, ref, watch } from 'vue'
import type { SparkKind } from './MiniSpark.vue'
import type { Stage } from './StageIcon.vue'

const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// ----- Tune the token animation here -----
const SPEED = 272 // px per second the token travels
const DWELL = 1 // seconds the token waits at each stage's output
const PROCESS = 0.35 // seconds the token spends "inside" a stage card

// TODO(João): review wording (all labels below)
type IconId = 'clock' | 'person' | 'list'
interface StageDef {
  id: Stage
  name: string
  arrow?: string // label on the arrow that leads INTO this stage
  // What the stage takes from outside the pipeline: a drawing or an icon,
  // one line of text, and an optional muted second line.
  in: { spark?: SparkKind, icon?: IconId, text: string, sub?: string, subIcons?: IconId[] }
  out: { spark: SparkKind, text: string }
}
const stages: StageDef[] = [
  {
    id: 'train',
    name: 'Train',
    in: { spark: 'sales', text: 'sales history', sub: 'manager or timer', subIcons: ['clock', 'person'] },
    out: { spark: 'six', text: '6 forecasts + error per model' },
  },
  {
    id: 'refine',
    name: 'Refine',
    arrow: 'runs\nautomatically',
    in: { icon: 'person', text: 'manager\'s weights', sub: '(optional)' },
    out: { spark: 'band', text: '1 forecast + 90% band' },
  },
  {
    id: 'plan',
    name: 'Plan',
    in: { icon: 'list', text: 'recipes · stock lots · lead times' },
    out: { spark: 'table', text: 'raw materials · FEFO · alerts' },
  },
  {
    id: 'scenario',
    name: 'Scenario',
    arrow: 'on request',
    in: { spark: 'crisis', text: 'crisis reference', sub: 'e.g. Ukraine 2022' },
    out: { spark: 'adjusted', text: 'adjusted plan' },
  },
]
const icons: Record<IconId, string> = {
  person: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.400 3.600-8 8-8s8 3.600 8 8',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  list: 'M9 6h11M9 12h11M9 18h11M4 6h.010M4 12h.010M4 18h.010',
}

// ----- Geometry (px) -----
// A gutter on the left holds the row labels; the rest is four equal columns.
// Everything stays inside W, which is the slide's content width.
const W = 868
const GUTTER = 84
const PITCH = (W - GUTTER) / stages.length // column width = distance between two cards
const CARD_W = 124
const CARD_H = 104
const IO_W = PITCH - 8 // width of the IN / OUT block in a column
const SPARK_H = 34
const IN_H = 76 // drawing (34) + up to two lines of text
const LINK = 28 // the short down-arrows
const CARD_Y = IN_H + LINK
const OUT_Y = CARD_Y + CARD_H + LINK
const H = OUT_Y + 74

const cx = (k: number) => GUTTER + PITCH / 2 + k * PITCH // centre of column k
const cardX = (k: number) => cx(k) - CARD_W / 2 // left edge of card k
const CARD_CY = CARD_Y + CARD_H / 2
const px = (n: number) => `${n}px`

// ----- Token path (step 1) -----
// Same approach as slide 7: `run` lays straight segments end to end at one
// speed and returns the finish time; every later time is built from that.
type Pt = [number, number]
interface Seg { x1: number, y1: number, x2: number, y2: number, start: number, dur: number }
const segments: Seg[] = []
function run(t: number, pts: Pt[]) {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1]
    const [x2, y2] = pts[i]
    const dur = Math.hypot(x2 - x1, y2 - y1) / SPEED
    segments.push({ x1, y1, x2, y2, start: t, dur })
    t += dur
  }
  return t
}
const inAt: number[] = [] // when the token leaves input k (the input pulses)
const cardAt: number[] = [] // when the token reaches card k (the card flashes)
const outAt: number[] = [] // when it lands on output k (the drawing pops)

// Travel time of the short hop from an IN block down into its card.
const IN_HOP = LINK / SPEED

let t = 0
stages.forEach((_, k) => {
  if (k === 0) {
    t = IN_HOP // Train has nothing before it: only its input arrives
  }
  else {
    // Along the arrow from the previous card.
    t = run(t, [[cardX(k - 1) + CARD_W, CARD_CY], [cardX(k), CARD_CY]])
  }
  // The stage's own input drops in from above, timed to ARRIVE at the same
  // moment (so it starts one hop earlier).
  inAt[k] = t - IN_HOP
  run(inAt[k], [[cx(k), IN_H], [cx(k), CARD_Y]])
  cardAt[k] = t
  // Down to this stage's output.
  t = run(t + PROCESS, [[cx(k), CARD_Y + CARD_H], [cx(k), OUT_Y + SPARK_H / 2]])
  outAt[k] = t
  t += DWELL
})
const sec = (n: number) => `${n.toFixed(2)}s`

// ----- Shrink into the corner (step 2) -----
// The tracker is already on the slide, invisible, in its final place. We
// measure where its first and last dots are and where the first and last
// cards are, and work out the one scale + move that puts the cards on the
// dots. CSS then animates to that transform.
const { isPrintMode } = useNav()
const isActive = useIsSlideActive()
const root = ref<HTMLElement>()
const body = ref<HTMLElement>()
const dockTransform = ref('')
// The PDF keeps the full flow: a page showing only the tracker would say nothing.
const docked = () => props.step >= 2 && !isPrintMode.value

function measureDock() {
  const el = root.value
  const cards = body.value?.querySelectorAll<HTMLElement>('.stage-card')
  const dots = el?.querySelectorAll<HTMLElement>('.pt-dot')
  if (!el || !cards?.length || !dots?.length)
    return
  const box = el.getBoundingClientRect()
  if (!box.width)
    return // slide not visible: nothing to measure, the fade still works
  // Slidev scales the whole slide to fit the window. `zoom` converts screen
  // px (what getBoundingClientRect returns) back into slide px.
  const zoom = box.width / el.offsetWidth
  const dotCentre = (d: HTMLElement) => {
    const r = d.getBoundingClientRect()
    return { x: (r.left + r.width / 2 - box.left) / zoom, y: (r.top + r.height / 2 - box.top) / zoom }
  }
  const d0 = dotCentre(dots[0])
  const d3 = dotCentre(dots[dots.length - 1])
  const scale = (d3.x - d0.x) / ((stages.length - 1) * PITCH)
  // With transform-origin at the top-left corner, a point (x, y) ends up at
  // (tx + scale·x, ty + scale·y). Solve for the first card's centre → first dot.
  const tx = d0.x - scale * cx(0)
  const ty = d0.y - scale * CARD_CY
  dockTransform.value = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${scale.toFixed(4)})`
}
watch(() => [props.step, isActive.value], () => nextTick(measureDock))
onMounted(measureDock)
</script>

<template>
  <div ref="root" class="pipe" :class="{ play: step >= 1, docked: docked() }" :style="{ width: px(W), height: px(H) }">
    <div ref="body" class="pipe-body" :style="{ transform: docked() ? dockTransform : 'none' }">
      <!-- Row labels -->
      <span class="row-label detail" :style="{ left: 0, top: px(8) }"><strong>IN</strong><br>from outside</span>
      <span class="row-label detail" :style="{ left: 0, top: px(OUT_Y + 10) }"><strong>OUT</strong></span>

      <!-- Arrows: card → card, and the short ones IN → card → OUT -->
      <svg class="arrows" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
        <g v-for="k in stages.length - 1" :key="k" :class="{ dashed: stages[k].id === 'scenario' }">
          <line :x1="cardX(k - 1) + CARD_W + 8" :y1="CARD_CY" :x2="cardX(k) - 9" :y2="CARD_CY" />
          <path :d="`M${cardX(k) - 16} ${CARD_CY - 6} l8 6 l-8 6`" />
        </g>
        <g v-for="(s, k) in stages" :key="s.id" class="detail">
          <path :d="`M${cx(k)} ${IN_H + 3} V${CARD_Y - 5} m-5 -6 l5 6 l5 -6`" />
          <path :d="`M${cx(k)} ${CARD_Y + CARD_H + 4} V${OUT_Y - 4} m-5 -6 l5 6 l5 -6`" />
        </g>
      </svg>

      <template v-for="(s, k) in stages" :key="s.id">
        <!-- IN: from outside the pipeline -->
        <div class="io detail" :style="{ left: px(cx(k) - IO_W / 2), top: 0, width: px(IO_W), height: px(IN_H) }">
          <div class="io-visual in" :style="{ '--d': sec(inAt[k]) }">
            <MiniSpark v-if="s.in.spark" :kind="s.in.spark" />
            <svg v-else-if="s.in.icon" viewBox="0 0 24 24" class="in-icon" aria-hidden="true"><path :d="icons[s.in.icon]" /></svg>
          </div>
          <p>{{ s.in.text }}</p>
          <p v-if="s.in.sub" class="io-sub">
            <svg v-for="i in s.in.subIcons" :key="i" viewBox="0 0 24 24" class="sub-icon" aria-hidden="true"><path :d="icons[i]" /></svg>
            {{ s.in.sub }}
          </p>
        </div>

        <!-- Label on the arrow into this card -->
        <span v-if="s.arrow" class="arrow-label detail" :style="{ left: px(cx(k) - PITCH / 2), top: px(CARD_CY - 7) }">{{ s.arrow }}</span>

        <!-- Card -->
        <div
          class="stage-card"
          :class="s.id"
          :style="{ 'left': px(cardX(k)), 'top': px(CARD_Y), 'width': px(CARD_W), 'height': px(CARD_H), '--d': sec(cardAt[k]) }"
        >
          <StageIcon :stage="s.id" class="card-icon" />
          <span class="card-name">{{ s.name }}</span>
        </div>

        <!-- OUT -->
        <div class="io detail" :style="{ left: px(cx(k) - IO_W / 2), top: px(OUT_Y), width: px(IO_W) }">
          <div class="io-visual out" :style="{ '--d': sec(outAt[k]) }">
            <MiniSpark :kind="s.out.spark" />
          </div>
          <p>{{ s.out.text }}</p>
        </div>
      </template>

      <!-- The token -->
      <svg class="token-svg" :viewBox="`0 0 ${W} ${H}`" aria-hidden="true">
        <circle
          v-for="(g, k) in segments"
          :key="k"
          r="7"
          class="token"
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
    </div>

    <!-- The real tracker, in its final place from the start; visible at step 2 -->
    <PipelineTracker class="dock-target" />

    <!-- Closing line, so the slide is not empty after the shrink -->
    <!-- TODO(João): review wording -->
    <p class="dock-line">
      Let's follow one product through it.
    </p>
  </div>
</template>

<style scoped>
/* Not positioned on purpose: the tracker inside must place itself against the
   slide, not against this box. */
.pipe {
  margin-top: 44px;
  font-size: 13.5px;
  line-height: 1.3;
}
.pipe-body {
  position: relative;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  transition: transform 0.9s cubic-bezier(0.6, 0, 0.2, 1), opacity 0.3s ease;
}
.pipe-body > * {
  position: absolute;
}

/* ---------- Arrows ---------- */
.arrows,
.token-svg {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.arrows {
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.arrows .dashed line {
  stroke-dasharray: 5 5;
}
.arrow-label {
  translate: -50% -100%; /* sits just above the arrow, centred on the gap */
  color: var(--c-muted);
  font-size: 10.5px;
  line-height: 1.2;
  text-align: center;
  white-space: pre-line;
}

/* ---------- Row labels ---------- */
.row-label {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10.5px;
  line-height: 1.35;
}
.row-label strong {
  color: var(--c-text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
}

/* ---------- Cards ---------- */
.stage-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.stage-card.scenario {
  border-style: dashed;
  border-color: var(--c-muted);
}
.card-icon {
  width: 48px;
  height: 48px;
}
.card-name {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* ---------- In / out ---------- */
.io {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-size: 13px;
}
.io p {
  margin: 3px 0 0;
  line-height: 1.3;
}
.io .io-sub {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 1px;
  color: var(--c-muted);
  font-size: 11.5px;
}
.sub-icon {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}
/* Fixed slot, so a drawing and an icon take the same space. */
.io-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  flex: none;
}
.in-icon {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.8;
  stroke-linecap: round;
}

/* ---------- Token (step 1) ----------
   Adding `play` starts everything; each element waits its own delay (--d). */
.token {
  fill: var(--c-accent);
  opacity: 0;
  filter: drop-shadow(0 0 5px var(--c-accent));
}
.play .token {
  animation: travel var(--dur) linear var(--d);
}
@keyframes travel {
  from { translate: var(--x1) var(--y1); opacity: 1; }
  to { translate: var(--x2) var(--y2); opacity: 1; }
}
/* A card flashes when the token reaches it. */
.play .stage-card {
  animation: card-hit 0.7s ease var(--d);
}
@keyframes card-hit {
  30% {
    border-color: var(--c-accent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-accent) 25%, transparent);
  }
}
/* An input drawing pulses when its stage starts. */
.play .io-visual.in {
  animation: spark-pulse 0.5s ease var(--d);
}
@keyframes spark-pulse {
  50% { scale: 1.18; }
}
/* An output drawing waits dimmed (first animation, lasts until the token
   lands), then grows out of the token (second animation, starts at --d). */
.play .io-visual.out {
  animation: spark-wait var(--d) linear, spark-pop 0.5s ease var(--d);
}
@keyframes spark-wait {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}
@keyframes spark-pop {
  0% { opacity: 0.2; scale: 0.2; }
  60% { opacity: 1; scale: 1.18; }
  100% { scale: 1; }
}

/* ---------- Shrink into the corner (step 2) ----------
   The transform itself is set from the script (see measureDock). Here: the
   small print fades first, the shrunken cards fade last, and the real tracker
   fades in on top of them. */
.detail {
  transition: opacity 0.3s ease;
}
.docked .detail {
  opacity: 0;
}
.docked .pipe-body {
  opacity: 0;
  pointer-events: none;
  transition: transform 0.9s cubic-bezier(0.6, 0, 0.2, 1), opacity 0.3s ease 0.7s;
}
.dock-target {
  opacity: 0;
  transition: opacity 0.25s ease;
}
/* Centred on the slide (this box is not positioned, so the slide is the reference). */
.dock-line {
  position: absolute;
  top: 44%;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 720px;
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s ease;
}
.docked .dock-line {
  opacity: 1;
  transition: opacity 0.6s ease 0.35s;
}
.docked .dock-target {
  opacity: 1;
  transition: opacity 0.3s ease 0.7s;
}

@media print, (prefers-reduced-motion: reduce) {
  .pipe * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
