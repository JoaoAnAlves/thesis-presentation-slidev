<!--
What planning receives for one forecast month: forecast + safety stock.

Usage:  <ToPlanningBox month="2025-07" :show="$clicks >= 3" />

The numbers are read from data/sku.json → scenario1.blended for that month:
  forecast      = qty
  safety stock  = rangeUp − qty
Nothing is typed by hand here. The file is MOCK for now.

The box always takes its space; `show` only fades the lines in, one after the
other (ROW_STAGGER_MS apart), so nothing moves between clicks.
-->
<script setup lang="ts">
import { computed } from 'vue'
import sku from '../data/sku.json'

const props = withDefaults(defineProps<{ month: string, show?: boolean }>(), { show: true })

const ROW_STAGGER_MS = 150

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const row = computed(() => sku.scenario1.blended.find(b => b.month === props.month))
const forecast = computed(() => Math.round(row.value?.qty ?? 0))
const safety = computed(() => Math.round((row.value?.rangeUp ?? 0) - (row.value?.qty ?? 0)))
const title = computed(() => `${MONTHS[+props.month.slice(5) - 1]} ${props.month.slice(0, 4)}`)
</script>

<template>
  <!-- TODO(João): review wording -->
  <div class="to-plan" :class="{ show }" :style="{ '--stagger': `${ROW_STAGGER_MS}ms` }">
    <p class="tp-head" style="--i: 0">
      {{ title }} → to planning
      <span v-if="sku.scenario1._mock" class="tp-mock">MOCK</span>
    </p>
    <p style="--i: 1">
      <span>Forecast</span><b>{{ forecast }}</b>
    </p>
    <p class="plan" style="--i: 2">
      <span>+ Safety stock</span><b>{{ safety }}</b><i>(1.65 × RMSE)</i>
    </p>
    <p class="plan total" style="--i: 3">
      <span>= Plan for</span><b>{{ forecast + safety }}</b>
    </p>
  </div>
</template>

<style scoped>
.to-plan {
  display: grid;
  grid-template-columns: auto auto 1fr; /* label · number · note */
  gap: 3px 12px;
  padding: 4px 0 4px 12px;
  border-left: 2px solid transparent;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.4;
  transition: border-color 0.3s ease;
}
.to-plan.show {
  border-left-color: var(--c-plan);
}
/* Each line is one row of the grid: its children sit in the three columns. */
.to-plan p {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / -1;
  margin: 0;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.to-plan.show p {
  opacity: 1;
  transition-delay: calc(var(--i) * var(--stagger));
}
.tp-head {
  display: block !important;
  color: var(--c-muted);
}
.tp-mock {
  margin-left: 8px;
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
}
.to-plan b {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  text-align: right;
}
.to-plan i {
  color: var(--c-muted);
  font-style: normal;
}
.to-plan .plan span,
.to-plan .plan b {
  color: var(--c-plan);
}
.to-plan .total span,
.to-plan .total b {
  font-weight: 700;
}

@media print, (prefers-reduced-motion: reduce) {
  .to-plan,
  .to-plan p {
    transition: none !important;
  }
}
</style>
