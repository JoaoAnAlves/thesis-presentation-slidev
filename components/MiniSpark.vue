<!--
A tiny illustrative chart (84 × 34) in the deck's chart colours. These are
drawings, not data: they only show what KIND of thing goes in or out of a
pipeline stage.

Usage:  <MiniSpark kind="band" />
  sales     one orange line                       (actual demand)
  six       six thin purple lines                 (individual model outputs)
  band      blue line inside a light-blue band    (combined forecast + 90% PI)
  table     small table with one amber row        (plan with an alert)
  crisis    orange line with a jump               (crisis reference period)
  adjusted  dotted line above a blue line         (scenario impact vs baseline)
-->
<script setup lang="ts">
export type SparkKind = 'sales' | 'six' | 'band' | 'table' | 'crisis' | 'adjusted'
defineProps<{ kind: SparkKind }>()

// Six model lines: the same shape, spread apart a little more towards the right.
const six = [-2, -1.2, -0.4, 0.4, 1.2, 2].map((k) => {
  const pts = [[2, 22], [18, 14], [34, 19], [50, 11], [66, 15], [82, 8]]
  return pts.map(([x, y], i) => `${x},${(y + k * (1.2 + i * 1.1)).toFixed(1)}`).join(' ')
})
</script>

<template>
  <svg viewBox="0 0 84 34" class="mini-spark" aria-hidden="true">
    <polyline v-if="kind === 'sales'" class="actual" points="2,24 12,16 22,21 32,10 42,18 52,13 62,23 72,12 82,17" />

    <template v-else-if="kind === 'six'">
      <polyline v-for="(p, k) in six" :key="k" class="model" :points="p" />
    </template>

    <template v-else-if="kind === 'band'">
      <path class="band" d="M2,14 L22,8 L42,10 L62,2 L82,3 V19 L62,20 L42,26 L22,24 L2,26 Z" />
      <polyline class="forecast" points="2,20 22,16 42,18 62,11 82,11" />
    </template>

    <template v-else-if="kind === 'table'">
      <rect class="row head" x="12" y="2" width="60" height="6" rx="1.5" />
      <rect class="row" x="12" y="10.500" width="60" height="6" rx="1.5" />
      <rect class="row alert" x="12" y="19" width="60" height="6" rx="1.5" />
      <rect class="row" x="12" y="27.500" width="60" height="6" rx="1.5" />
    </template>

    <polyline v-else-if="kind === 'crisis'" class="actual" points="2,27 16,25 30,27 40,24 50,8 60,10 70,6 82,9" />

    <template v-else>
      <polyline class="forecast" points="2,26 22,22 42,24 62,18 82,19" />
      <polyline class="scenario" points="2,26 22,14 42,13 62,6 82,7" />
    </template>
  </svg>
</template>

<style scoped>
.mini-spark {
  display: block;
  width: 84px;
  height: 34px;
  overflow: visible;
}
.mini-spark * {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.actual {
  stroke: var(--chart-actual);
  stroke-width: 2.500;
}
.model {
  stroke: var(--chart-model);
  stroke-width: 1.100;
}
.forecast {
  stroke: var(--chart-forecast);
  stroke-width: 2.500;
}
.band {
  fill: var(--chart-band);
}
.scenario {
  stroke: var(--chart-scenario);
  stroke-width: 2.500;
  stroke-dasharray: 0.100 5; /* round caps turn this into dots */
}
.row {
  fill: color-mix(in srgb, var(--c-muted) 30%, transparent);
}
.row.head {
  fill: color-mix(in srgb, var(--c-muted) 65%, transparent);
}
.row.alert {
  fill: var(--c-warn);
}
</style>
