<!--
Slide 17: what the scenario does to the plan of the thread item, for a few
months. Scenario quantity in bold, baseline in parentheses under it (the same
reading as the planning grid in thesis Fig. 5.17).

Usage:  <ScenarioGrid v-click="4" :months="['2025-04', '2025-09', '2025-10']" />

DATA: data/sku.json → scenario2.line (real, item 101703). `qty` is the
scenario quantity, `baseline` the Scenario 1 forecast for the same month.
-->
<script setup lang="ts">
import { baseUnit, fmtInt } from '../composables/useFormat'
import { monthName } from '../composables/useScenarios'
import sku from '../data/sku.json'

const props = defineProps<{ months: string[] }>()

const item = sku.sku // the thread item, '101703'
const unit = baseUnit(sku.unit)
const cells = props.months.flatMap(m => sku.scenario2.line.filter(l => l.month === m))
</script>

<template>
  <!-- TODO(João): review wording (header, item label) -->
  <table class="scn-grid">
    <thead>
      <tr>
        <th>{{ unit }}</th>
        <th v-for="c in cells" :key="c.month">
          {{ monthName(c.month) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="item">
          {{ item }}
        </td>
        <td v-for="c in cells" :key="c.month">
          <b>{{ fmtInt(c.qty) }}</b>
          <span>({{ fmtInt(c.baseline) }})</span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.scn-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.25;
}
th,
td {
  padding: 5px 0 5px 6px;
  border: none;
  border-bottom: 1px solid var(--c-line);
  background: transparent;
  text-align: right;
  vertical-align: top;
  font-variant-numeric: tabular-nums;
}
th {
  color: var(--c-muted);
  font-weight: 400;
}
th:first-child,
.item {
  padding-left: 0;
  color: var(--c-muted);
  text-align: left;
}
/* Scenario value on top, baseline in parentheses under it. */
td b,
td span {
  display: block;
}
td b {
  font-weight: 700;
}
td span {
  color: var(--c-muted);
}
</style>
