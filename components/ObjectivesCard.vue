<!--
The four thesis objectives. Used on slide 4 (introduce them) and again on
slide 20 (scorecard), so both slides show the same order and wording.

  <ObjectivesCard :revealed="$clicks" />   slide 4: a row of four cards, one per click
  <ObjectivesCard compact />               slide 20: four rows, one under the other

Compact rows have a fixed height, `--obj-row-h`, and gap, `--obj-row-gap`.
ObjectivesScorecard sets both, so its status grid lines up with the rows.

DATA: data/objectives.json (id, title, text).
-->
<script setup lang="ts">
import data from '../data/objectives.json'

withDefaults(defineProps<{
  /** How many cards are visible (1..4). Default: all. */
  revealed?: number
  compact?: boolean
}>(), {
  revealed: 4,
  compact: false,
})

const objectives = data.objectives
</script>

<template>
  <!-- TODO(João): review wording (text is in data/objectives.json) -->
  <div class="objectives" :class="{ compact }">
    <div v-for="o in objectives" :key="o.id" class="objective" :class="{ on: o.id <= revealed }">
      <div class="objective-n">
        {{ o.id }}
      </div>
      <div class="objective-title">
        {{ o.title }}
      </div>
      <div class="objective-text">
        {{ o.text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.objectives {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.objective {
  padding: 18px 16px;
  border: 1px solid var(--c-line);
  border-top: 3px solid var(--c-accent);
  border-radius: 10px;
  background: var(--c-surface);
  opacity: 0;
  translate: 0 8px;
  transition: opacity 0.4s ease, translate 0.4s ease;
}
.objective.on {
  opacity: 1;
  translate: 0 0;
}
.objective-n {
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 14px;
}
.objective-title {
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
}
.objective-text {
  margin-top: 8px;
  font-size: 16px;
  line-height: 1.35;
  color: var(--c-muted);
}

/* ---------- Compact: the same cards as rows (slide 20) ---------- */
.compact {
  grid-template-columns: 1fr;
  gap: var(--obj-row-gap, 10px);
}
.compact .objective {
  display: grid;
  grid-template-columns: 22px 1fr; /* number · title and text */
  align-content: center;
  column-gap: 8px;
  height: var(--obj-row-h, 70px);
  padding: 0 14px;
}
.compact .objective-n {
  grid-row: 1 / 3;
  align-self: start;
  margin-top: 3px;
  font-size: 16px;
}
.compact .objective-title {
  margin-top: 0;
  line-height: 1.25;
}
.compact .objective-text {
  margin-top: 2px;
  line-height: 1.25;
  white-space: nowrap;
}
</style>
