<!--
The four thesis objectives as a row of cards. Used on slide 4 (introduce them)
and again on slide 20 (scorecard).

  <ObjectivesCard :revealed="$clicks" />            cards appear one per click
  <ObjectivesCard :status="{ 1: {...}, 2: {...} }" /> adds the three status rows

`status` is keyed by objective number; each entry sets implemented /
demonstrated / measured to true or false. Leave it out and no status is shown.
-->
<script setup lang="ts">
type Status = { implemented: boolean, demonstrated: boolean, measured: boolean }

withDefaults(defineProps<{
  /** How many cards are visible (1..4). Default: all. */
  revealed?: number
  status?: Record<number, Status>
}>(), {
  revealed: 4,
  status: undefined,
})

// TODO(João): review wording
const objectives = [
  { n: 1, title: 'Prediction', text: 'Better demand and material prediction' },
  { n: 2, title: 'Inventory', text: 'Inventory optimization' },
  { n: 3, title: 'Waste', text: 'Less waste' },
  { n: 4, title: 'Resilience', text: 'Resilience to disruptions' },
]
const rows: { key: keyof Status, label: string }[] = [
  { key: 'implemented', label: 'Implemented' },
  { key: 'demonstrated', label: 'Demonstrated' },
  { key: 'measured', label: 'Measured' },
]
</script>

<template>
  <div class="objectives">
    <div v-for="o in objectives" :key="o.n" class="objective" :class="{ on: o.n <= revealed }">
      <div class="objective-n">
        {{ o.n }}
      </div>
      <div class="objective-title">
        {{ o.title }}
      </div>
      <div class="objective-text">
        {{ o.text }}
      </div>
      <ul v-if="status?.[o.n]" class="objective-status">
        <li v-for="r in rows" :key="r.key" :class="status[o.n][r.key] ? 'yes' : 'no'">
          <span class="mark">{{ status[o.n][r.key] ? '✓' : '✗' }}</span>{{ r.label }}
        </li>
      </ul>
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
.objective-status {
  margin: 14px 0 0;
  padding: 10px 0 0;
  border-top: 1px solid var(--c-line);
  list-style: none;
  font-size: 14px;
}
.objective-status li {
  margin: 0;
  padding: 2px 0;
  list-style: none;
}
.objective-status .mark {
  display: inline-block;
  width: 1.4em;
  font-weight: 700;
}
.objective-status .yes .mark {
  color: var(--c-accent);
}
.objective-status .no {
  color: var(--c-muted);
}
.objective-status .no .mark {
  color: var(--c-warn);
}
</style>
