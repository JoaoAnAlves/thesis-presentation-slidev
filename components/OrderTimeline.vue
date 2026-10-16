<!--
The order that comes out of planning: how much, and by when.

  [truck] Order 159 kg by 23 Jun          23 Jun ●── lead time ──●·· margin ··● needed 1 Jul
  order date already passed → critical alert

Usage:  <OrderTimeline :show="$clicks >= 3" />

quantity  = net requirement of the FEFO component (gross − usable stock)
order by  = need date − lead time − margin (3 days)
Both are computed in composables/usePlanning.ts from data/sku.json → planning
(illustrative example). The two segments are drawn to scale (same number of pixels per day).
-->
<script setup lang="ts">
import { day, qty as fmt, usePlanning } from '../composables/usePlanning'
import { stationIcons } from './stationIcons'

const props = withDefaults(defineProps<{ show?: boolean, applyScrapPerLevel?: boolean }>(), { show: true, applyScrapPerLevel: true })

const { order, fefo } = usePlanning({ applyScrapPerLevel: props.applyScrapPerLevel })

// ----- Geometry (px) -----
const X0 = 420 // the "order by" point
const LINE_W = 360 // from "order by" to "needed"
const total = order.leadTimeDays + order.bufferDays
const xArrival = X0 + (order.leadTimeDays / total) * LINE_W
const X1 = X0 + LINE_W
const px = (n: number) => `${n}px`
</script>

<template>
  <!-- TODO(João): review wording -->
  <div class="otl" :class="{ show }">
    <p class="otl-title">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="stationIcons.dock" /></svg>
      Order {{ fmt(fefo.net) }} {{ fefo.item.unit }} by {{ day(order.orderBy) }}
    </p>
    <p class="otl-critical">
      order date already passed → critical alert
    </p>

    <span class="otl-date" :style="{ left: px(X0) }">{{ day(order.orderBy) }}</span>
    <span class="otl-date" :style="{ left: px(X1) }">needed {{ day(order.needDate) }}</span>
    <div class="otl-seg" :style="{ left: px(X0), width: px(xArrival - X0) }" />
    <div class="otl-seg buffer" :style="{ left: px(xArrival), width: px(X1 - xArrival) }" />
    <i class="otl-dot order" :style="{ left: px(X0) }" />
    <i class="otl-dot" :style="{ left: px(xArrival) }" />
    <i class="otl-dot" :style="{ left: px(X1) }" />
    <span class="otl-len" :style="{ left: px((X0 + xArrival) / 2) }">lead time {{ order.leadTimeDays }} d</span>
    <span class="otl-len" :style="{ left: px((xArrival + X1) / 2) }">margin {{ order.bufferDays }} d</span>
  </div>
</template>

<style scoped>
.otl {
  position: relative;
  height: 60px;
  font-size: 16px; /* deck minimum for any text */
  line-height: 20px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.otl.show {
  opacity: 1;
}
.otl > * {
  position: absolute;
  margin: 0;
  white-space: nowrap;
}
.otl-title {
  left: 0;
  top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--c-plan);
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
}
.otl-title svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: var(--c-plan);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.otl-critical {
  left: 0;
  top: 36px;
  color: var(--c-muted);
}
.otl-date {
  top: 0;
  translate: -50% 0;
}
.otl-seg {
  top: 28px;
  height: 0;
  border-top: 3px solid var(--c-plan);
}
.otl-seg.buffer {
  border-top-style: dotted;
}
.otl-dot {
  top: 23px;
  width: 13px;
  height: 13px;
  border: 3px solid var(--c-plan);
  border-radius: 50%;
  background: var(--c-bg);
  translate: -50% 0;
}
.otl-dot.order {
  background: var(--c-plan);
}
.otl-len {
  top: 38px;
  color: var(--c-muted);
  translate: -50% 0;
}

@media print, (prefers-reduced-motion: reduce) {
  .otl {
    transition: none;
  }
}
</style>
