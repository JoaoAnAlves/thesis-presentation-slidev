<!--
Where each input of the system comes from: real, reconstructed or simulated.

  step 0   three columns, all items visible
  step 1   the "recipes" item expands into a strip that shows how a recipe is
           mined from production events; the other two columns dim
  step 2   full-width callout; the columns return to full opacity

Usage:  <DataProvenance :step="$clicks" />

The layout is fixed: the strip and the callout have their place reserved from
the start and only fade in, so nothing moves between clicks.

Every statement here comes from the thesis section on data preparation and
recipe reconstruction (Chapter 4). Do not add numbers that are not there.
-->
<script setup lang="ts">
import { stationIcons } from './stationIcons'

withDefaults(defineProps<{ step?: number }>(), { step: 0 })

// 24 × 24 line icons
const icon = {
  sales: 'M4 4v16h16M8 15l3-4 3 2 4-6',
  inventory: 'M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8',
  production: stationIcons.work,
  series: 'M2 20h20M5 20v-9M10 20V5M15 20v-6M20 20v-11',
  recipe: 'M12 3v5M12 8l-6 5M12 8l6 5M6 13v4M18 13v4M4 17h4v4H4zM16 17h4v4h-4zM10 3h4',
  shelf: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM12 7v5l3 2',
  lead: stationIcons.dock,
  lots: 'M4 5h16v6H4zM6 11h12v8H6zM10 8h4',
  scrap: 'M5 19L19 5M7.500 9.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5ZM16.500 19.500a2.500 2.500 0 1 0 0-5 2.500 2.500 0 0 0 0 5Z',
}

// TODO(João): review wording (headers, items, strip, callout)
const columns = [
  {
    id: 'real',
    title: 'Real',
    sub: 'from the factory DB',
    items: [
      { id: 'sales', icon: icon.sales, name: 'sales', detail: '2014–2026' },
      { id: 'inventory', icon: icon.inventory, name: 'inventory records', detail: '' },
      { id: 'production', icon: icon.production, name: 'production records', detail: '' },
    ],
  },
  {
    id: 'rebuilt',
    title: 'Reconstructed',
    sub: 'from real records',
    items: [
      { id: 'series', icon: icon.series, name: 'monthly demand series', detail: 'cleaned, zero-filled' },
      { id: 'recipes', icon: icon.recipe, name: 'recipes (BOM)', detail: 'mined from production events' },
      { id: 'shelf', icon: icon.shelf, name: 'shelf life', detail: 'median production → expiry' },
    ],
  },
  {
    id: 'simulated',
    title: 'Simulated',
    sub: 'not in the data',
    items: [
      { id: 'lead', icon: icon.lead, name: 'lead times', detail: 'random 2–7 days' },
      { id: 'lots', icon: icon.lots, name: 'stock lots', detail: '2 synthetic per item' },
      { id: 'scrap', icon: icon.scrap, name: 'scrap', detail: 'fixed 2%' },
    ],
  },
]

// ----- Geometry (px) -----
const W = 868
const COLS_H = 216
const LINK = 14 // connector from the Reconstructed column down to the strip
const STRIP_H = 70
const CALLOUT_GAP = 10
const CALLOUT_H = 58
const H = COLS_H + LINK + STRIP_H + CALLOUT_GAP + CALLOUT_H
const px = (n: number) => `${n}px`
</script>

<template>
  <div class="prov" :class="{ mining: step === 1, mined: step >= 1, summed: step >= 2 }" :style="{ width: px(W), height: px(H) }">
    <!-- Three columns -->
    <div class="src-cols" :style="{ height: px(COLS_H) }">
      <section v-for="c in columns" :key="c.id" class="src-col" :class="c.id">
        <header>
          <strong>{{ c.title }}</strong>
          <span>{{ c.sub }}</span>
        </header>
        <ul>
          <li v-for="it in c.items" :key="it.id" class="src-item" :class="`it-${it.id}`">
            <svg viewBox="0 0 24 24" class="src-icon" aria-hidden="true"><path :d="it.icon" /></svg>
            <div>
              <div class="src-name">
                {{ it.name }}
              </div>
              <div v-if="it.detail" class="src-detail">
                {{ it.detail }}
              </div>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Connector: Reconstructed column → strip -->
    <div class="mine-link" :style="{ top: px(COLS_H), height: px(LINK) }" />

    <!-- How a recipe is mined (step 1) -->
    <div class="mine-strip" :style="{ top: px(COLS_H + LINK), height: px(STRIP_H) }">
      <div class="mine-event">
        <span class="mine-cap">production event</span>
        <span class="deck-chip mine-guard">fish ≠ meat guard</span>
        <div class="mine-groups">
          <span>entering stock <b>→ parent</b></span>
          <span>consumed <b>→ components</b></span>
        </div>
      </div>
      <span class="mine-arrow">→</span>
      <div class="mine-step mono">
        ratio = consumed / produced
      </div>
      <span class="mine-arrow">→</span>
      <div class="mine-step">
        average over all events <span class="mine-arrow small">→</span> <b class="mono">QTY REQ</b>
      </div>
    </div>

    <!-- Takeaway (step 2) -->
    <p class="prov-callout" :style="{ top: px(COLS_H + LINK + STRIP_H + CALLOUT_GAP), height: px(CALLOUT_H) }">
      Forecasting runs on real data. Planning runs on reconstructed and simulated inputs, so it shows the logic, not the factory's real stock.
    </p>
  </div>
</template>

<style scoped>
.prov {
  position: relative;
  font-size: 14px;
  line-height: 1.3;
}

/* ---------- Columns ---------- */
.src-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.src-col {
  padding: 12px 14px;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  transition: opacity 0.4s ease;
}
/* The fill says how far from the factory's own data a column is. */
.src-col.real {
  background: color-mix(in srgb, var(--c-accent) 9%, var(--c-surface)); /* solid */
}
.src-col.rebuilt {
  background: repeating-linear-gradient(
    135deg,
    var(--c-surface) 0 7px,
    color-mix(in srgb, var(--c-muted) 14%, var(--c-surface)) 7px 9px
  ); /* diagonal stripes */
}
.src-col.simulated {
  border: 1.5px dashed var(--c-muted); /* outline only */
}
.src-col header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}
.src-col header strong {
  color: var(--c-text);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.src-col header span {
  color: var(--c-muted);
  font-size: 12.5px;
}
.src-col ul {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.src-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  margin: 0;
  padding: 3px 8px;
  border: 1.5px solid transparent;
  border-radius: 8px;
  list-style: none;
  line-height: 1.25;
  transition: border-color 0.4s ease, background-color 0.4s ease;
}
.src-icon {
  width: 22px;
  height: 22px;
  flex: none;
  fill: none;
  stroke: var(--c-muted);
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.src-name {
  font-size: 15px;
  font-weight: 600;
}
.src-detail {
  color: var(--c-muted);
  font-size: 12.5px;
}

/* ---------- Step 1: recipes expand, the other columns dim ---------- */
.mining .src-col:not(.rebuilt) {
  opacity: 0.4;
}
.mined .src-item.it-recipes {
  border-color: var(--c-accent);
  background: var(--c-surface);
}
.mined .src-item.it-recipes .src-icon {
  stroke: var(--c-accent);
}
.mine-link {
  position: absolute;
  left: 50%;
  width: 0;
  border-left: 1.5px solid var(--c-accent);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.mine-strip {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  border: 1.5px solid var(--c-accent);
  border-radius: 10px;
  background: var(--c-surface);
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.4s ease 0.15s;
}
.mined .mine-link,
.mined .mine-strip {
  opacity: 1;
}
.mono {
  font-family: var(--font-mono);
  font-size: 12.5px;
}
.mine-event {
  position: relative;
  padding: 5px 9px 7px;
  border: 1.5px solid var(--c-line);
  border-radius: 8px;
}
.mine-cap {
  display: block;
  margin-bottom: 3px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 10.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
/* Sits on the card's top-right corner, like a stamp. */
.mine-guard {
  position: absolute;
  top: -11px;
  right: 8px;
  white-space: nowrap;
}
.mine-groups {
  display: flex;
  gap: 8px;
}
.mine-groups span {
  padding: 2px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--c-muted) 12%, transparent);
  white-space: nowrap;
}
.mine-step {
  padding: 8px 10px;
  border: 1.5px solid var(--c-line);
  border-radius: 8px;
  white-space: nowrap;
}
.mine-arrow {
  color: var(--c-accent);
  font-size: 18px;
  line-height: 1;
}
.mine-arrow.small {
  font-size: 13px;
}

/* ---------- Step 2: takeaway ---------- */
.prov-callout {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 16px;
  border-left: 4px solid var(--c-accent);
  border-radius: 0 8px 8px 0;
  background: var(--c-surface);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.summed .prov-callout {
  opacity: 1;
}

@media print, (prefers-reduced-motion: reduce) {
  .prov * {
    transition: none !important;
  }
}
</style>
