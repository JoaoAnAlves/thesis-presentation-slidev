<!--
Static icon for one pipeline stage. Train, Refine and Plan are the same
drawings as the "models", "forecast" and "plan" nodes in HeroLoop.vue (their
finished, non-animated frame), so the jury recognises them from the cover.
HeroLoop has no Scenario node, so that one is drawn here in the same style.

Usage:  <StageIcon stage="train" />      train | refine | plan | scenario
-->
<script setup lang="ts">
export type Stage = 'train' | 'refine' | 'plan' | 'scenario'
defineProps<{ stage: Stage }>()

// Train: six dots on a small circle (same numbers as HeroLoop).
const dots = Array.from({ length: 6 }, (_, k) => {
  const a = (Math.PI / 3) * k + Math.PI / 6
  return { x: (13 * Math.cos(a)).toFixed(1), y: (13 * Math.sin(a)).toFixed(1) }
})
</script>

<template>
  <svg viewBox="-22 -22 44 44" class="stage-icon" :class="stage" aria-hidden="true">
    <template v-if="stage === 'train'">
      <circle v-for="(d, k) in dots" :key="k" class="solid" :cx="d.x" :cy="d.y" r="3.2" />
    </template>

    <template v-else-if="stage === 'refine'">
      <path class="band" d="M-18,-1 L-8,-9 L0,-4 L9,-14 L18,-17 V-3 L9,0 L0,10 L-8,5 L-18,13 Z" />
      <path class="thick" d="M-18,6 L-8,-2 L0,3 L9,-7 L18,-10" />
    </template>

    <template v-else-if="stage === 'plan'">
      <path d="M0,-11 L-10,0 M0,-11 L10,0 M-10,3 L-16,12 M-10,3 L-5,12 M10,3 L10,12" />
      <rect class="solid" x="-3.5" y="-17" width="7" height="7" rx="1.5" />
      <rect class="solid" x="-13" y="-3" width="6" height="6" rx="1.5" />
      <rect class="solid" x="7" y="-3" width="6" height="6" rx="1.5" />
      <rect class="solid" x="-19" y="11" width="6" height="6" rx="1.5" />
      <rect class="solid" x="-8" y="11" width="6" height="6" rx="1.5" />
      <rect class="solid" x="7" y="11" width="6" height="6" rx="1.5" />
    </template>

    <!-- Scenario: a shock spreading outwards -->
    <template v-else>
      <circle class="solid" r="4" />
      <circle r="10" />
      <circle r="17" stroke-dasharray="4 4" />
    </template>
  </svg>
</template>

<style scoped>
.stage-icon {
  --tint: var(--c-accent);
  display: block;
}
.train {
  --tint: var(--chart-model);
}
.refine {
  --tint: var(--chart-forecast);
}
.scenario {
  --tint: var(--c-warn);
}
.stage-icon * {
  fill: none;
  stroke: var(--tint);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.stage-icon .solid {
  fill: var(--tint);
  stroke: none;
}
.stage-icon .band {
  fill: color-mix(in srgb, var(--chart-forecast) 30%, transparent);
  stroke: none;
}
.stage-icon .thick {
  stroke-width: 2;
}
</style>
