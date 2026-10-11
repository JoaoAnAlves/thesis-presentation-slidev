<!--
Animated hero for the cover and closing slides: an "MRP" hexagon with an "AI"
ring, surrounded by five pipeline nodes on a closed ring. A pulse travels the
ring forever; each node lights up and plays a short animation as it passes.

Usage:  <HeroLoop />                                   icons only (cover)
        <HeroLoop labeled />                           label under each node (closing)
        <HeroLoop mode="blueprint" />                  dashed technical drawing, draws in once
        <HeroLoop mode="stress" />                     live loop + an amber shockwave each cycle
        <HeroLoop :focus="['data', 'models']" />       the other nodes are dimmed
        <HeroLoop labeled :label-opacity="0.4" />      faint labels

Everything is CSS/SVG animation. There are no JS timers: all animations share
one duration (--loop) and are lined up with negative animation-delays.
-->
<script setup lang="ts">
import { useIsSlideActive, useNav, useSlideContext } from '@slidev/client'
import { computed } from 'vue'

type NodeId = 'data' | 'models' | 'forecast' | 'plan' | 'factory'

const props = withDefaults(defineProps<{
  /** live = animated loop, blueprint = dashed drawing, stress = live + shockwave */
  mode?: 'live' | 'blueprint' | 'stress'
  /** Node ids to keep at full strength; the rest are dimmed. Empty = all normal. */
  focus?: NodeId[]
  /** Show a label under each node */
  labeled?: boolean
  /** Opacity of those labels (0 to 1) */
  labelOpacity?: number
  /** Move the labels that would sit on a wire (Data, Train, Factory) clear of it */
  labelsAside?: boolean
}>(), {
  mode: 'live',
  focus: () => [],
  labeled: false,
  labelOpacity: 1,
  labelsAside: false,
})

// ----- Geometry (SVG user units) -----
const W = 440
const H = 552
const CX = 220
const CY = 264
const RING = 158 // radius of the ring the nodes sit on
const NODE = 34 // radius of a node hexagon
const CORE = 44 // radius of the centre "MRP" hexagon
const AI_RING = 64 // radius of the thin "AI" ring

// Flat-top hexagon of radius r centred on (0, 0), as an SVG points string.
function hex(r: number) {
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k
    return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

// Five nodes, clockwise from the top. `i` is the node's place on the ring and
// is what the CSS uses to compute its animation-delay.
const names: NodeId[] = ['data', 'models', 'forecast', 'plan', 'factory']
const labels = ['Data', 'Train', 'Refine', 'Plan', 'Factory']
const nodes = names.map((id, i) => {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / names.length
  return {
    id,
    i,
    label: labels[i],
    x: CX + RING * Math.cos(angle),
    y: CY + RING * Math.sin(angle),
    // Where the spoke from the centre starts and ends.
    sx: CX + AI_RING * Math.cos(angle),
    sy: CY + AI_RING * Math.sin(angle),
    ex: CX + (RING - NODE) * Math.cos(angle),
    ey: CY + (RING - NODE) * Math.sin(angle),
  }
})

// Models icon: six dots on a small circle. dx/dy is the move that brings each to the centre.
const dots = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 3) * k + Math.PI / 6
  const x = 13 * Math.cos(a)
  const y = 13 * Math.sin(a)
  return { x, y, dx: `${-x}px`, dy: `${-y}px` }
})

// Pulse: three dashes of different lengths drawn on the ring (pathLength = 100),
// stacked so they share one head. A <circle> path starts at 3 o'clock, and a dash
// of length L ends L% further on, so each is rotated back to put its head at the top.
const pulse = [
  { len: 14, cls: 'tail' },
  { len: 7, cls: 'mid' },
  { len: 1.6, cls: 'head' },
].map(p => ({ ...p, rotate: -90 - p.len * 3.6 }))

// ----- focus: a node is "off" when a focus list is given and it is not in it -----
const isOff = (id: NodeId) => props.focus.length > 0 && !props.focus.includes(id)
const isFocused = (id: NodeId) => props.focus.length > 0 && props.focus.includes(id)

// ----- labels -----
// Default: centred under the node. With `labelsAside`, the three labels that
// would touch a wire move: Data goes up and to the right (clear of its spoke
// and of the ring), Train and Factory are pushed to the inside of the ring.
const below = { x: 0, y: NODE + 17, anchor: 'middle' }
const aside: Partial<Record<NodeId, typeof below>> = {
  data: { x: 30, y: -18, anchor: 'start' },
  models: { x: 0, y: NODE + 17, anchor: 'end' },
  factory: { x: 0, y: NODE + 17, anchor: 'start' },
}
const labelPos = (id: NodeId) => (props.labelsAside && aside[id]) || below

// ----- slide active state -----
// True while the slide this component sits on is the current slide. The stress
// shockwave is only attached while active, so it restarts on every entry.
const isActive = useIsSlideActive()

// ----- blueprint: the same geometry, redrawn as plain outlines -----
// Every outline becomes a path string plus its length in SVG units. The length
// is needed to build a dash pattern that can also draw itself in (see `dashes`).
function circlePath(cx: number, cy: number, r: number) {
  return `M${cx - r},${cy} a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 ${-2 * r},0`
}
function hexPath(cx: number, cy: number, r: number) {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  })
  return `M${pts.join(' L')} Z`
}
const outlines = [
  { d: circlePath(CX, CY, RING), len: 2 * Math.PI * RING },
  { d: circlePath(CX, CY, AI_RING), len: 2 * Math.PI * AI_RING },
  { d: hexPath(CX, CY, CORE), len: 6 * CORE },
  ...nodes.map(n => ({ d: hexPath(n.x, n.y, NODE), len: 6 * NODE })),
  ...nodes.map(n => ({
    d: `M${n.sx.toFixed(1)},${n.sy.toFixed(1)} L${n.ex.toFixed(1)},${n.ey.toFixed(1)}`,
    len: RING - NODE - AI_RING,
  })),
].map(o => ({ ...o, len: Math.ceil(o.len) }))

// A dashed line that can draw itself in: "4 on, 3 off" repeated along the whole
// path, then one gap as long as the path. Shifting the pattern by the path
// length (stroke-dashoffset) shows only that gap; shifting back to 0 slides the
// dashes into view from the start of the path.
const DASH = 4
const GAP = 3
function dashes(len: number) {
  const repeats = Math.ceil(len / (DASH + GAP))
  return `${`${DASH} ${GAP} `.repeat(repeats)}0 ${len}`
}

// Construction marks: a centre cross, tick marks around the ring, and four
// short ticks plus a small dimension line at each node.
const marks = [
  `M${CX - 12},${CY} H${CX + 12} M${CX},${CY - 12} V${CY + 12}`,
  Array.from({ length: 30 }, (_, k) => {
    const a = (k * 2 * Math.PI) / 30
    const r0 = RING + 6
    const r1 = RING + (k % 5 === 0 ? 14 : 10)
    return `M${(CX + r0 * Math.cos(a)).toFixed(1)},${(CY + r0 * Math.sin(a)).toFixed(1)} L${(CX + r1 * Math.cos(a)).toFixed(1)},${(CY + r1 * Math.sin(a)).toFixed(1)}`
  }).join(' '),
  ...nodes.map((n) => {
    const x = n.x.toFixed(1)
    const y = n.y.toFixed(1)
    const d = NODE + 5
    const e = NODE + 12
    const top = n.y - NODE - 10
    return [
      `M${n.x - e},${y} H${n.x - d} M${n.x + d},${y} H${n.x + e}`, // left / right ticks
      `M${x},${n.y + d} V${n.y + e}`, // bottom tick
      `M${n.x - NODE},${top} H${n.x + NODE}`, // dimension line above the node
      `M${n.x - NODE},${top - 4} V${top + 4} M${n.x + NODE},${top - 4} V${top + 4}`, // its end ticks
    ].join(' ')
  }),
]

// Static frame (no motion) for PDF export and for thumbnails such as the overview.
const { isPrintMode } = useNav()
const { $renderContext } = useSlideContext()
const isStatic = computed(() =>
  isPrintMode.value || !['slide', 'presenter'].includes($renderContext.value),
)
</script>

<template>
  <!-- TODO(João): review wording (MRP / AI and the node labels) -->
  <svg
    class="hero-loop"
    :class="[`mode-${mode}`, { 'is-static': isStatic, 'is-active': isActive }]"
    :viewBox="`0 0 ${W} ${H}`"
    preserveAspectRatio="xMidYMid meet"
    :style="{ '--cx': `${CX}px`, '--cy': `${CY}px` }"
    aria-hidden="true"
  >
    <!-- Blueprint mode only: dashed outlines and construction marks that draw in once -->
    <g v-if="mode === 'blueprint'" class="blueprint">
      <path
        v-for="(o, k) in outlines"
        :key="`o${k}`"
        :d="o.d"
        class="bp-outline"
        :stroke-dasharray="dashes(o.len)"
        :style="{ '--len': `${o.len}px` }"
      />
      <path v-for="(d, k) in marks" :key="`m${k}`" :d="d" pathLength="1" class="mark" />
    </g>

    <!-- Stress mode only: amber ring that contracts from outside to the centre once per cycle -->
    <template v-if="mode === 'stress'">
      <circle class="shock" :cx="CX" :cy="CY" :r="RING" />
      <circle class="shock echo" :cx="CX" :cy="CY" :r="RING" />
    </template>

    <!-- Everything on the ring sits in one group so stress mode can wobble it as a whole. -->
    <g class="orbit">
      <!-- Faint circuit lines: the ring and one spoke per node -->
      <g class="wires">
        <circle :cx="CX" :cy="CY" :r="RING" />
        <g v-for="n in nodes" :key="n.id" :class="{ off: isOff(n.id) }">
          <line :x1="n.sx" :y1="n.sy" :x2="n.ex" :y2="n.ey" />
          <circle :cx="n.sx" :cy="n.sy" r="2.5" class="joint" />
        </g>
      </g>

      <!-- Travelling pulse -->
      <g v-if="mode !== 'blueprint'" class="pulse">
        <circle
          v-for="p in pulse"
          :key="p.cls"
          :class="p.cls"
          :cx="CX"
          :cy="CY"
          :r="RING"
          pathLength="100"
          :stroke-dasharray="`${p.len} ${100 - p.len}`"
          :transform="`rotate(${p.rotate} ${CX} ${CY})`"
        />
      </g>

      <!-- Nodes. `--i` is the node's index; the CSS turns it into an animation-delay. -->
      <g
        v-for="n in nodes"
        :key="n.id"
        class="node"
        :class="[n.id, { off: isOff(n.id), focused: isFocused(n.id) }]"
        :style="{ '--i': n.i }"
        :transform="`translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`"
      >
        <polygon :points="hex(NODE)" class="shell" />
        <polygon :points="hex(NODE)" class="shell-lit" />

        <g class="icon">
          <!-- Data: database cylinder + one bar that rises -->
          <template v-if="n.id === 'data'">
            <g class="db">
              <path d="M-17,-9 V9 A9,3.5 0 0 0 1,9 V-9" />
              <ellipse cx="-8" cy="-9" rx="9" ry="3.5" />
              <path d="M-17,0 A9,3.5 0 0 0 1,0" />
            </g>
            <rect class="bar" x="8" y="-12" width="7" height="24" rx="1.5" />
          </template>

          <!-- Models: six dots that converge into one -->
          <template v-else-if="n.id === 'models'">
            <circle
              v-for="(d, k) in dots"
              :key="k"
              class="dot"
              :cx="d.x.toFixed(1)"
              :cy="d.y.toFixed(1)"
              r="3.2"
              :style="{ '--dx': d.dx, '--dy': d.dy }"
            />
            <circle class="merged" r="5.5" />
          </template>

          <!-- Forecast: band + line that draws in -->
          <template v-else-if="n.id === 'forecast'">
            <path class="band" d="M-18,-1 L-8,-9 L0,-4 L9,-14 L18,-17 V-3 L9,0 L0,10 L-8,5 L-18,13 Z" />
            <path class="line-base" d="M-18,6 L-8,-2 L0,3 L9,-7 L18,-10" />
            <path class="line" pathLength="1" d="M-18,6 L-8,-2 L0,3 L9,-7 L18,-10" />
          </template>

          <!-- Plan: mini BOM tree that branches out level by level -->
          <template v-else-if="n.id === 'plan'">
            <g class="tree-base">
              <path d="M0,-11 L-10,0 M0,-11 L10,0 M-10,3 L-16,12 M-10,3 L-5,12 M10,3 L10,12" />
            </g>
            <rect class="root" x="-3.5" y="-17" width="7" height="7" rx="1.5" />
            <path class="branch l1" pathLength="1" d="M0,-11 L-10,0" />
            <path class="branch l1" pathLength="1" d="M0,-11 L10,0" />
            <rect class="leaf l1" x="-13" y="-3" width="6" height="6" rx="1.5" />
            <rect class="leaf l1" x="7" y="-3" width="6" height="6" rx="1.5" />
            <path class="branch l2" pathLength="1" d="M-10,3 L-16,12" />
            <path class="branch l2" pathLength="1" d="M-10,3 L-5,12" />
            <path class="branch l2" pathLength="1" d="M10,3 L10,12" />
            <rect class="leaf l2" x="-19" y="11" width="6" height="6" rx="1.5" />
            <rect class="leaf l2" x="-8" y="11" width="6" height="6" rx="1.5" />
            <rect class="leaf l2" x="7" y="11" width="6" height="6" rx="1.5" />
          </template>

          <!-- Factory: three stations that light up one after another. `--j` staggers them. -->
          <template v-else>
            <g v-for="j in 3" :key="j" class="station" :style="{ '--j': j - 1 }" :transform="`translate(${(j - 2) * 14} 0)`">
              <rect x="-5" y="-4" width="10" height="13" rx="1.5" />
              <path d="M-5,-4 L0,-10 L5,-4 Z" />
            </g>
          </template>
        </g>

        <text
          v-if="labeled"
          class="node-label"
          :x="labelPos(n.id).x"
          :y="labelPos(n.id).y"
          :text-anchor="labelPos(n.id).anchor"
          :style="{ opacity: labelOpacity }"
        >{{ n.label }}</text>
      </g>
    </g>

    <!-- Centre: MRP hexagon inside the AI ring -->
    <g :transform="`translate(${CX} ${CY})`" class="core">
      <circle :r="AI_RING" class="ai-ring" />
      <text class="ai-label" :x="AI_RING * 0.71" :y="-AI_RING * 0.71 + 4" text-anchor="middle">AI</text>
      <polygon :points="hex(CORE)" class="core-hex" />
      <text class="core-label" y="7" text-anchor="middle">MRP</text>
    </g>

  </svg>
</template>

<style scoped>
.hero-loop {
  /* One cycle = one lap of the pulse. Every animation below uses this duration. */
  --loop: 10s;
  display: block;
  width: 100%;
  height: 100%;
}

/* ---------- Static parts ---------- */
.wires circle,
.wires line {
  fill: none;
  stroke: var(--c-line);
  stroke-width: 1;
}
.wires .joint {
  fill: var(--c-line);
  stroke: none;
}

.ai-ring {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1.2;
}
.ai-label {
  fill: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  /* A background-coloured outline cuts a gap in the ring behind the letters. */
  paint-order: stroke;
  stroke: var(--c-bg);
  stroke-width: 8px;
}
.core-hex {
  fill: var(--c-surface);
  stroke: var(--c-text);
  stroke-width: 1.5;
}
.core-label {
  fill: var(--c-text);
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}

.shell {
  fill: var(--c-bg);
  stroke: var(--c-line);
  stroke-width: 1.2;
}
.shell-lit {
  fill: color-mix(in srgb, var(--tint) 12%, transparent);
  stroke: var(--tint);
  stroke-width: 1.5;
}
.node-label {
  fill: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  /* Same trick as the AI label: hides the wires that pass behind the text. */
  paint-order: stroke;
  stroke: var(--c-bg);
  stroke-width: 6px;
}

/* Each node's colour, from the shared tokens. */
.node.data {
  --tint: var(--chart-actual);
}
.node.models {
  --tint: var(--chart-model);
}
.node.forecast {
  --tint: var(--chart-forecast);
}
.node.plan {
  --tint: var(--c-accent);
}
.node.factory {
  --tint: var(--c-text);
}

/* Icons: stroke-only shapes by default. */
.icon * {
  fill: none;
  stroke: var(--tint);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.icon .bar,
.icon .dot,
.icon .merged,
.icon .leaf,
.icon .root,
.icon .station * {
  fill: var(--tint);
  stroke: none;
}
.icon .band {
  fill: color-mix(in srgb, var(--chart-forecast) 30%, transparent);
  stroke: none;
}
.icon .line {
  stroke-width: 2;
  stroke-dasharray: 1;
}
.icon .line-base,
.icon .tree-base {
  opacity: 0.5;
}
.icon .branch {
  stroke-dasharray: 1;
}
.icon .merged {
  opacity: 0;
}
.icon .bar {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.icon .merged {
  transform-box: fill-box;
  transform-origin: center;
}

/* Pulse dashes */
.pulse circle {
  fill: none;
  stroke: var(--c-accent);
  stroke-linecap: round;
}
.pulse .tail {
  stroke-width: 2;
  opacity: 0.25;
}
.pulse .mid {
  stroke-width: 3;
  opacity: 0.55;
}
.pulse .head {
  stroke: var(--c-text);
  stroke-width: 5;
  filter: drop-shadow(0 0 5px var(--c-accent));
}

/* ---------- Animation wiring ----------
   The rules above describe the STATIC frame: every node lit, every icon complete.
   The keyframes below take over while animating; their 0% and 100% are the dim
   resting state, so the wrap from 100% back to 0% changes nothing on screen.

   Timing: the pulse passes node i at i/5 of the cycle. A node's keyframes start
   (0%) at the moment the pulse arrives, so node i is shifted by i/5 of a cycle.
   The delay is written as (i/5 - 1) cycles: negative, so at page load the
   animation is already "in progress" instead of waiting for its first turn. */
.pulse circle {
  animation: pulse-travel var(--loop) linear infinite;
}

.node * {
  animation-duration: var(--loop);
  animation-iteration-count: infinite;
  animation-delay: calc(var(--loop) * (var(--i) / 5 + var(--j, 0) * 0.03 - 1));
}

.shell-lit {
  animation-name: lit;
}
.icon {
  animation-name: wake;
}
.bar {
  animation-name: bar-rise;
}
.dot {
  animation-name: dot-merge;
}
.merged {
  animation-name: merged;
}
.line {
  animation-name: draw;
}
.band {
  animation-name: band-in;
}
.branch.l1 {
  animation-name: branch-1;
}
.leaf.l1 {
  animation-name: leaf-1;
}
.branch.l2 {
  animation-name: branch-2;
}
.leaf.l2 {
  animation-name: leaf-2;
}
.station * {
  animation-name: station;
}

/* With --loop: 10s, 1% = 0.1 s. Each node's active window is roughly 0%-12%, then it settles by 20%. */
@keyframes pulse-travel {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -100; }
}

@keyframes lit {
  0% { opacity: 0; }
  2%, 12% { opacity: 1; }
  20%, 100% { opacity: 0; }
}
@keyframes wake {
  0% { opacity: 0.6; }
  2%, 12% { opacity: 1; }
  20%, 100% { opacity: 0.6; }
}

@keyframes bar-rise {
  0% { transform: scaleY(0.3); }
  9%, 13% { transform: scaleY(1); }
  20%, 100% { transform: scaleY(0.3); }
}

@keyframes dot-merge {
  0% { translate: 0 0; }
  8%, 12% { translate: var(--dx) var(--dy); }
  20%, 100% { translate: 0 0; }
}
@keyframes merged {
  0%, 6% { opacity: 0; scale: 0.4; }
  9%, 12% { opacity: 1; scale: 1; }
  17%, 100% { opacity: 0; scale: 0.4; }
}

/* Draw-in: the dash starts fully offset and transparent, slides to 0 (drawn),
   fades out, and only then snaps back to the offset. The snap happens at
   opacity 0, and 0% equals 100%, so nothing jumps. */
@keyframes draw {
  0% { stroke-dashoffset: 1; opacity: 0; }
  1% { opacity: 1; }
  9%, 14% { stroke-dashoffset: 0; opacity: 1; }
  20% { stroke-dashoffset: 0; opacity: 0; }
  20.01%, 100% { stroke-dashoffset: 1; opacity: 0; }
}
@keyframes band-in {
  0%, 4% { opacity: 0; }
  10%, 14% { opacity: 1; }
  20%, 100% { opacity: 0; }
}

@keyframes branch-1 {
  0% { stroke-dashoffset: 1; opacity: 0; }
  0.5% { opacity: 1; }
  4%, 14% { stroke-dashoffset: 0; opacity: 1; }
  20% { stroke-dashoffset: 0; opacity: 0; }
  20.01%, 100% { stroke-dashoffset: 1; opacity: 0; }
}
@keyframes leaf-1 {
  0%, 3.5% { opacity: 0; }
  5%, 14% { opacity: 1; }
  20%, 100% { opacity: 0; }
}
@keyframes branch-2 {
  0%, 5% { stroke-dashoffset: 1; opacity: 0; }
  5.5% { opacity: 1; }
  9%, 14% { stroke-dashoffset: 0; opacity: 1; }
  20% { stroke-dashoffset: 0; opacity: 0; }
  20.01%, 100% { stroke-dashoffset: 1; opacity: 0; }
}
@keyframes leaf-2 {
  0%, 8.5% { opacity: 0; }
  10%, 14% { opacity: 1; }
  20%, 100% { opacity: 0; }
}

@keyframes station {
  0% { opacity: 0.25; }
  1.5%, 11% { opacity: 1; }
  18%, 100% { opacity: 0.25; }
}

/* ---------- focus ----------
   Nodes outside the list (and their spokes) drop to 15%. Nodes in the list show
   their complete icon in full colour all the time: their icon animations are
   switched off, which leaves the finished static icon. Only their outline still
   reacts to the pulse, brightening from a steady 60% as it passes. */
.node.off,
.wires .off {
  opacity: 0.15;
}
.node.focused .icon,
.node.focused .icon * {
  animation: none;
}
.node.focused .shell-lit {
  animation-name: lit-focused;
}
@keyframes lit-focused {
  0% { opacity: 0.6; }
  2%, 12% { opacity: 1; }
  20%, 100% { opacity: 0.6; }
}

/* ---------- mode="blueprint" ----------
   The normal wires, shells and AI ring are hidden and the `.blueprint` group
   draws the same outlines as thin dashed strokes. Each outline's dash pattern
   ends in a gap as long as the path (built in `dashes()`), so animating
   stroke-dashoffset from the path length to 0 draws the dashes in. It runs
   once and holds: no `infinite`, and the resting value (0) is the drawn state. */
/* Named bp-outline, not outline: UnoCSS has a utility class called `outline` that would draw a box around each path. */
.bp-outline {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1;
  stroke-dashoffset: 0;
  animation: bp-draw 1.5s ease-in-out 0.2s both;
}
@keyframes bp-draw {
  from { stroke-dashoffset: var(--len); }
}
/* Construction marks are solid, so the plain "one dash as long as the path" trick is enough. */
.mark {
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 0.8;
  opacity: 0.55;
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  animation: bp-mark 1.5s ease-in-out 0.2s both;
}
@keyframes bp-mark {
  from { stroke-dashoffset: 1; }
}

.mode-blueprint .wires,
.mode-blueprint .shell,
.mode-blueprint .shell-lit,
.mode-blueprint .ai-ring {
  display: none;
}
.mode-blueprint .core-hex {
  fill: none;
  stroke: none;
}
.mode-blueprint .node {
  --tint: var(--c-accent); /* icons in one colour, like a drawing */
}
.mode-blueprint .node * {
  animation: none; /* nothing lights up */
}
/* Icons and text fade in once the outlines are mostly drawn, then hold. */
.mode-blueprint .icon {
  opacity: 0.55;
  animation: bp-fade 0.6s ease 1.2s both;
}
.mode-blueprint .core-label,
.mode-blueprint .ai-label,
.mode-blueprint .node-label {
  animation: bp-fade 0.6s ease 1.2s both;
}
@keyframes bp-fade {
  from { opacity: 0; }
}

/* ---------- mode="stress" ----------
   The live loop keeps running. On top of it, an amber ring contracts from
   outside to the centre and everything on the ring wobbles as it passes.

   These two animations exist only while the slide is the current one
   (`.is-active`, set from useIsSlideActive in the script). Adding the class
   starts them from the beginning, so the first shock always comes 0.5 s after
   the slide is entered (the delay), wherever the pulse happens to be. After
   that they repeat every --loop, so they keep the same spacing as the loop.
   Both rest (invisible / no transform) at 0% and 100%, and during the delay. */
.shock {
  fill: none;
  stroke: var(--c-warn);
  stroke-width: 3.5;
  vector-effect: non-scaling-stroke;
  opacity: 0;
  transform-box: view-box;
  transform-origin: var(--cx) var(--cy);
  filter: drop-shadow(0 0 6px var(--c-warn));
}
.shock.echo {
  stroke-width: 1.5;
}
.mode-stress.is-active .shock {
  animation: shock var(--loop) linear 0.5s infinite backwards;
}
.mode-stress.is-active .shock.echo {
  animation-delay: 0.7s;
}
@keyframes shock {
  0% { scale: 1.35; opacity: 0; }
  1.5%, 9% { opacity: 1; }
  13% { scale: 0.3; opacity: 0; }
  13.01%, 100% { scale: 1.35; opacity: 0; }
}

.mode-stress .orbit {
  transform-box: view-box;
  transform-origin: var(--cx) var(--cy);
}
.mode-stress.is-active .orbit {
  animation: wobble var(--loop) linear 0.5s infinite backwards;
}
@keyframes wobble {
  0%, 4% { transform: translate(0, 0) rotate(0deg); }
  5.5% { transform: translate(5px, -3px) rotate(1.2deg); }
  7.5% { transform: translate(-5px, 3px) rotate(-1deg); }
  9.5% { transform: translate(3px, 2px) rotate(0.6deg); }
  11.5% { transform: translate(-2px, -1px) rotate(-0.3deg); }
  14%, 100% { transform: translate(0, 0) rotate(0deg); }
}

/* ---------- Static frame: PDF export, thumbnails, reduced motion ----------
   Removing the animations leaves the base rules above: all nodes lit. */
.is-static *,
.is-static .pulse circle {
  animation: none !important;
}
.is-static .pulse {
  display: none;
}

@media print, (prefers-reduced-motion: reduce) {
  .hero-loop * {
    animation: none !important;
  }
  .pulse {
    display: none;
  }
}
</style>
