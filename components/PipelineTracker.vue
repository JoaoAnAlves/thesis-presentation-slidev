<!--
The four pipeline stages as small labelled dots, with the current one
highlighted. Sits in the top-right corner of a slide through Acts 3 and 4.

Usage:
  <PipelineTracker stage="refine" />    in the corner, Refine highlighted
  <PipelineTracker />                   in the corner, nothing highlighted
  <PipelineTracker stage="plan" inline />   placed by you, in the text flow

Each stage has a fixed column width (PITCH), so the dots are always in the
same place on every slide. Slide 8 relies on this: its big flow shrinks onto
these dots.
-->
<script setup lang="ts">
import type { Stage } from './StageIcon.vue'

withDefaults(defineProps<{ stage?: Stage, inline?: boolean }>(), { inline: false })

const PITCH = 62 // px between two dots
const stages: { id: Stage, label: string }[] = [
  { id: 'train', label: 'Train' },
  { id: 'refine', label: 'Refine' },
  { id: 'plan', label: 'Plan' },
  { id: 'scenario', label: 'Scenario' },
]
</script>

<template>
  <ol class="pipeline-tracker" :class="{ corner: !inline }" :style="{ '--pitch': `${PITCH}px` }">
    <li v-for="s in stages" :key="s.id" :class="[s.id, { current: s.id === stage }]">
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
.current .pt-label {
  color: var(--c-text);
  font-weight: 600;
}
</style>
