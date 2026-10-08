<!--
Small planning grid for the scenario slide: the scenario value is the main
number, the baseline sits in parentheses, and a cell that changed is amber.

Usage:  <PlanGrid v-click="3" />
-->
<script setup lang="ts">
import data from '../data/sku-mock.json'

const grid = data.planGrid
</script>

<template>
  <!-- TODO(João): review wording (column headers, unit, mock label) -->
  <table class="plan-grid">
    <thead>
      <tr>
        <th>{{ grid.unit }}</th>
        <th v-for="m in grid.months" :key="m">
          {{ m }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in grid.rows" :key="row.item">
        <td class="item">
          {{ row.item }}
        </td>
        <td
          v-for="(value, i) in row.scenario"
          :key="i"
          :class="{ changed: value !== row.baseline[i] }"
        >
          <span class="value">{{ value }}</span>
          <span class="base">({{ row.baseline[i] }})</span>
        </td>
      </tr>
    </tbody>
    <caption v-if="data._mock">
      MOCK DATA
    </caption>
  </table>
</template>

<style scoped>
.plan-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
th,
td {
  padding: 5px 4px;
  border: none;
  border-bottom: 1px solid var(--c-line);
  text-align: right;
  background: transparent;
}
th {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
}
th:first-child,
.item {
  text-align: left;
  color: var(--c-muted);
  white-space: nowrap;
}
.value {
  font-family: var(--font-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.base {
  margin-left: 3px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}
.changed .value {
  color: var(--c-warn);
}
caption {
  caption-side: bottom;
  padding-top: 4px;
  text-align: right;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
}
</style>
