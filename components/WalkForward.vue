<!--
Walk-forward validation as a schematic: no data, only the mechanism.

  step 0   a month timeline with fold 1: train bar, cut-off line, test window
  step 1   folds 2–6 stack downward; in each one the cut-off moves one month
           right and the train bar grows; every fold drops a row of six error
           dots (one per model) into the column on the right
  step 2   the dots flow, one model column at a time, into a box that holds
           one RMSE chip per model (the average over all folds)

Usage:  <WalkForward :step="$clicks" />

The layout is fixed: every part has its place from the start and only fades or
slides in, so nothing moves between clicks.

How the animation works: plain CSS. Each fold gets a delay (`--d`) from its
row number, so the folds play one after the other. To retime, change FOLD_GAP.

Source: thesis §4.1.2 (refinement loop, walk-forward validation).
-->
<script setup lang="ts">
withDefaults(defineProps<{ step?: number }>(), { step: 0 })

const FOLD_GAP = 0.55 // seconds between two folds at click 1

// ----- Geometry (px) -----
const W = 868
const H = 336
const LABEL_W = 62 // "fold 1" column
const BREAK = 36 // axis break at the left: the history is longer than drawn
const MONTH = 23 // width of one month
const MONTHS = 20 // months drawn after the break; the last one is the target month
const TL_X = LABEL_W // timeline starts here
const TL_W = BREAK + MONTHS * MONTH
const FIRST_CUT = MONTHS - 12 // the cut-off starts twelve months before the target
const ROW_Y = 48
const ROW_PITCH = 40
const BAR_H = 26
const SHOWN = 6 // folds drawn; the label below says there are 12
// Error dots: one per model in every fold
const DOT = 8
const DOT_PITCH = 12
const DOTS_X = TL_X + TL_W + 16
// Box with one RMSE chip per model. Centred vertically on purpose, with its
// own chip spacing, so a chip never lines up with a fold row.
const BOX_X = DOTS_X + 6 * DOT_PITCH + 20
const BOX_W = W - BOX_X
const BOX_PAD = 10
const BOX_HEAD = 26
const CHIP_H = 26
const CHIP_PITCH = 31
const BOX_H = BOX_PAD + BOX_HEAD + 6 * CHIP_PITCH - (CHIP_PITCH - CHIP_H) + BOX_PAD
const NEXT_H = 26 // "→ weights" line under the box
const BOX_Y = Math.round((H - BOX_H - NEXT_H) / 2)
const chipY = (j: number) => BOX_Y + BOX_PAD + BOX_HEAD + j * CHIP_PITCH
const px = (n: number) => `${n}px`

const folds = Array.from({ length: SHOWN }, (_, i) => {
  const cut = FIRST_CUT + i // months of training data drawn in this fold
  const y = ROW_Y + i * ROW_PITCH
  return {
    n: i + 1,
    y,
    trainW: BREAK + cut * MONTH,
    cutX: TL_X + BREAK + cut * MONTH,
    testW: (MONTHS - cut) * MONTH,
    delay: `${i * FOLD_GAP}s`,
    // Where each of the six dots has to travel at click 2: to the dot of its model's chip.
    dots: Array.from({ length: 6 }, (_, j) => ({
      x: DOTS_X + j * DOT_PITCH,
      toX: BOX_X + BOX_PAD + 17 - (DOTS_X + j * DOT_PITCH + DOT / 2),
      toY: chipY(j) + CHIP_H / 2 - (y + BAR_H / 2),
    })),
  }
})

// TODO(João): review wording (all labels on this slide)
const models = ['RF', 'XGBoost', 'LightGBM', 'Prophet', 'Chronos', 'Granite']
</script>

<template>
  <div class="wf" :class="{ run: step >= 1, done: step >= 2 }" :style="{ width: px(W), height: px(H) }">
    <!-- Month axis, with a break at the left -->
    <svg class="wf-axis" :width="TL_W" height="20" :style="{ left: px(TL_X), top: px(ROW_Y - 26) }" aria-hidden="true">
      <path :d="`M0 14H13M25 14H${TL_W}M10 19l6 -10M19 19l6 -10`" />
      <path v-for="m in MONTHS + 1" :key="m" :d="`M${Math.min(BREAK + (m - 1) * MONTH, TL_W - 0.75)} 14v-6`" />
    </svg>
    <span class="wf-axis-label" :style="{ left: px(TL_X) }">2014 ⋯</span>
    <span class="wf-axis-label cut" :style="{ left: px(folds[0].cutX) }">cut-off</span>
    <span class="wf-axis-label target" :style="{ left: px(TL_X + TL_W) }">target month</span>

    <!-- Folds -->
    <div
      v-for="f in folds" :key="f.n" class="wf-fold" :class="{ first: f.n === 1 }"
      :style="{ 'top': px(f.y), 'height': px(BAR_H), '--d': f.delay }"
    >
      <span class="wf-fold-label">fold {{ f.n }}</span>
      <div class="wf-train" :style="{ 'left': px(TL_X), 'width': px(f.trainW), '--from': (f.trainW - MONTH) / f.trainW }">
        <template v-if="f.n === 1">
          train on the past
        </template>
      </div>
      <div class="wf-test" :style="{ left: px(f.cutX), width: px(f.testW) }">
        <template v-if="f.n === 1">
          test on unseen months
        </template>
      </div>
      <i class="wf-cut" :style="{ 'left': px(f.cutX), '--shift': px(-MONTH) }" />
      <!-- This fold's errors, one dot per model. At click 2 each dot moves to its model's chip. -->
      <div class="wf-dots">
        <i
          v-for="(d, j) in f.dots" :key="j" class="wf-dot"
          :style="{ 'left': px(d.x), '--to-x': px(d.toX), '--to-y': px(d.toY), '--col': `${j * 0.12}s` }"
        />
      </div>
    </div>
    <span class="wf-more" :style="{ left: px(TL_X), top: px(ROW_Y + SHOWN * ROW_PITCH) }">… 12 folds</span>
    <span class="wf-dot-head" :style="{ left: px(DOTS_X) }">error · 6 models</span>

    <!-- One RMSE per model (click 2) -->
    <div class="wf-box" :style="{ left: px(BOX_X), top: px(BOX_Y), width: px(BOX_W), height: px(BOX_H) }">
      average over 12 folds
    </div>
    <ul class="wf-chips" :style="{ left: px(BOX_X + BOX_PAD), width: px(BOX_W - 2 * BOX_PAD) }">
      <li v-for="(m, j) in models" :key="m" :style="{ 'top': px(chipY(j)), 'height': px(CHIP_H), '--d': `${0.4 + j * 0.12}s` }">
        <i />RMSE · {{ m }}
      </li>
    </ul>
    <span class="wf-next" :style="{ top: px(BOX_Y + BOX_H + 6) }">→ weights (next slide)</span>
  </div>
</template>

<style scoped>
.wf {
  position: relative;
  font-size: 16px; /* deck minimum for any text */
  line-height: 1.2;
}
.wf > *,
.wf-fold > * {
  position: absolute;
}

/* ---------- Month axis ---------- */
.wf-axis path {
  fill: none;
  stroke: var(--chart-axis);
  stroke-width: 1.5;
}
.wf-axis-label {
  top: 0;
  color: var(--c-muted);
  white-space: nowrap;
}
.wf-axis-label.cut {
  color: var(--c-text);
  font-weight: 600;
  translate: -50% 0;
}
.wf-axis-label.target {
  translate: -100% 0;
}

/* ---------- One fold ---------- */
.wf-fold {
  left: 0;
  width: 100%;
}
.wf-fold-label {
  left: 0;
  top: 0;
  line-height: 26px;
  color: var(--c-muted);
  white-space: nowrap;
}
.wf-train,
.wf-test {
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  padding-left: 10px;
  white-space: nowrap;
}
.wf-train {
  border-radius: 6px 0 0 6px;
  background: color-mix(in srgb, var(--c-muted) 32%, var(--c-surface));
  transform-origin: left center;
}
.wf-test {
  border: 2px solid var(--c-accent);
  border-radius: 0 6px 6px 0;
  background: color-mix(in srgb, var(--c-accent) 8%, transparent);
  color: var(--c-accent);
  font-weight: 600;
}
.wf-cut {
  top: -5px;
  bottom: -5px;
  width: 0;
  margin-left: -1.5px;
  border-left: 3px solid var(--c-text);
}
/* Fold 1's line reaches up to the axis, where its label is. */
.wf-fold.first .wf-cut {
  top: -26px;
}
.wf-dots {
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.wf-dot {
  position: absolute;
  top: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--chart-model);
}
.wf-dots {
  opacity: 0;
}
.wf-dot-head,
.wf-more {
  color: var(--c-muted);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.wf-dot-head {
  top: 0;
}

/* ---------- Step 1: folds 2–6 stack, each drops its error dot ---------- */
/* The final state is plain CSS; the animations only play the way into it
   (fill mode `backwards` holds each start state during its delay). */
.wf-fold:not(.first) {
  opacity: 0;
}
.run .wf-fold {
  opacity: 1;
}
.run .wf-fold:not(.first) {
  animation: wf-in 0.3s ease var(--d) backwards;
}
.run .wf-fold:not(.first) .wf-train {
  animation: wf-grow 0.45s ease var(--d) backwards;
}
.run .wf-fold:not(.first) .wf-cut {
  animation: wf-slide 0.45s ease var(--d) backwards;
}
.run .wf-dots {
  opacity: 1;
  animation: wf-drop 0.4s ease calc(var(--d) + 0.3s) backwards;
}
.run .wf-dot-head {
  opacity: 1;
}
.run .wf-more {
  opacity: 1;
  transition-delay: 3.3s;
}
.done .wf-more {
  transition-delay: 0s;
}
@keyframes wf-in {
  from { opacity: 0; }
}
@keyframes wf-grow {
  from { transform: scaleX(var(--from)); }
}
@keyframes wf-slide {
  from { translate: var(--shift) 0; }
}
@keyframes wf-drop {
  from { opacity: 0; translate: -30px 0; }
}

/* ---------- Step 2: the dots become one RMSE per model ---------- */
/* Each dot travels to its model's chip; the columns leave one after the other. */
.wf .wf-dot {
  transition: translate 0.5s ease, opacity 0.2s ease 0.4s;
}
.done .wf-dots {
  animation: none;
}
.done .wf-dot {
  translate: var(--to-x) var(--to-y);
  opacity: 0;
  transition-delay: var(--col), calc(var(--col) + 0.4s);
}
.wf-box {
  padding: 8px 10px 0;
  border: 1.5px solid var(--c-line);
  border-radius: 10px;
  background: var(--c-surface);
  color: var(--c-muted);
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.done .wf-box {
  opacity: 1;
}
.wf-chips {
  top: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}
.wf-chips li {
  position: absolute;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0 10px;
  border: 1.5px solid var(--chart-model);
  border-radius: 999px;
  background: color-mix(in srgb, var(--chart-model) 12%, var(--c-surface));
  font-weight: 600;
  white-space: nowrap;
  list-style: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.wf-chips i {
  width: 10px;
  height: 10px;
  flex: none;
  border-radius: 50%;
  background: var(--chart-model);
}
.wf-next {
  right: 0;
  color: var(--c-accent);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.done .wf-chips li {
  opacity: 1;
  transition-delay: var(--d);
}
.done .wf-next {
  opacity: 1;
  transition-delay: 1.4s;
}

@media print, (prefers-reduced-motion: reduce) {
  .wf * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
