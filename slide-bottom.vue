<!--
Footer. Slidev renders a root-level `slide-bottom.vue` inside every slide,
so this file never has to be referenced from a layout or a slide.

Numbering: Slidev's own counter ($page) counts every slide, including act
dividers and backups. The footer instead counts only "main" slides, so the
talk reads 1..23 no matter how many dividers are inserted.
-->
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const { $page, $nav, $slidev } = useSlideContext()

// A slide's kind is decided by its layout.
type Kind = 'main' | 'divider' | 'backup'
function kindOf(layout?: string): Kind {
  if (layout === 'section')
    return 'divider'
  if (layout === 'backup')
    return 'backup'
  return 'main'
}

// Every slide in the deck with its Slidev page number and kind.
const all = computed(() =>
  $nav.value.slides.map(s => ({ no: s.no, kind: kindOf(s.meta.slide.frontmatter.layout) })),
)

const kind = computed(() => all.value.find(s => s.no === $page.value)?.kind ?? 'main')

// Position among slides of the same kind = how many of that kind come at or before this page.
const position = computed(() =>
  all.value.filter(s => s.kind === kind.value && s.no <= $page.value).length,
)
const mainTotal = computed(() => all.value.filter(s => s.kind === 'main').length)

// Backups start at B0 (the index), so their label is position - 1.
const label = computed(() =>
  kind.value === 'backup' ? `B${position.value - 1}` : `${position.value} / ${mainTotal.value}`,
)

// Title and thank-you slides are counted but show no footer; dividers show none either.
const layout = computed(() => $nav.value.slides.find(s => s.no === $page.value)?.meta.slide.frontmatter.layout)
const visible = computed(() => kind.value !== 'divider' && layout.value !== 'cover')

// Text comes from `themeConfig` in the headmatter of slides.md.
const cfg = computed(() => $slidev.themeConfigs as Record<string, string>)
</script>

<template>
  <footer v-if="visible" class="deck-footer">
    <span>{{ cfg.date }}</span>
    <span class="deck-footer-title">{{ cfg.shortTitle }}</span>
    <span>{{ cfg.footerAuthor }}</span>
    <span class="deck-footer-no">{{ label }}</span>
  </footer>
</template>

<style scoped>
.deck-footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--footer-h);
  padding: 0 var(--slide-pad-x);
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  gap: 24px;
  border-top: 1px solid var(--c-line);
  color: var(--c-muted);
  font-size: 12px;
}
.deck-footer-title {
  text-align: center;
}
.deck-footer > :nth-child(3) {
  text-align: right;
}
.deck-footer-no {
  min-width: 56px;
  text-align: right;
  color: var(--c-text);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
</style>
