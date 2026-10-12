<!--
Walk-forward validation as a schematic: no data, only the mechanism.

  step 0   a month timeline with fold 1: train bar, cut-off line, test window
  step 1   folds 2–6 stack downward; in each one the cut-off moves one month
           right and the train bar grows; every fold drops an error dot into
           the column on the right
  step 2   the dots merge into one RMSE chip, and the chips of the other five
           models appear under it

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
const LABEL_W = 70 // "fold 1" column
const MONTH = 28 // width of one month
const MONTHS = 20 // months on the timeline; the last one is the target month
const TL_X = LABEL_W // timeline starts here
const TL_W = MONTHS * MONTH
const FIRST_CUT = MONTHS - 12 // the cut-off starts twelve months before the target
const ROW_Y = 48
const ROW_PITCH = 40
const BAR_H = 26
const SHOWN = 6 // folds drawn; the label below says there are 12
const DOT_X = TL_X + TL_W + 26 // centre of the error-dot column
const CHIP_X = DOT_X + 34
const CHIP_W = W - CHIP_X
const CHIP_H = 30
const px = (n: number) => `${n}px`

const folds = Array.from({ length: SHOWN }, (_, i) => {
  const cut = FIRST_CUT + i // months of training data in this fold
  return {
    n: i + 1,
    y: ROW_Y + i * ROW_PITCH,
    trainW: cut * MONTH,
    cutX: TL_X + cut * MONTH,
    testW: (MONTHS - cut) * MONTH,
    delay: `${i * FOLD_GAP}s`,
  }
})

// TODO(João): review wording (all labels on this slide)
const models = ['RF', 'XGBoost', 'LightGBM', 'Prophet', 'Chronos', 'Granite']
</script>

<template>
  <div class="wf" :class="{ run: step >= 1, done: step >= 2 }" :style="{ width: px(W), height: px(H) }">
    <!-- Month axis -->
    <div class="wf-axis" :style="{ left: px(TL_X), width: px(TL_W), top: px(ROW_Y - 14) }">
      <i v-for="m in MONTHS + 1" :key="m" :style="{ left: px((m - 1) * MONTH) }" />
    </div>
    <span class="wf-axis-label" :style="{ left: px(TL_X) }">months →</span>
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
      <!-- This fold's error. At click 2 every dot moves to the first chip. -->
      <i class="wf-dot" :style="{ 'left': px(DOT_X - 6), '--to-x': px(CHIP_X + 17 - DOT_X), '--to-y': px(-(f.n - 1) * ROW_PITCH) }" />
    </div>
    <span class="wf-more" :style="{ left: px(TL_X), top: px(ROW_Y + SHOWN * ROW_PITCH) }">… 12 folds</span>
    <span class="wf-dot-head" :style="{ left: px(DOT_X) }">error</span>

    <!-- One RMSE per model (click 2) -->
    <ul class="wf-chips" :style="{ left: px(CHIP_X), width: px(CHIP_W) }">
      <li
        v-for="(m, i) in models" :key="m"
        :style="{ 'top': px(ROW_Y + i * ROW_PITCH + (BAR_H - CHIP_H) / 2), 'height': px(CHIP_H), '--d': `${i ? 0.5 + i * 0.1 : 0.3}s` }"
      >
        <i />RMSE · {{ m }}
      </li>
    </ul>
    <span class="wf-next" :style="{ top: px(ROW_Y + SHOWN * ROW_PITCH) }">→ weights (next slide)</span>
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
.wf-axis {
  height: 8px;
  border-bottom: 1.5px solid var(--chart-axis);
}
.wf-axis i {
  position: absolute;
  bottom: 0;
  width: 0;
  height: 6px;
  border-left: 1.5px solid var(--chart-axis);
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
.wf-dot {
  top: 7px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--chart-model);
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
  translate: -50% 0;
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
.run .wf-dot {
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
.wf .wf-dot {
  transition: translate 0.45s ease, opacity 0.2s ease 0.35s;
}
.done .wf-dot {
  translate: var(--to-x) var(--to-y);
  opacity: 0;
  animation: none;
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
  padding: 0 11px;
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
  width: 12px;
  height: 12px;
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
  transition-delay: 1.3s;
}

@media print, (prefers-reduced-motion: reduce) {
  .wf * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
