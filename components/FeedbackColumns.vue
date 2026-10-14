<!--
The industrial partner's feedback in three columns, one per click.

  step 1   "What they valued"          green checks
  step 2   "How they judged it"
  step 3   "What they asked for next", plus one line under the column

Usage:  <FeedbackColumns :step="$clicks" />

Every item carries a small grey tag with the question it summarizes (Q2, Q7…)
and, when the data has one, a grey note on a line of its own.

The layout is fixed: all three columns have their place from the start and
only fade in. Items inside a column appear STAGGER_MS apart.

DATA: data/feedback.json. Nothing is typed here except the column titles and
the closing line. If `ratings` is filled there (question → score 1–5), five
small dots appear under the column that holds that question; while it is
null, nothing shows.

TODO(João): verify wording against thesis questionnaire section; don't strengthen it.
-->
<script setup lang="ts">
import feedback from '../data/feedback.json'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const STAGGER_MS = 150

interface Item { text: string, q: string, note?: string }
const ratings = feedback.ratings as Record<string, number> | null

// TODO(João): review wording (column titles, closing line)
const columns = [
  { id: 'valued', title: 'What they valued', step: 1, items: feedback.valued as Item[], closing: '' },
  { id: 'judged', title: 'How they judged it', step: 2, items: feedback.judged as Item[], closing: '' },
  { id: 'next', title: 'What they asked for next', step: 3, items: feedback.next as Item[], closing: 'Both are in my future work' },
].map(c => ({
  ...c,
  // one rating per question of this column, if the data file has scores
  scores: [...new Set(c.items.map(i => i.q))].filter(q => ratings?.[q] != null).map(q => ({ q, score: ratings![q] })),
}))

// 24 × 24 line icons
const icons: Record<string, string> = {
  valued: 'M5 12.500l4.500 4.500L19 7.500', // check
  judged: 'M4 19h16M7 19v-6M12 19V6M17 19v-9', // figures
  next: 'M5 12h14M13 6l6 6-6 6', // arrow
}
</script>

<template>
  <div class="fb" :style="{ '--stagger': `${STAGGER_MS}ms` }">
    <div v-for="c in columns" :key="c.id" class="fb-slot" :class="[c.id, { on: step >= c.step }]">
      <section class="fb-col">
        <h3>{{ c.title }}</h3>
        <ul>
          <li v-for="(item, i) in c.items" :key="item.text" :style="{ '--i': i }">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="icons[c.id]" /></svg>
            <div class="fb-text">
              {{ item.text }}
              <span v-if="item.note" class="fb-note">{{ item.note }}</span>
            </div>
            <span class="fb-q">{{ item.q }}</span>
          </li>
        </ul>
        <!-- Only when feedback.json has scores. -->
        <p v-for="r in c.scores" :key="r.q" class="fb-rating">
          <i v-for="n in 5" :key="n" :class="{ filled: n <= r.score }" />
          <span>{{ r.q }} · {{ r.score }} / 5</span>
        </p>
      </section>
      <p v-if="c.closing" class="fb-closing">
        {{ c.closing }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.fb {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  width: 868px;
  font-size: 18px;
  line-height: 1.3;
}
/* A slot = the column box plus the optional line under it. */
.fb-slot {
  opacity: 0;
  transition: opacity 0.4s ease;
}
.fb-slot.on {
  opacity: 1;
}
.fb-col {
  height: 268px;
  padding: 16px 14px 14px 16px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
}
.fb-col h3 {
  margin: 0 0 14px;
  color: var(--c-muted);
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
.fb-col ul {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.fb-col li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  list-style: none;
  font-weight: 600;
  line-height: 1.3; /* the theme's list line height is much taller */
  opacity: 0;
  translate: 0 6px;
  transition: opacity 0.35s ease, translate 0.35s ease;
}
/* Items follow their column in, one after the other. */
.fb-slot.on li {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(0.15s + var(--i) * var(--stagger));
}
.fb-col svg {
  width: 22px;
  height: 22px;
  flex: none;
  margin-top: 1px;
  fill: none;
  stroke: var(--c-accent);
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.valued .fb-col svg {
  stroke: var(--c-ok);
}

/* Text takes the room; the question tag stays at the right end of the line. */
.fb-text {
  flex: 1;
}
.fb-note {
  display: block;
  margin-top: 2px;
  color: var(--c-muted);
  font-size: 16px;
  font-weight: 400;
}
.fb-q {
  flex: none;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 400;
}
.fb-closing {
  margin: 10px 0 0 2px;
  color: var(--c-accent);
  font-size: 17px;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.fb-slot.on .fb-closing {
  opacity: 1;
  transition-delay: 0.6s;
}

/* Optional dot rating */
.fb-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 16px 0 0;
  color: var(--c-muted);
  font-size: 16px;
}
.fb-rating i {
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--c-accent);
  border-radius: 50%;
}
.fb-rating i.filled {
  background: var(--c-accent);
}
.fb-rating span {
  margin-left: 6px;
}

@media print, (prefers-reduced-motion: reduce) {
  .fb * {
    transition: none !important;
  }
}
</style>
