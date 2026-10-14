<!--
Slide 22: future work as numbered rows in two groups.

  step 1   group 1 (accent left border), rows STAGGER_MS apart
  step 2   group 2 (muted border)

Usage:  <FutureWorkList :step="$clicks" />

DATA: data/future-work.json. Each row has a number, a text and a `because`
chip at the right. If the row has `link` (a slide number as shown in the
footer), the chip is a link to that slide.
The layout is fixed: both groups have their place from the start.
-->
<script setup lang="ts">
import { useSlideNumber } from '../composables/useSlideNumber'
import data from '../data/future-work.json'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const STAGGER_MS = 150
const { pageOf } = useSlideNumber()

interface Item { n: number, text: string, because: string, link?: number }
const groups = data.groups.map((g, i) => ({ ...g, items: g.items as Item[], step: i + 1 }))
</script>

<template>
  <!-- TODO(João): review wording (text is in data/future-work.json) -->
  <div class="fw" :style="{ '--stagger': `${STAGGER_MS}ms` }">
    <section v-for="g in groups" :key="g.title" class="fw-group" :class="[`g${g.step}`, { on: step >= g.step }]">
      <h3>{{ g.title }}</h3>
      <div v-for="(item, i) in g.items" :key="item.n" class="fw-row" :style="{ '--i': i }">
        <b>{{ item.n }}</b>
        <p>{{ item.text }}</p>
        <span class="fw-because">
          <Link v-if="item.link" :to="pageOf(item.link)">{{ item.because }}</Link>
          <template v-else>{{ item.because }}</template>
        </span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.fw {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 868px;
}
.fw-group {
  padding: 2px 0 2px 16px;
  border-left: 4px solid var(--c-accent);
  opacity: 0;
  transition: opacity 0.4s ease;
}
/* The second group is the lighter one. */
.fw-group.g2 {
  border-left-color: var(--c-line);
}
.fw-group.on {
  opacity: 1;
}
.fw-group h3 {
  margin: 0 0 6px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
}
.fw-group.g1 h3 {
  color: var(--c-accent);
}
.fw-row {
  display: grid;
  /* number · text · because. The text takes the width of its one line; the
     chip gets what is left and wraps inside itself if it has to. */
  grid-template-columns: 34px max-content minmax(0, 1fr);
  align-items: center;
  column-gap: 8px;
  min-height: 44px;
  opacity: 0;
  translate: -8px 0;
  transition: opacity 0.35s ease, translate 0.35s ease;
}
.fw-group.on .fw-row {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(0.1s + var(--i) * var(--stagger));
}
.fw-row b {
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
}
.fw-group.g2 .fw-row b {
  color: var(--c-muted);
}
.fw-row p {
  margin: 0;
  white-space: nowrap; /* items stay on one line; the chip gives way */
  font-size: 24px;
  line-height: 1.2;
}
.fw-group.g1 .fw-row p {
  font-weight: 600;
}
.fw-because {
  padding: 1px 8px;
  border: 1px solid var(--c-line);
  border-radius: 14px;
  justify-self: end;
  max-width: 100%;
  color: var(--c-muted);
  font-size: 16px;
  line-height: 1.3;
  text-align: right;
  text-wrap: balance;
}
/* A linked chip looks like the others; underline on hover only. */
.fw-because :deep(a) {
  color: inherit;
  text-decoration: none;
}
.fw-because :deep(a:hover) {
  text-decoration: underline;
}

@media print, (prefers-reduced-motion: reduce) {
  .fw * {
    transition: none !important;
  }
}
</style>
