<!--
One row per model: name + weight bar + percentage.

Slide 18 (`stage`): two runs, each with its own weights.

  stage 0  six purple bars: the weights of the 2025 run
           label "2025 run · 6 models"
  stage 1  label "2026 run"; the models that did not complete it turn grey,
           get a ✕ and fade, one after the other (FAIL_STAGGER_MS apart)
  stage 2  the remaining bars drop to zero, wait RESET_HOLD_MS, then grow to
           their 2026 weights in GROW_MS (still purple, now in bold); label
           "weights from the 2026 errors"
           They are NOT the 2025 bars rescaled: the 2026 run validated the
           surviving models again and computed new weights from those errors.
           That is why the bars go through zero first.

Usage:  <WeightBars :stage="Math.min($clicks, 2)" />

DATA: data/sku.json (real, item 101703)
  scenario1.models[].weight   2025 run
  scenario3.models[]          2026 run: `ran` (completed or not) and `weight`

Second way to use it (slide 14): pass the rows yourself.

  <WeightBars :rows="[{ id, name, weight }, …]" handle="chronos" :show-handle="…" :mute-others="…" />

Then `stage` is ignored, a full track means 50%, and the row named by `handle`
gets a slider knob at the end of its bar. `muteOthers` turns every other bar
grey, so the purple one matches the purple line in the chart. The component
draws exactly the weights it is given: to animate a change, pass weights that
are already tweened (useTween).
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { fmtPct } from '../composables/useFormat'
import sku from '../data/sku.json'

const props = withDefaults(defineProps<{
  stage?: number
  rows?: { id: string, name: string, weight: number }[]
  handle?: string
  showHandle?: boolean
  muteOthers?: boolean
}>(), { stage: 0, showHandle: false, muteOthers: false })
const { isPrintMode } = useNav()

const MANUAL_FULL = 0.5 // slide-14 mode: weight that fills the whole track
const FAIL_STAGGER_MS = 150 // stage 1: delay between one failing model and the next
const RESET_HOLD_MS = 350 // stage 2: how long the bars stay at zero
const GROW_MS = 600 // stage 2: how long the bars take to reach the 2026 weights

// ----- The two runs, from the data file -----
const run2025 = sku.scenario1.models
const run2026 = sku.scenario3.models
const in2026 = (id: string) => run2026.find(m => m.id === id)
const ran = (id: string) => in2026(id)?.ran ?? false
const survivors = run2025.filter(m => ran(m.id)).length

// ----- Stage 2: old weights → zero → new weights -----
// 'old' = 2025 weights, 'zero' = empty bars, 'new' = 2026 weights.
type Phase = 'old' | 'zero' | 'new'
const phase = ref<Phase>(props.stage >= 2 ? 'new' : 'old')
let timer = 0
watch(() => props.stage, (now, before) => {
  clearTimeout(timer)
  if (now >= 2 && before < 2 && !isPrintMode.value) {
    phase.value = 'zero'
    timer = window.setTimeout(() => (phase.value = 'new'), RESET_HOLD_MS)
  }
  else {
    phase.value = now >= 2 ? 'new' : 'old'
  }
})
onBeforeUnmount(() => clearTimeout(timer))

const rows = computed(() => props.rows
  ? props.rows.map(r => ({ ...r, failed: false, changed: false, order: 0 }))
  : run2025.map((m) => {
    const failed = props.stage >= 1 && !ran(m.id)
    return {
      id: m.id,
      name: m.short,
      // Stage 1: everyone still shows the 2025 weight. Stage 2: the 2026 run's
      // weights, through zero (a model that did not run has weight 0 there).
      weight: phase.value === 'old' ? m.weight : phase.value === 'zero' ? 0 : (in2026(m.id)?.weight ?? 0),
      failed,
      changed: props.stage >= 2 && !failed,
      // place among the failed models, for the stagger
      order: run2025.filter(n => !ran(n.id)).findIndex(n => n.id === m.id),
    }
  }),
)

// Bars are scaled so the largest weight that can ever appear fills the track.
const maxWeight = props.rows ? MANUAL_FULL : Math.max(...run2025.map(m => m.weight), ...run2026.map(m => m.weight))
const width = (w: number) => `${Math.min(w / maxWeight, 1) * 100}%`
</script>

<template>
  <!-- TODO(João): review wording (the three labels) -->
  <div
    class="weight-bars" :class="[props.rows ? 'manual' : 'runs', `phase-${phase}`]"
    :style="{ '--stagger': `${FAIL_STAGGER_MS}ms`, '--grow': `${GROW_MS}ms` }"
  >
    <p v-if="!props.rows" class="run-label">
      <span :class="{ on: stage === 0 }">2025 run · {{ run2025.length }} models</span>
      <span :class="{ on: stage === 1 }">2026 run</span>
      <span :class="{ on: stage >= 2 }">weights from the 2026 errors · {{ survivors }} models</span>
    </p>
    <div
      v-for="row in rows"
      :key="row.id"
      class="row"
      :class="{ failed: row.failed, changed: row.changed, 'bar-muted': muteOthers && row.id !== handle }"
      :style="{ '--i': row.order }"
    >
      <span class="chip">
        <span class="cross">✕</span>{{ row.name }}
      </span>
      <span class="track">
        <span class="bar" :style="{ width: width(row.weight) }" />
        <i v-if="row.id === handle" class="knob" :class="{ on: showHandle }" :style="{ left: width(row.weight) }" />
      </span>
      <span class="value">{{ row.weight > 0 ? fmtPct(row.weight, props.rows ? 1 : row.changed ? 0 : 1) : '–' }}</span>
    </div>
  </div>
</template>

<style scoped>
.weight-bars {
  display: grid;
  gap: 4px;
}
.row {
  display: grid;
  grid-template-columns: 78px 1fr 60px; /* name · bar · "25.8%", clear of the slider knob */
  align-items: center;
  gap: 8px;
  height: 22px;
  font-size: 16px; /* deck minimum for any text */
  line-height: 22px;
}
.chip {
  white-space: nowrap;
}
.track {
  position: relative;
  height: 12px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--c-muted) 16%, transparent);
}
.bar {
  display: block;
  height: 100%;
  border-radius: 6px;
  background: var(--chart-model);
}
.value {
  text-align: right;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

/* ---------- Slide 18: two runs ---------- */
.runs {
  gap: 5px;
}
.runs .row {
  grid-template-columns: 98px 1fr 52px; /* room for "✕ LightGBM" */
}
/* Three labels share one line; only the current one shows. */
.run-label {
  position: relative;
  height: 44px; /* two lines: the last label wraps */
  margin: 0;
  color: var(--c-muted);
  font-size: 16px;
  line-height: 22px;
}
.run-label span {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.run-label span.on {
  opacity: 1;
}
.cross {
  display: inline-block;
  width: 0;
  overflow: hidden;
  opacity: 0;
  vertical-align: bottom;
}
.runs .row {
  transition: opacity 0.5s ease, color 0.4s ease;
}
.runs .bar {
  transition: width var(--grow) ease, background-color 0.4s ease;
}
.runs .cross {
  transition: width 0.3s ease, opacity 0.4s ease;
}
/* Models that did not complete the 2026 run: grey, ✕, faded, one after the other. */
.runs .failed,
.runs .failed .bar,
.runs .failed .cross {
  transition-delay: calc(var(--i) * var(--stagger));
}
.runs .failed {
  color: var(--c-muted);
  opacity: 0.35;
}
.runs .failed .cross {
  width: 1.1em;
  opacity: 1;
}
.runs .failed .bar {
  background: var(--c-muted);
}
/* Stage 2: the drop to zero is instant, the growth is not. The new weights
   stay purple (orange is for actual demand) and are marked by bold text. */
.phase-zero .bar {
  transition: none;
}
.changed .chip {
  font-weight: 700;
}
.changed .value {
  color: var(--chart-model);
  font-weight: 700;
}
.phase-zero .changed .value {
  color: transparent;
}

/* ---------- Rows given by the slide (slide 14) ---------- */
.manual .bar {
  transition: background-color 0.5s ease; /* no width transition: the slide passes tweened weights */
}
.manual .bar-muted .bar {
  background: color-mix(in srgb, var(--c-muted) 55%, transparent);
}
.knob {
  position: absolute;
  top: 50%;
  width: 18px;
  height: 18px;
  border: 3px solid var(--chart-model);
  border-radius: 50%;
  background: var(--c-surface);
  translate: -50% -50%;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.knob.on {
  opacity: 1;
}

@media print, (prefers-reduced-motion: reduce) {
  .weight-bars * {
    transition: none !important;
  }
}
</style>
