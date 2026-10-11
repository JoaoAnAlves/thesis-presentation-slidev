<!--
The six forecasting models as labelled status dots.

  idle      grey
  running   accent blue, pulsing
  ok        green
  failed    red with ✕

Usage:
  <ModelDots />                                            all idle
  <ModelDots :states="{ RF: 'ok', Prophet: 'failed' }" />  the rest stay idle
  <ModelDots :states="..." :columns="6" />                 one row

A dot makes a small scale pulse whenever its state changes. The names are the
keys of `states`; pass `models` to show a different list or order.
-->
<script setup lang="ts">
export type ModelState = 'idle' | 'running' | 'ok' | 'failed'

withDefaults(defineProps<{
  states?: Record<string, ModelState>
  models?: string[]
  columns?: number
}>(), {
  states: () => ({}),
  models: () => ['RF', 'XGBoost', 'LightGBM', 'Prophet', 'Chronos', 'Granite'],
  columns: 3,
})
</script>

<template>
  <ul class="model-dots" :style="{ '--cols': columns }">
    <li v-for="m in models" :key="m" :class="states[m] ?? 'idle'">
      <i class="model-dot" />{{ m }}
    </li>
  </ul>
</template>

<style scoped>
.model-dots {
  display: grid;
  grid-template-columns: repeat(var(--cols), auto);
  justify-content: center;
  gap: 14px 34px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
}
.model-dots li {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0;
  list-style: none;
  white-space: nowrap;
}
.model-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex: none;
  border-radius: 50%;
  background: color-mix(in srgb, var(--c-muted) 45%, transparent);
  transition: background-color 0.25s ease;
}

/* Each state has its own animation name, so moving from one state to another
   always starts a new animation (the small scale pulse). */
.running .model-dot {
  background: var(--c-accent);
  animation: dot-running 0.9s ease-in-out infinite;
}
.ok .model-dot {
  background: var(--c-ok);
  animation: dot-ok 0.4s ease;
}
.failed .model-dot {
  background: var(--c-danger);
  animation: dot-failed 0.4s ease;
}
.failed .model-dot::after {
  content: '✕';
  color: #fff;
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  line-height: 1;
}
.failed {
  color: var(--c-muted);
}
@keyframes dot-ok {
  40% { scale: 1.6; }
}
@keyframes dot-failed {
  40% { scale: 1.6; }
}
@keyframes dot-running {
  50% { scale: 1.3; }
}

@media print, (prefers-reduced-motion: reduce) {
  .model-dot {
    animation: none !important;
    transition: none !important;
  }
}
</style>
