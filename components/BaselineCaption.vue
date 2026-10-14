<!--
Slide 16: the sentence beside the chart, written from the data.

  "All 12 months inside the band. Mar, Aug, Nov and Dec: well below the forecast."

Usage:  <BaselineCaption v-click="1" />

Both halves are computed in composables/useScenarios.ts from data/sku.json →
scenario1: how many months have sales inside the 90% band, and which months
sold less than 80% of the forecast (the same months get an orange dot in the
chart). If the data changes, the sentence changes with it.
-->
<script setup lang="ts">
import { monthName, useBaselineCheck } from '../composables/useScenarios'

const { total, inside, below } = useBaselineCheck()

// ['Aug', 'Nov', 'Dec'] → 'Aug, Nov and Dec'
const names = below.map(monthName)
const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : names[0]
</script>

<template>
  <!-- TODO(João): review wording -->
  <p class="warn">
    {{ inside === total ? `All ${total}` : `${inside} of ${total}` }} months inside the band.
    <template v-if="names.length">
      {{ list }}: well below the forecast.
    </template>
  </p>
</template>
