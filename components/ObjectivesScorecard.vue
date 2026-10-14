<!--
Slide 20: the four objectives (same rows as slide 4's cards) with a status
grid to their right: Implemented · Demonstrated · Measured.

  step 0   only the four objective rows
  step 1   Implemented column: green ✓ + what was built
  step 2   Demonstrated column: green ✓ + where it was shown
  step 3   Measured column: ◐ in accent for "partial", grey ✗ for "no"
           (grey on purpose: not measured is a matter of scope, not a failure)
  step 4   one closing line across the slide

Usage:  <ObjectivesScorecard :step="$clicks" />

The layout is fixed: every cell has its place from the start and only fades
in. Within a column the rows appear STAGGER_MS apart.

DATA: data/objectives.json. TODO(João): verify against thesis Ch. 6.
-->
<script setup lang="ts">
import data from '../data/objectives.json'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const STAGGER_MS = 120
const ROW_H = 70
const ROW_GAP = 10

type Mark = 'yes' | 'partial' | 'no'
// TODO(João): review wording (column titles, closing line)
const columns = [
  { key: 'implemented', title: 'Implemented', step: 1 },
  { key: 'demonstrated', title: 'Demonstrated', step: 2 },
  { key: 'measured', title: 'Measured', step: 3 },
] as const

// Implemented and Demonstrated are plain texts (always ✓); Measured carries its own status.
function cell(o: (typeof data.objectives)[number], key: (typeof columns)[number]['key']): { mark: Mark, text: string } {
  const v = o[key]
  return typeof v === 'string' ? { mark: 'yes', text: v } : { mark: v.status as Mark, text: v.text }
}
</script>

<template>
  <div class="sc" :style="{ '--obj-row-h': `${ROW_H}px`, '--obj-row-gap': `${ROW_GAP}px`, '--stagger': `${STAGGER_MS}ms` }">
    <div class="sc-objectives">
      <ObjectivesCard compact />
    </div>

    <div v-for="c in columns" :key="c.key" class="sc-col" :class="{ on: step >= c.step }">
      <h3>{{ c.title }}</h3>
      <div v-for="(o, i) in data.objectives" :key="o.id" class="sc-cell" :class="cell(o, c.key).mark" :style="{ '--i': i }">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path v-if="cell(o, c.key).mark === 'yes'" d="M5 12.500l4.500 4.500L19 7.500" />
          <template v-else-if="cell(o, c.key).mark === 'partial'">
            <circle cx="12" cy="12" r="8" />
            <path class="half" d="M12 4a8 8 0 0 0 0 16Z" />
          </template>
          <path v-else d="M7 7l10 10M17 7L7 17" />
        </svg>
        <span>{{ cell(o, c.key).text }}</span>
      </div>
    </div>

    <p class="sc-closing" :class="{ on: step >= 4 }">
      Every objective has a working mechanism. None is yet measured in real operation.
    </p>
  </div>
</template>

<style scoped>
.sc {
  display: grid;
  grid-template-columns: 330px repeat(3, minmax(0, 1fr)); /* objectives · three status columns */
  column-gap: 14px;
  width: 868px;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.3;
}
/* The objective rows start under the column titles. */
.sc-objectives {
  padding-top: 30px;
}

.sc-col {
  opacity: 0;
  transition: opacity 0.3s ease;
}
.sc-col.on {
  opacity: 1;
}
.sc-col h3 {
  height: 30px;
  margin: 0;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 22px;
  text-transform: uppercase;
}
.sc-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  height: var(--obj-row-h);
  margin-bottom: var(--obj-row-gap);
  padding: 0 4px 0 10px;
  border-left: 1.5px solid var(--c-line);
  opacity: 0;
  translate: -8px 0;
  transition: opacity 0.35s ease, translate 0.35s ease;
}
.sc-col.on .sc-cell {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(var(--i) * var(--stagger));
}
.sc-cell svg {
  width: 24px;
  height: 24px;
  flex: none;
  fill: none;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.sc-cell.yes svg {
  stroke: var(--c-ok);
}
/* Half-filled circle: partly measured. */
.sc-cell.partial svg {
  stroke: var(--c-accent);
  stroke-width: 2;
}
.sc-cell.partial .half {
  fill: var(--c-accent);
  stroke: none;
}
/* Grey, not red or amber: a matter of scope, not a failure. */
.sc-cell.no {
  color: var(--c-muted);
}
.sc-cell.no svg {
  stroke: var(--c-muted);
}

.sc-closing {
  grid-column: 1 / -1;
  margin: 6px 0 0;
  padding-top: 10px;
  border-top: 1.5px solid var(--c-line);
  color: var(--c-text);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.sc-closing.on {
  opacity: 1;
}

@media print, (prefers-reduced-motion: reduce) {
  .sc * {
    transition: none !important;
  }
}
</style>
