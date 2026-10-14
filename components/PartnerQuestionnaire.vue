<!--
Backup b13: the ten questions put to the partner, with a short summary of
each answer. Ten questions do not fit on one slide at a readable size, so the
backup is split in two (B13a and B13b).

Usage:  <PartnerQuestionnaire :part="1" />   groups 1–2 (Q1–Q5)
        <PartnerQuestionnaire :part="2" />   groups 3–4 (Q6–Q10)

DATA: data/questionnaire.json (groups → items). Each slide shows two groups,
one per column.

TODO(João): check wording against the thesis (§5.5, Appendix A), don't strengthen it.
-->
<script setup lang="ts">
import data from '../data/questionnaire.json'

const props = withDefaults(defineProps<{ part?: 1 | 2 }>(), { part: 1 })

const PER_SLIDE = 2 // groups on one slide, one per column
const groups = data.groups.slice((props.part - 1) * PER_SLIDE, props.part * PER_SLIDE)
</script>

<template>
  <div class="pq">
    <section v-for="g in groups" :key="g.title">
      <h3>{{ g.title }}</h3>
      <dl v-for="item in g.items" :key="item.q">
        <dt><span>{{ item.q }}</span>{{ item.question }}</dt>
        <dd>{{ item.answer }}</dd>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.pq {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.3;
}
.pq h3 {
  margin: 0 0 10px;
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
}
.pq dl {
  margin: 0 0 11px;
}
.pq dt {
  display: flex;
  gap: 8px;
  font-weight: 600;
}
.pq dt span {
  flex: 0 0 36px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-weight: 400;
}
.pq dd {
  margin: 2px 0 0 44px;
  color: var(--c-muted);
}
</style>
