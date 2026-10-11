<!--
Act divider (dark): act number, title, the question the act answers, what it
covers, a five-dot progress row, and the HeroLoop as a map of the system.
Slides using this layout are skipped by the footer numbering (see slide-bottom.vue).

Frontmatter (Slidev passes these keys to the layout as props):

  layout: section
  act: 3                               # 1..5
  title: How it works                  # read from $frontmatter, see note below
  question: How does one product's history become a purchase plan?
  covers: [Data, Models, Weighting, Planning]
  loopMode: live                       # live | blueprint | stress
  focus: [data, models, forecast, plan]
  labeled: false
  labelOpacity: 1
-->
<script setup lang="ts">
withDefaults(defineProps<{
  act?: number
  question?: string
  covers?: string[]
  loopMode?: 'live' | 'blueprint' | 'stress'
  focus?: ('data' | 'models' | 'forecast' | 'plan' | 'factory')[]
  labeled?: boolean
  labelOpacity?: number
}>(), {
  act: 1,
  question: '',
  covers: () => [],
  loopMode: 'live',
  focus: () => [],
  labeled: false,
  labelOpacity: 1,
})

const TOTAL_ACTS = 5
</script>

<template>
  <div class="slidev-layout section theme-dark">
    <!-- Same box as on the cover, so the loop does not move between them. -->
    <div class="section-hero">
      <HeroLoop :mode="loopMode" :focus="focus" :labeled="labeled" :label-opacity="labelOpacity" labels-aside />
    </div>

    <div class="section-body">
      <div class="section-act">
        Act {{ act }}
      </div>
      <!-- `title` is one of the keys Slidev keeps for itself and does not pass
           as a prop, so it is read from $frontmatter instead. -->
      <h1>{{ $frontmatter.title }}</h1>
      <p v-if="question" class="section-question">
        {{ question }}
      </p>
      <p v-if="covers.length" class="section-covers">
        {{ covers.join(' · ') }}
      </p>
      <slot />
    </div>

    <!-- Act progress: one dot per act, filled up to the current one. -->
    <div class="section-progress" :aria-label="`Act ${act} of ${TOTAL_ACTS}`">
      <span v-for="n in TOTAL_ACTS" :key="n" class="dot" :class="{ done: n <= act, current: n === act }" />
    </div>
  </div>
</template>

<style scoped>
.section {
  padding: 0;
}

.section-hero {
  position: absolute;
  top: 0;
  right: 0;
  width: 45%;
  height: 100%;
}

.section-body {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--slide-pad-x);
  width: 47%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.section-act {
  margin-bottom: 14px;
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.section h1 {
  font-size: 46px;
  line-height: 1.1;
  margin-bottom: 18px;
}
.section-question {
  margin: 0;
  opacity: 1; /* the default theme fades the paragraph after a title to 50% */
  font-size: 22px;
  line-height: 1.35;
  color: color-mix(in srgb, var(--c-text) 72%, transparent);
  /* Two lines at most. */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.section-covers {
  margin: 22px 0 0;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
}

.section-progress {
  position: absolute;
  left: var(--slide-pad-x);
  bottom: 40px;
  display: flex;
  gap: 10px;
}
.dot {
  width: 10px;
  height: 10px;
  border: 1.5px solid var(--c-muted);
  border-radius: 50%;
}
.dot.done {
  border-color: var(--c-accent);
  background: var(--c-accent);
}
.dot.current {
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c-accent) 30%, transparent);
}
</style>
