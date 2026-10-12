<!--
The four pipeline stages as small labelled dots, with the current one
highlighted. Sits in the top-right corner of a slide through Acts 3 and 4.

Usage:
  <PipelineTracker stage="refine" />    in the corner, Refine highlighted
  <PipelineTracker />                   in the corner, nothing highlighted
  <PipelineTracker stage="plan" inline />   placed by you, in the text flow
  <PipelineTracker stage="refine" :pulse="$clicks >= 3 ? 'plan' : undefined" />
      the Plan dot pulses once (scale + glow, PULSE_MS) when `pulse` is set;
      the highlighted stage does not change

Each stage has a fixed column width (PITCH), so the dots are always in the
same place on every slide. Slide 8 relies on this: its big flow shrinks onto
these dots.
-->
<script setup lang="ts">
import type { Stage } from './StageIcon.vue'

withDefaults(defineProps<{ stage?: Stage, inline?: boolean, pulse?: Stage }>(), { inline: false })

const PULSE_MS = 800

const PITCH = 62 // px between two dots
const stages: { id: Stage, label: string }[] = [
  { id: 'train', label: 'Train' },
  { id: 'refine', label: 'Refine' },
  { id: 'plan', label: 'Plan' },
  { id: 'scenario', label: 'Scenario' },
]
</script>

<template>
  <ol class="pipeline-tracker" :class="{ corner: !inline }" :style="{ '--pitch': `${PITCH}px`, '--pulse': `${PULSE_MS}ms` }">
    <li v-for="s in stages" :key="s.id" :class="[s.id, { current: s.id === stage, pulsing: s.id === pulse }]">
      <i class="pt-dot" />
      <span class="pt-label">{{ s.label }}</span>
    </li>
  </ol>
</template>

<style scoped>
.pipeline-tracker {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
}
.pipeline-tracker.corner {
  position: absolute;
  top: 44px;
  right: calc(var(--slide-pad-x) - 14px); /* the last label, not the last column, lines up with the margin */
}
.pipeline-tracker li {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: var(--pitch);
  margin: 0;
  list-style: none;
}
/* Line to the next dot. Dashed before Scenario: that stage is optional. */
.pipeline-tracker li:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 4px;
  left: calc(50% + 9px);
  width: calc(var(--pitch) - 18px);
  border-top: 1.5px solid var(--c-line);
}
.pipeline-tracker li.plan::after {
  border-top-style: dashed;
}
.pt-dot {
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--c-muted);
  border-radius: 50%;
  background: var(--c-bg);
}
.pt-label {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 9.5px;
  letter-spacing: 0.06em;
  line-height: 1;
  text-transform: uppercase;
}
.current .pt-dot {
  border-color: var(--c-accent);
  background: var(--c-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 25%, transparent);
}
/* One pulse in the planning colour: "this is where it goes next". */
.pulsing .pt-dot {
  animation: pt-pulse var(--pulse) ease-out;
}
@keyframes pt-pulse {
  30% {
    scale: 1.9;
    border-color: var(--c-plan);
    background: var(--c-plan);
    box-shadow: 0 0 0 7px color-mix(in srgb, var(--c-plan) 35%, transparent);
  }
}
@media print, (prefers-reduced-motion: reduce) {
  .pulsing .pt-dot {
    animation: none;
  }
}
.current .pt-label {
  color: var(--c-text);
  font-weight: 600;
}
</style>
