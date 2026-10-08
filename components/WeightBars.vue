<!--
One row per model: name chip + weight bar + percentage.
Weights are computed here with Inverse Error Weighting, w = (1/RMSE) / sum(1/RMSE),
over whichever models are currently counted.

`stage` decides what is shown:
  0  nothing
  1  all six models with six-model weights; shortly after, the models that
     did not run live fade to grey with a cross
  2  weights renormalized over the survivors (changed values in amber)

Usage:  <WeightBars :stage="Math.min($clicks, 2)" />
-->
<script setup lang="ts">
import { computed } from 'vue'
import data from '../data/sku-mock.json'

const props = withDefaults(defineProps<{ stage?: number }>(), { stage: 0 })

// Inverse Error Weighting over a subset of the models.
function weights(ids: string[]) {
  const pool = data.models.filter(m => ids.includes(m.id))
  const total = pool.reduce((sum, m) => sum + 1 / m.rmse, 0)
  return Object.fromEntries(pool.map(m => [m.id, 1 / m.rmse / total]))
}

const allIds = data.models.map(m => m.id)
const liveIds = data.models.filter(m => m.ranLive).map(m => m.id)
const wAll = weights(allIds)
const wLive = weights(liveIds)

const rows = computed(() =>
  data.models.map((m) => {
    const renormalized = props.stage >= 2
    const weight = renormalized ? (wLive[m.id] ?? 0) : wAll[m.id]
    return {
      ...m,
      weight,
      failed: props.stage >= 1 && !m.ranLive,
      changed: renormalized && m.ranLive,
    }
  }),
)

// Bars are scaled so the largest weight that can ever appear fills the track.
const maxWeight = Math.max(...Object.values(wLive), ...Object.values(wAll))
</script>

<template>
  <!-- TODO(João): review wording (model names, mock label) -->
  <div class="weight-bars" :class="{ on: stage >= 1 }">
    <div
      v-for="row in rows"
      :key="row.id"
      class="row"
      :class="{ failed: row.failed, changed: row.changed }"
    >
      <span class="chip">
        <span class="cross">✕</span>{{ row.name }}
      </span>
      <span class="track">
        <span class="bar" :style="{ width: `${(row.weight / maxWeight) * 100}%` }" />
      </span>
      <span class="value">{{ row.weight > 0 ? `${Math.round(row.weight * 100)}%` : '–' }}</span>
    </div>
    <div v-if="data._mock" class="mock">
      MOCK DATA
    </div>
  </div>
</template>

<style scoped>
.weight-bars {
  display: grid;
  gap: 7px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.weight-bars.on {
  opacity: 1;
}

.row {
  display: grid;
  grid-template-columns: 118px 1fr 34px;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.chip {
  padding: 2px 8px;
  border: 1px solid var(--chart-model);
  border-radius: 999px;
  color: var(--c-text);
  white-space: nowrap;
  /* The delay makes the chips appear first and the failures fade afterwards, on the same click. */
  transition: color 0.5s ease 0.9s, border-color 0.5s ease 0.9s;
}
.cross {
  display: inline-block;
  width: 0;
  overflow: hidden;
  opacity: 0;
  vertical-align: bottom;
  transition: width 0.3s ease 0.9s, opacity 0.5s ease 0.9s;
}

.track {
  height: 8px;
  border-radius: 4px;
  background: var(--c-surface);
}
.bar {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--chart-model);
  transition: width 0.8s ease, background-color 0.5s ease, opacity 0.5s ease 0.9s;
}
.value {
  text-align: right;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  transition: color 0.5s ease;
}

/* Models that did not complete the live run */
.failed .chip {
  border-color: var(--c-line);
  color: var(--c-muted);
}
.failed .cross {
  width: 1.1em;
  opacity: 1;
}
.failed .bar {
  opacity: 0.25;
}
.failed .value {
  color: var(--c-muted);
}

/* Survivors after renormalization: amber marks what changed */
.changed .bar {
  background: var(--c-warn);
}
.changed .value {
  color: var(--c-warn);
}

.mock {
  text-align: right;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}
</style>
