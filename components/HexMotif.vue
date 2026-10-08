<!--
Hexagon / circuit line motif. Used only by the cover and section layouts.
Approximation of the February deck's motif; replace once the old deck is in reference/.
-->
<script setup lang="ts">
// Flat-top hexagon of radius R centred at (cx, cy), as an SVG points string.
const R = 46
function hex(cx: number, cy: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i
    return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

// Honeycomb grid: columns are 1.5R apart, odd columns shifted down half a cell.
const W = 1.5 * R
const H = Math.sqrt(3) * R
const cells: { points: string, lit: boolean }[] = []
for (let col = 0; col < 7; col++) {
  for (let row = 0; row < 8; row++) {
    const cx = col * W
    const cy = row * H + (col % 2 ? H / 2 : 0)
    // A fixed handful of cells are drawn in the accent colour.
    const lit = (col * 3 + row * 5) % 11 === 0
    cells.push({ points: hex(cx, cy), lit })
  }
}
</script>

<template>
  <svg class="hex-motif" viewBox="0 0 420 552" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
    <defs>
      <!-- Fades the grid out towards the left so it never competes with the text. -->
      <linearGradient id="hex-fade" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.55" stop-color="#fff" stop-opacity="0.55" />
        <stop offset="1" stop-color="#fff" stop-opacity="1" />
      </linearGradient>
      <mask id="hex-mask">
        <rect width="420" height="552" fill="url(#hex-fade)" />
      </mask>
    </defs>
    <g mask="url(#hex-mask)" fill="none" stroke-width="1">
      <polygon
        v-for="(c, i) in cells"
        :key="i"
        :points="c.points"
        :class="c.lit ? 'lit' : 'dim'"
      />
      <!-- Circuit traces: straight runs ending in a node. -->
      <g class="trace">
        <path d="M 60 140 H 190 L 230 180 H 330" />
        <circle cx="330" cy="180" r="4" />
        <path d="M 120 400 H 220 L 250 370 H 380" />
        <circle cx="120" cy="400" r="4" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.hex-motif {
  position: absolute;
  top: 0;
  right: 0;
  width: 46%;
  height: 100%;
  pointer-events: none;
}
.dim {
  stroke: var(--c-line);
}
.lit {
  stroke: var(--c-accent);
  opacity: 0.7;
}
.trace path {
  stroke: var(--c-accent);
  stroke-width: 1.5;
}
.trace circle {
  fill: var(--c-accent);
  stroke: none;
}
</style>
