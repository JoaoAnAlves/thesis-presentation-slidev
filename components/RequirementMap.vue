<!--
Problems on the left, requirements on the right, joined by lines.
Requirements appear group by group as `step` rises; their lines draw in.

Usage:  <RequirementMap :step="$clicks" />

Text and the problem → requirement mapping live in data/requirements.json.
-->
<script setup lang="ts">
import data from '../data/requirements.json'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

type GroupId = keyof typeof data.groups

// ----- Geometry -----
// Both columns have a fixed height and equal-height rows, so the vertical
// centre of every row is known without measuring anything in the browser.
const H = 360 // px, height of the whole map
const LINK_W = 150 // px, width of the strip the lines are drawn in
const rowY = (index: number, count: number) => ((index + 0.5) * H) / count

const stepOf = (group: string) => data.groups[group as GroupId].step

// One curved line per requirement: from its problem's row to its own row.
// `order` is the line's position inside its group, used to stagger the draw-in.
const seen: Record<string, number> = {}
const links = data.requirements.map((req, j) => {
  const order = seen[req.group] = (seen[req.group] ?? -1) + 1
  const y1 = rowY(req.problem - 1, data.problems.length)
  const y2 = rowY(j, data.requirements.length)
  const mid = LINK_W / 2
  return {
    id: req.id,
    group: req.group,
    step: stepOf(req.group),
    order,
    d: `M0,${y1.toFixed(1)} C${mid},${y1.toFixed(1)} ${mid},${y2.toFixed(1)} ${LINK_W},${y2.toFixed(1)}`,
  }
})
</script>

<template>
  <!-- TODO(João): review wording (all text is in data/requirements.json) -->
  <div class="req-map" :style="{ height: `${H}px`, '--link-w': `${LINK_W}px` }">
    <!-- Problems -->
    <ol class="req-col problems">
      <li v-for="p in data.problems" :key="p.n">
        <span class="badge">{{ p.n }}</span>
        <span class="problem-text">
          {{ p.text }}
          <span v-if="'tag' in p" class="problem-tag">{{ p.tag }}</span>
        </span>
      </li>
    </ol>

    <!-- Connecting lines -->
    <!-- The strip is exactly LINK_W x H pixels, so SVG units equal pixels here. -->
    <svg class="links" :viewBox="`0 0 ${LINK_W} ${H}`" aria-hidden="true">
      <path
        v-for="l in links"
        :key="l.id"
        :d="l.d"
        pathLength="1"
        class="link"
        :class="[`g-${l.group}`, { on: step >= l.step }]"
        :style="{ '--order': l.order }"
      />
    </svg>

    <!-- Requirements -->
    <ol class="req-col requirements">
      <li
        v-for="r in data.requirements"
        :key="r.id"
        :class="[`g-${r.group}`, { on: step >= stepOf(r.group) }]"
      >
        <span class="req-id">Req-{{ r.id }}</span>
        <svg v-if="r.group === 'human'" class="person" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c0-4.400 3.600-8 8-8s8 3.600 8 8" />
        </svg>
        <span class="req-name">{{ r.name }}</span>
        <span class="req-group">{{ data.groups[r.group as GroupId].label }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.req-map {
  display: grid;
  grid-template-columns: 1fr var(--link-w) 1.05fr;
  font-size: 15px;
  line-height: 1.25;
}

/* Group colours, from the shared tokens. Orange and purple are reserved for charts. */
.g-forecast {
  --g: var(--c-accent);
}
.g-quality {
  --g: var(--c-slate);
}
.g-human {
  --g: var(--c-text);
}
.g-plan {
  --g: var(--c-plan);
}
.g-views {
  --g: var(--c-muted);
}

/* Columns: rows share the height equally, which is what rowY() assumes. */
.req-col {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  list-style: none;
}
.req-col li {
  flex: 1 1 0;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.problems li {
  padding-right: 10px;
}
.badge {
  flex: none;
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--c-text);
  border-radius: 50%;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 21px;
  text-align: center;
}

/* Text with its optional tag stacked underneath, so the text stays on one line. */
.problem-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}
.problem-tag {
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0.04em;
}

.requirements li {
  margin: 3px 0;
  padding: 0 12px;
  border: 1px solid var(--c-line);
  border-left: 4px solid var(--g);
  border-radius: 6px;
  background: var(--c-surface);
  opacity: 0;
  translate: 8px 0;
  /* Wait for the line to arrive before the card shows. */
  transition: opacity 0.4s ease 0.7s, translate 0.4s ease 0.7s;
}
.requirements li.on {
  opacity: 1;
  translate: 0 0;
}
.req-id {
  flex: none;
  color: var(--g);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}
.person {
  flex: none;
  width: 16px;
  height: 16px;
  fill: none;
  stroke: var(--c-text);
  stroke-width: 2;
  stroke-linecap: round;
}
.req-name {
  font-weight: 500;
}
.req-group {
  margin-left: auto;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Lines draw in from the problem side when their group is revealed.
   pathLength="1" (in the template) makes each path count as 1 unit long. One
   dash of length 1 covers it; an offset of 1 pushes the dash off the path, and
   the transition to 0 slides it on. Lines in the same group start 0.12 s apart. */
.links {
  width: 100%;
  height: 100%;
}
.link {
  fill: none;
  stroke: var(--g);
  stroke-width: 2;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.9s ease-in-out calc(var(--order) * 0.12s);
}
.link.on {
  stroke-dashoffset: 0;
}

@media print {
  .link,
  .requirements li {
    transition: none;
  }
}
</style>
