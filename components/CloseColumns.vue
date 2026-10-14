<!--
Slide 21: two columns, "Proud of" and "Would do differently".

  step 1   left column, items STAGGER_MS apart
  step 2   right column

Usage:  <CloseColumns :step="$clicks" />

DATA: data/close.json (proud[], differently[]; each item has `text` and an
optional `tag`). Only the two column titles are written here.
The layout is fixed: both columns have their place from the start.
-->
<script setup lang="ts">
import data from '../data/close.json'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const STAGGER_MS = 150

// TODO(João): review wording (column titles; items are in data/close.json)
const columns = [
  { id: 'proud', title: 'Proud of', step: 1, items: data.proud, icon: 'M5 12.500l4.500 4.500L19 7.500' }, // check
  { id: 'differently', title: 'Would do differently', step: 2, items: data.differently, icon: 'M5 12h14M13 6l6 6-6 6' }, // arrow
]
</script>

<template>
  <div class="close" :style="{ '--stagger': `${STAGGER_MS}ms` }">
    <section v-for="c in columns" :key="c.id" class="close-col" :class="[c.id, { on: step >= c.step }]">
      <h3>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="c.icon" /></svg>
        {{ c.title }}
      </h3>
      <div v-for="(item, i) in c.items" :key="item.text" class="close-item" :style="{ '--i': i }">
        <p>{{ item.text }}</p>
        <span v-if="item.tag">{{ item.tag }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.close {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 56px;
  width: 868px;
}
.close-col {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.close-col.on {
  opacity: 1;
}
.close-col h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 22px;
  padding-bottom: 10px;
  border-bottom: 1.5px solid var(--c-line);
  color: var(--c-muted);
  font-family: var(--font-body);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}
.close-col svg {
  width: 26px;
  height: 26px;
  flex: none;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.proud svg {
  stroke: var(--c-ok);
}
.close-item {
  margin-bottom: 30px;
  opacity: 0;
  translate: 0 8px;
  transition: opacity 0.4s ease, translate 0.4s ease;
}
.close-col.on .close-item {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(0.15s + var(--i) * var(--stagger));
}
.close-item p {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.25;
}
.close-item span {
  display: block;
  margin-top: 8px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 16px;
  line-height: 1.3;
}

@media print, (prefers-reduced-motion: reduce) {
  .close * {
    transition: none !important;
  }
}
</style>
