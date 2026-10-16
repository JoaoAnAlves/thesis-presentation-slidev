<!--
Bill-of-materials explosion: the product on the left, its components to the
right, one more column for each level of the recipe.

Usage:
  <BomTree :expanded="$clicks >= 1" :focus="$clicks >= 2" :dim-others="$clicks === 2" :show-routes="$clicks >= 3" />

  expanded     branches appear one after the other (STAGGER_MS apart)
  focus        outlines the component that FefoLots is about (planning.fefo.item)
  dimOthers    fades every other component to 35%
  showRoutes   adds "→ purchasing" / "→ production" to each component
  applyScrapPerLevel   (default true) scrap is added again at every level of
               the recipe; false adds it only on the first level. Pass the same
               value to FefoLots and OrderTimeline.

TODO(João): verify formula vs intelligent_planner_service_final.py
(scrap on forecast only? scrap re-applied at each BOM level?)

Layout: every node comes from composables/usePlanning.ts with a column (`depth`)
and a `row`. Position is simply  x = COL_X[depth],  y = row × ROW_PITCH.  The
root is centred on the rows. Connectors are drawn from the right edge of the
parent to the left edge of the child. Nothing is positioned by hand, so a
different recipe in the data file lays itself out.

All quantities are computed (parent qty × qty per unit, plus scrap).

DATA: data/sku.json → planning, an ILLUSTRATIVE example (own plan of 1,000
units, invented recipe). The label in the top-right corner says so on screen;
it sits in the free cell of row 0, level 2, so it never covers a node.
-->
<script setup lang="ts">
import { fmtPct } from '../composables/useFormat'
import { qty as fmt, usePlanning } from '../composables/usePlanning'

const props = withDefaults(defineProps<{
  expanded?: boolean
  focus?: boolean
  dimOthers?: boolean
  showRoutes?: boolean
  applyScrapPerLevel?: boolean
}>(), { expanded: true, focus: false, dimOthers: false, showRoutes: false, applyScrapPerLevel: true })

const STAGGER_MS = 150

const { product, plan, planUnit, scrap, tree, rows, fefo, isIllustrative } = usePlanning({ applyScrapPerLevel: props.applyScrapPerLevel })

// ----- Geometry (px) -----
const W = 868
const ROOT_W = 160 // fits "Example product" (≈131 px bold) on one line
const ROOT_H = 76
const COL_X = [0, 184, 544] // left edge of the root, level 1, level 2
const COL_W = [ROOT_W, 336, 324] // level 1 is wider: its lines carry the plan ("1,000 × …", ≈326 px with padding)
const NODE_H = 50
const ROW_PITCH = 58
const TREE_H = (rows - 1) * ROW_PITCH + NODE_H
const NOTE_H = 24 // scrap note under the tree
const H = TREE_H + NOTE_H
const px = (n: number) => `${n}px`

const rootY = (TREE_H - ROOT_H) / 2
const nodeY = (row: number) => row * ROW_PITCH
const factor = (1 + scrap).toFixed(2)
const percent = fmtPct(scrap, 0) // '2%'

const nodes = tree.map((n) => {
  const parent = tree.find(t => t.id === n.parentId)
  // Connector: leaves the parent's right edge, arrives at this node's left edge.
  const x0 = parent ? COL_X[parent.depth] + COL_W[parent.depth] : ROOT_W
  const y0 = parent ? nodeY(parent.row) + NODE_H / 2 : rootY + ROOT_H / 2
  const x1 = COL_X[n.depth]
  const y1 = nodeY(n.row) + NODE_H / 2
  const mid = (x0 + x1) / 2
  return {
    ...n,
    x: COL_X[n.depth],
    y: nodeY(n.row),
    w: COL_W[n.depth],
    link: `M${x0} ${y0}C${mid} ${y0} ${mid} ${y1} ${x1} ${y1}`,
    formula: `${fmt(n.parentQty)} × ${n.qtyPerUnit.toFixed(2)} ${n.unit}`,
    result: `${fmt(n.gross)} ${n.unit}`,
    route: n.type === 'raw' ? '→ purchasing' : '→ production',
    isFocus: n.id === fefo.item.id,
  }
})
</script>

<template>
  <!-- TODO(João): review wording (root label, illustrative label, scrap label, routes) -->
  <div
    class="bom" :class="{ expanded, focus, dim: dimOthers, routes: showRoutes }"
    :style="{ 'width': px(W), 'height': px(H), '--stagger': `${STAGGER_MS}ms` }"
  >
    <span class="bom-scrap" :style="{ left: px(COL_X[1]), top: px(TREE_H + 4) }">× {{ factor }} = {{ percent }} scrap</span>
    <p v-if="isIllustrative" class="bom-label" :style="{ width: px(COL_W[2]), height: px(NODE_H) }">
      <span>Illustrative example —</span>
      <span>not company data</span>
    </p>

    <svg class="bom-links" :width="W" :height="H" aria-hidden="true">
      <path v-for="n in nodes" :key="n.id" :d="n.link" :class="{ on: n.isFocus }" :style="{ '--i': n.order }" />
    </svg>

    <div class="bom-root" :style="{ top: px(rootY), width: px(ROOT_W), height: px(ROOT_H) }">
      <b>{{ product }}</b>
      <span>plan <b>{{ fmt(plan) }} {{ planUnit }}</b></span>
    </div>

    <div
      v-for="n in nodes" :key="n.id" class="bom-node" :class="[n.type, { on: n.isFocus }]"
      :style="{ 'left': px(n.x), 'top': px(n.y), 'width': px(n.w), 'height': px(NODE_H), '--i': n.order }"
    >
      <p class="bom-name">
        {{ n.name }}
        <span class="bom-route">{{ n.route }}</span>
      </p>
      <p class="bom-formula">
        {{ n.formula }}<i v-if="n.scrapped">(+{{ percent }} scrap)</i> = <b>{{ n.result }}</b>
      </p>
    </div>
  </div>
</template>

<style scoped>
.bom {
  position: relative;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.25;
}
.bom > * {
  position: absolute;
}
.bom p {
  margin: 0;
  white-space: nowrap;
}
.bom-scrap {
  color: var(--c-muted);
  opacity: 0;
  transition: opacity 0.4s ease;
}
.bom-label {
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  color: var(--c-muted);
  font-style: italic;
  text-align: right;
}

/* ---------- Root ---------- */
.bom-root {
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 10px;
  border-radius: 10px;
  background: var(--c-plan);
  color: var(--c-bg);
  white-space: nowrap;
}
.bom-root b {
  font-weight: 700;
}

/* ---------- Components ---------- */
.bom-links {
  left: 0;
  top: 0;
}
.bom-links path {
  fill: none;
  stroke: var(--c-line);
  stroke-width: 2;
  transition: stroke 0.4s ease;
}
.bom-node {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 12px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
  transition: border-color 0.4s ease;
}
/* Made in the factory, not bought. */
.bom-node.intermediate {
  border-style: dashed;
}
.bom-name {
  font-weight: 600;
}
.bom-route {
  margin-left: 6px;
  color: var(--c-muted);
  font-weight: 400;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.bom-formula {
  font-family: var(--font-mono);
  word-spacing: -3px; /* narrower gaps, so thousands still fit on one line */
  white-space: nowrap;
}
.bom-formula i {
  margin: 0 2px 0 6px;
  color: var(--c-muted);
  font-family: var(--font-body);
  font-style: normal;
}
.bom-formula b {
  color: var(--c-plan);
  font-weight: 600;
}

/* Collapsed: branches are hidden slightly to the left. Expanded: each one
   slides in after the one before it (--i is its place in the order). */
.bom-links path,
.bom-node {
  opacity: 0;
}
.bom-node {
  translate: -14px 0;
  transition: opacity 0.35s ease, translate 0.35s ease, border-color 0.4s ease;
}
.bom-links path {
  transition: opacity 0.35s ease, stroke 0.4s ease;
}
.expanded .bom-links path,
.expanded .bom-node {
  opacity: 1;
  translate: 0 0;
  transition-delay: calc(var(--i) * var(--stagger)), calc(var(--i) * var(--stagger)), 0s;
}
.expanded .bom-scrap {
  opacity: 1;
}

/* Focus on one component; the others can be dimmed. */
.focus .bom-node.on {
  border: 2px solid var(--c-plan);
}
.focus .bom-links path.on {
  stroke: var(--c-plan);
}
.expanded.dim .bom-node:not(.on),
.expanded.dim .bom-links path:not(.on) {
  opacity: 0.35;
  transition-delay: 0s;
}
.routes .bom-route {
  opacity: 1;
}

@media print, (prefers-reduced-motion: reduce) {
  .bom * {
    transition: none !important;
  }
}
</style>
