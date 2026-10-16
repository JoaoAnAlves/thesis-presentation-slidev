<!--
Stock lots of one component, consumed first-expired, first-out.

Usage:  <FefoLots :show="$clicks >= 2" />

Lots are sorted by expiry date. A lot that expires before the need date turns
amber and is not counted (waste alert). The others are consumed (grey + ✓)
until the gross need is covered. What is left is the net requirement.

All of it is computed in composables/usePlanning.ts from data/sku.json →
planning (illustrative example). The component only draws.
-->
<script setup lang="ts">
import { day, qty as fmt, usePlanning } from '../composables/usePlanning'

const props = withDefaults(defineProps<{ show?: boolean, applyScrapPerLevel?: boolean }>(), { show: true, applyScrapPerLevel: true })

const { fefo } = usePlanning({ applyScrapPerLevel: props.applyScrapPerLevel })
const unit = fefo.item.unit
</script>

<template>
  <!-- TODO(João): review wording -->
  <div class="fefo" :class="{ show }">
    <p class="fefo-head">
      <b>{{ fefo.item.name }}</b> · stock lots, earliest expiry first
    </p>
    <div class="fefo-row">
      <div v-for="lot in fefo.lots" :key="lot.lot" class="fefo-lot" :class="{ expired: lot.expired, used: lot.used > 0 }">
        <p><b>{{ lot.lot }}</b> · {{ fmt(lot.qty) }} {{ unit }} · expires {{ day(lot.expires) }}</p>
        <p v-if="lot.expired" class="fefo-note">
          expires before use → waste alert
        </p>
        <p v-else class="fefo-note">
          ✓ used: {{ fmt(lot.used) }} {{ unit }}
        </p>
      </div>
      <div class="fefo-net">
        <p>net requirement = gross − usable stock</p>
        <p class="fefo-sum">
          {{ fmt(fefo.item.gross) }} − {{ fmt(fefo.usable) }} = <b>{{ fmt(fefo.net) }} {{ unit }}</b>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fefo {
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.3;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.fefo.show {
  opacity: 1;
}
.fefo p {
  margin: 0;
  white-space: nowrap;
}
.fefo-head {
  margin-bottom: 6px !important;
  color: var(--c-muted);
}
.fefo-head b {
  color: var(--c-plan);
}
.fefo-row {
  display: flex;
  align-items: stretch;
  gap: 12px;
}
.fefo-lot {
  padding: 6px 12px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.fefo-note {
  color: var(--c-muted);
}
/* Expires before it is needed: amber, not counted. */
.fefo-lot.expired {
  border-color: var(--c-warn);
  background: color-mix(in srgb, var(--c-warn) 10%, var(--c-surface));
}
.fefo-lot.expired .fefo-note {
  color: var(--c-warn);
  font-weight: 600;
}
/* Consumed: grey. */
.fefo-lot.used {
  background: color-mix(in srgb, var(--c-muted) 14%, var(--c-surface));
  color: var(--c-muted);
}
.fefo-net {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: auto;
  padding-left: 12px;
  border-left: 2px solid var(--c-plan);
}
.fefo-sum {
  font-family: var(--font-mono);
}
.fefo-sum b {
  color: var(--c-plan);
  font-weight: 700;
}

@media print, (prefers-reduced-motion: reduce) {
  .fefo {
    transition: none;
  }
}
</style>
