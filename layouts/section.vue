<!--
Act divider. Set `act: Act 2` in the slide's frontmatter for the small label.
Slides using this layout are skipped by the footer numbering (see slide-bottom.vue).
-->
<template>
  <div class="slidev-layout section">
    <HexMotif />
    <div class="section-body">
      <div v-if="$frontmatter.act" class="section-act">
        {{ $frontmatter.act }}
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.section {
  display: flex;
  align-items: center;
  padding-bottom: 44px;
}
.section-body {
  position: relative;
  max-width: 62%;
}
.section-act {
  margin-bottom: 14px;
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.section :deep(h1) {
  font-size: 44px;
  margin-bottom: 12px;
}
.section :deep(p) {
  color: var(--c-muted);
}
</style>
