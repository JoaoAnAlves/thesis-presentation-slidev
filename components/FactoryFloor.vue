<!--
Three stations as equal columns, all connected to one "shared plan" band.
The layout is fixed: nothing changes size or position between clicks.

  step 0   each column: icon, name, the station's question, actors, and an
           empty frame where the screenshot will go
  step 1   two capability chips fade in
  step 2   ripple: Office → band → Dock, then on to Work. Each station's
           screenshot fades in together with its ripple label
  step 3   scope footnote

Usage:  <FactoryFloor :step="$clicks" />

Clicking a screenshot opens it full-screen; a click or Esc closes it.
Screenshots are read from public/img/. If a file is missing, the frame shows
its file name.
-->
<script setup lang="ts">
import { lockShortcuts, useIsSlideActive } from '@slidev/client'
import { onUnmounted, reactive, ref, watch } from 'vue'
import { stationIcons } from './stationIcons'
import type { StationId } from './stationIcons'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

interface Station {
  id: StationId
  name: string
  question: string
  actors: { icon: string, label: string }[]
  can: string[]
  shot: string
  thumb: string
  ripple: string
}

// TODO(João): review wording (names, questions, actors, chips)
const stations: Station[] = [
  {
    id: 'office',
    name: 'Office Room',
    question: 'What should we make and buy?',
    actors: [{ icon: 'person', label: 'Manager / Admin' }, { icon: 'clock', label: 'System Timer' }],
    can: ['override weights', 'run scenarios'],
    shot: '/img/user_impact_model_white.png', // full screen, shown in the overlay
    thumb: '/img/user_impact_model_white.png', // shown in the card
    ripple: 'forecast raised',
  },
  {
    id: 'dock',
    name: 'DockStation',
    question: 'What arrives and leaves, and when?',
    actors: [{ icon: 'person', label: 'Operator' }, { icon: 'person', label: 'Manager' }],
    can: ['inbound / outbound', 'disruption impact'],
    shot: '/img/planning_process_inbound_white.png', // full screen, shown in the overlay
    thumb: '/img/planning_process_inbound_white.png', // shown in the card
    ripple: 'inbound order grows',
  },
  {
    id: 'work',
    name: 'WorkStation',
    question: 'What do we produce today, and with what?',
    actors: [{ icon: 'person', label: 'Operator' }, { icon: 'person', label: 'Manager' }],
    can: ['production targets', 'expiry alerts'],
    shot: '/img/planning_process_demand_white.png', // full screen, shown in the overlay
    thumb: '/img/planning_process_demand_white.png', // shown in the card
    ripple: 'schedule updates',
  },
]
const missing = reactive<Record<string, boolean>>({})
const fileName = (path: string) => path.split('/').pop()

// ----- Geometry (px) -----
// Everything has a fixed size, so the ripple can use known coordinates.
const W = 868
const GAP = 16
const COL_W = (W - 2 * GAP) / 3
const CARD_H = 312
const LINK_H = 22 // connector between a column and the band
const BAND_H = 34
const colX = (i: number) => i * (COL_W + GAP) + COL_W / 2 // centre of column i
const BAND_Y = CARD_H + LINK_H + BAND_H / 2 // vertical centre of the band

// ----- Full-screen screenshot -----
// `zoomed` holds the image being shown, or null. While it is open, Slidev's
// keyboard shortcuts are locked so no key can change slide, and our own key
// listener closes the overlay on Esc.
const zoomed = ref<{ src: string, alt: string } | null>(null)
let unlock: (() => void) | undefined

function onKey(e: KeyboardEvent) {
  // Capture phase + stopImmediatePropagation: the key never reaches Slidev.
  e.stopImmediatePropagation()
  e.preventDefault()
  if (e.key === 'Escape')
    closeZoom()
}
function openZoom(src: string, alt: string) {
  zoomed.value = { src, alt }
  unlock = lockShortcuts()
  window.addEventListener('keydown', onKey, true)
}
function closeZoom() {
  zoomed.value = null
  unlock?.()
  unlock = undefined
  window.removeEventListener('keydown', onKey, true)
}
// Never leave the overlay (or the lock) behind when the slide changes.
const isActive = useIsSlideActive()
watch(isActive, (on) => {
  if (!on)
    closeZoom()
})
onUnmounted(closeZoom)

// ----- Ripple -----
// The pulse is a chain of straight segments. Each segment is its own dot that
// is only visible while it travels. Start times are worked out here from one
// speed, so every dot picks up exactly where the previous one stopped.
const SPEED = 420 // px per second
type Seg = { x1: number, y1: number, x2: number, y2: number, start: number, dur: number }
function seg(x1: number, y1: number, x2: number, y2: number, start: number): Seg {
  return { x1, y1, x2, y2, start, dur: Math.hypot(x2 - x1, y2 - y1) / SPEED }
}
const end = (s: Seg) => s.start + s.dur

const down = seg(colX(0), CARD_H, colX(0), BAND_Y, 0) // Office → band
const toDock = seg(colX(0), BAND_Y, colX(1), BAND_Y, end(down)) // along the band
const upDock = seg(colX(1), BAND_Y, colX(1), CARD_H, end(toDock)) // band → Dock
const toWork = seg(colX(1), BAND_Y, colX(2), BAND_Y, end(toDock)) // on along the band (the split)
const upWork = seg(colX(2), BAND_Y, colX(2), CARD_H, end(toWork)) // band → Work
const segments = [down, toDock, upDock, toWork, upWork]

// When each station reacts (label fades in, card flashes): Office at the start,
// the others when their dot arrives.
const reactAt: Record<string, number> = { office: 0, dock: end(upDock), work: end(upWork) }
const sec = (t: number) => `${t.toFixed(2)}s`
</script>

<template>
  <div
    class="floor"
    :class="{ open: step >= 1, ripple: step >= 2, noted: step >= 3 }"
    :style="{
      'width': `${W}px`,
      '--gap': `${GAP}px`,
      '--card-h': `${CARD_H}px`,
      '--link-h': `${LINK_H}px`,
      '--band-h': `${BAND_H}px`,
    }"
  >
    <!-- Columns -->
    <div class="columns">
      <div v-for="s in stations" :key="s.id" class="station" :class="s.id" :style="{ '--d': sec(reactAt[s.id]) }">
        <div class="station-head">
          <svg viewBox="0 0 24 24" class="flat-icon" aria-hidden="true">
            <path :d="stationIcons[s.id]" />
          </svg>
          <span class="station-name">{{ s.name }}</span>
        </div>

        <p class="station-question">
          {{ s.question }}
        </p>

        <!-- Actors on the left; the two chips on the right fade in at step 1 -->
        <div class="station-meta">
          <div class="station-actors">
            <span v-for="a in s.actors" :key="a.label" class="actor">
              <svg viewBox="0 0 24 24" class="actor-icon" aria-hidden="true">
                <path v-if="a.icon === 'person'" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.400 3.600-8 8-8s8 3.600 8 8" />
                <path v-else d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2" />
              </svg>
              {{ a.label }}
            </span>
          </div>
          <ul class="station-chips">
            <li v-for="c in s.can" :key="c" class="deck-chip">
              {{ c }}
            </li>
          </ul>
        </div>

        <!-- Screenshot frame: empty until the ripple reaches this station (step 2) -->
        <div class="shot-frame">
          <img
            v-if="!missing[s.id]"
            :src="s.thumb"
            :alt="`${s.name} screen`"
            class="shot"
            title="Click to enlarge"
            @click.stop="openZoom(s.shot, `${s.name} screen`)"
            @error="missing[s.id] = true"
          >
          <span v-else class="shot shot-missing">{{ fileName(s.thumb) }}</span>
        </div>
      </div>
    </div>

    <!-- Connectors, with the ripple labels beside them -->
    <div class="connectors">
      <div v-for="s in stations" :key="s.id" class="connector">
        <!-- TODO(João): review wording -->
        <span class="ripple-label" :style="{ '--d': sec(reactAt[s.id]) }">{{ s.ripple }}</span>
      </div>
    </div>

    <!-- Shared plan -->
    <div class="band">
      <strong>SHARED PLAN</strong> · central database
    </div>

    <p class="floor-note">
      Prototype: one interface (Manager / Operator roles) already holds these views. Dedicated station screens: future work.
    </p>

    <!-- Full-screen screenshot. Teleported to <body> so it covers the whole
         window instead of being scaled and clipped with the slide. -->
    <Teleport to="body">
      <div v-if="zoomed" class="zoom-overlay" @click.stop="closeZoom">
        <img :src="zoomed.src" :alt="zoomed.alt">
      </div>
    </Teleport>

    <!-- Ripple dots -->
    <svg class="ripple-svg" :viewBox="`0 0 ${W} ${CARD_H + LINK_H + BAND_H}`" aria-hidden="true">
      <circle
        v-for="(g, k) in segments"
        :key="k"
        r="6"
        class="dot"
        :style="{
          '--x1': `${g.x1}px`,
          '--y1': `${g.y1}px`,
          '--x2': `${g.x2}px`,
          '--y2': `${g.y2}px`,
          '--d': sec(g.start),
          '--dur': sec(g.dur),
        }"
      />
    </svg>
  </div>
</template>

<style scoped>
.floor {
  position: relative;
  font-size: 14px;
  line-height: 1.3;
}

/* ---------- Columns ---------- */
.columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap);
}
.station {
  display: flex;
  flex-direction: column;
  height: var(--card-h);
  padding: 12px 13px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.station-head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.flat-icon {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.station-name {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 600;
}
.station-question {
  margin: 7px 0 0;
  min-height: 2.5em; /* two lines, so the columns line up */
  font-size: 18px;
  font-weight: 500;
  line-height: 1.25;
}
/* Actors (left, one per line) and chips (right, one per line) share a row. */
.station-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
}
.station-actors {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: var(--c-muted);
  font-size: 12px;
}
.actor {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.actor-icon {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
}

/* Chips and screenshots keep their space from the start and only fade in. */
.station-chips {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.station-chips li {
  margin: 0;
  list-style: none;
}
.shot-frame {
  flex: 1;
  min-height: 0;
  margin-top: 8px;
  border: 1px solid var(--c-line);
  border-radius: 8px;
  background: #fff; /* screenshots are on white */
  overflow: hidden;
}
.shot {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain; /* whole screen visible, no cropping */
  opacity: 0;
  pointer-events: none;
  cursor: zoom-in;
  transition: opacity 0.4s ease 0.1s;
}
.shot-missing {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}
.open .station-chips {
  opacity: 1;
}
/* The screenshot appears with its station's ripple label: same class, same
   delay (--d is set on the station and inherited here). */
.ripple .shot {
  opacity: 1;
  pointer-events: auto;
  animation: label-in 0.5s ease var(--d) backwards;
}

/* Full-screen overlay (lives in <body>, outside the scaled slide). */
.zoom-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vmin;
  background: rgba(0, 0, 0, 0.82);
  cursor: zoom-out;
}
.zoom-overlay img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* ---------- Connectors and band ---------- */
.connectors {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--gap);
  height: var(--link-h);
}
.connector {
  position: relative;
  width: 0;
  margin: 0 auto;
  border-left: 1.5px solid var(--c-muted);
}
.band {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4em;
  height: var(--band-h);
  border: 1.5px solid var(--c-accent);
  border-radius: 8px;
  background: color-mix(in srgb, var(--c-accent) 8%, var(--c-surface));
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}
.band strong {
  color: var(--c-accent);
  font-weight: 600;
}

.floor-note {
  margin: 7px 0 0;
  color: var(--c-muted);
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.noted .floor-note {
  opacity: 1;
}

/* ---------- Ripple (step 2) ----------
   Adding `ripple` starts all of these together; each waits its own delay (--d).
   A dot has no fill mode, so it is invisible before and after its own run and
   shows only while it moves from (--x1, --y1) to (--x2, --y2). */
.ripple-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: visible;
  pointer-events: none;
}
.dot {
  fill: var(--c-warn);
  opacity: 0;
  filter: drop-shadow(0 0 4px var(--c-warn));
}
.ripple .dot {
  animation: travel var(--dur) linear var(--d);
}
@keyframes travel {
  from { translate: var(--x1) var(--y1); opacity: 1; }
  to { translate: var(--x2) var(--y2); opacity: 1; }
}

.ripple-label {
  position: absolute;
  top: 3px;
  left: 8px;
  color: var(--c-warn);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
}
.ripple .ripple-label {
  opacity: 1;
  animation: label-in 0.4s ease var(--d) backwards;
}
@keyframes label-in {
  from { opacity: 0; }
}

.ripple .station {
  animation: station-hit 0.7s ease var(--d);
}
@keyframes station-hit {
  30% {
    border-color: var(--c-warn);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-warn) 25%, transparent);
  }
}

@media print, (prefers-reduced-motion: reduce) {
  .floor * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
