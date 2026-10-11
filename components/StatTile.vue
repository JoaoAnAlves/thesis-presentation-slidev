<!--
One headline statistic: icon, big number, label, source line.
The number counts up from 0 when `active` turns true.

Usage in a slide (one tile per click):

  <StatTile icon="waste" :value="1.3" :decimals="1" prefix="~" suffix=" B"
            label="tons of food lost or wasted per year"
            source="Roy et al., 2023" :active="$clicks >= 1" />

For a tile without a number, put the content in the default slot:

  <StatTile icon="shock" label="..." source="..." :active="$clicks >= 3">2022 · 2026</StatTile>
-->
<script setup lang="ts">
import { useNav } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  icon?: 'waste' | 'workers' | 'shock'
  /** Final number. Leave out when using the slot instead. */
  value?: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
  source?: string
  /** Dim and at zero while false; lights up and counts while true */
  active?: boolean
}>(), {
  icon: 'waste',
  value: 0,
  decimals: 0,
  prefix: '',
  suffix: '',
  source: '',
  active: true,
})

const DURATION = 900 // ms

// In PDF export, or when the viewer asked for reduced motion, skip the animation.
const { isPrintMode } = useNav()
const instant = () =>
  isPrintMode.value
  || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

// The number currently on screen. If the tile is already active when it is
// created (coming back to the slide, or export), start at the final value.
const shown = ref(props.active ? props.value : 0)
let frame = 0

function countUp() {
  cancelAnimationFrame(frame)
  if (instant()) {
    shown.value = props.value
    return
  }
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / DURATION) // progress 0..1
    const eased = 1 - (1 - t) ** 3 // fast at first, slowing into the final value
    shown.value = props.value * eased
    if (t < 1)
      frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

watch(() => props.active, (on) => {
  if (on) {
    countUp()
  }
  else {
    cancelAnimationFrame(frame)
    shown.value = 0
  }
})
onUnmounted(() => cancelAnimationFrame(frame))

const text = computed(() => `${props.prefix}${shown.value.toFixed(props.decimals)}${props.suffix}`)
</script>

<template>
  <div class="stat-tile" :class="{ on: active }">
    <svg class="stat-icon" viewBox="0 0 24 24" aria-hidden="true">
      <!-- waste: bin -->
      <path v-if="icon === 'waste'" d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
      <!-- workers: two people -->
      <path v-else-if="icon === 'workers'" d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3.3 2.7-6 6-6s6 2.700 6 6M16 11a3 3 0 1 0 0-6M17 14c2.800 .5 5 3 5 6" />
      <!-- shock: lightning bolt -->
      <path v-else d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
    <div class="stat-number" :class="{ 'is-text': $slots.default }">
      <slot>{{ text }}</slot>
    </div>
    <div class="stat-label">
      {{ label }}
    </div>
    <div v-if="source" class="stat-source">
      {{ source }}
    </div>
  </div>
</template>

<style scoped>
.stat-tile {
  display: flex;
  flex-direction: column;
  padding: 22px 22px 18px;
  border: 1px solid var(--c-line);
  border-radius: 12px;
  background: var(--c-surface);
  opacity: 0.25;
  transition: opacity 0.4s ease;
}
.stat-tile.on {
  opacity: 1;
}
.stat-icon {
  width: 30px;
  height: 30px;
  margin-bottom: 14px;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.stat-number {
  font-family: var(--font-display);
  font-size: 46px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--c-text);
  /* Equal-width digits, so the number does not jitter sideways while counting. */
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* Slot content (words or dates instead of one number) is longer, so it is set smaller. */
.stat-number.is-text {
  font-size: 30px;
  line-height: 1.7;
}
.stat-label {
  margin-top: 10px;
  font-size: 17px;
  line-height: 1.35;
  color: var(--c-text);
}
.stat-source {
  margin-top: auto;
  padding-top: 14px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
