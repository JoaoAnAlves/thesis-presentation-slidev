<!--
Cover layout for the opening (slide 1) and closing (slide 23) slides.
Always dark, with the animated HeroLoop on the right.

Choose the variant in the slide's frontmatter (Slidev passes frontmatter keys
to the layout as props):

  layout: cover
  variant: opening     # default: logos + date under the text, loop without labels
  variant: closing     # email under the text, loop with labels

Both variants share exactly the same frame, so only the text block and the
node labels differ between the two slides.
-->
<script setup lang="ts">
import { reactive } from 'vue'

withDefaults(defineProps<{ variant?: 'opening' | 'closing' }>(), { variant: 'opening' })

// Logo files in public/img/logos/. If a file is missing, a dashed placeholder
// with the name is shown instead.
const logos = [
  { name: 'FCT NOVA', src: '/img/logos/logo_nova_fct_en_v.png' },
  { name: 'Tecnicamente', src: '/img/logos/logo_app_256.png' },
]
const missing = reactive<Record<string, boolean>>({})
</script>

<template>
  <div class="slidev-layout cover theme-dark" :class="variant">
    <div class="cover-hero">
      <HeroLoop :labeled="variant === 'closing'" />
    </div>

    <div class="cover-body">
      <div class="cover-bar" />
      <slot />

      <!-- Opening only: logos and the date from `themeConfig.date` in slides.md -->
      <div v-if="variant === 'opening'" class="cover-meta">
        <template v-for="logo in logos" :key="logo.name">
          <img v-if="!missing[logo.name]" :src="logo.src" :alt="logo.name" @error="missing[logo.name] = true">
          <span v-else class="logo-placeholder">{{ logo.name }} logo</span>
        </template>
        <span class="cover-date">{{ $slidev.themeConfigs.date }}</span>
      </div>

      <!-- Closing only: contact from `themeConfig.email` in slides.md -->
      <div v-else class="cover-email">
        {{ $slidev.themeConfigs.email }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.cover {
  padding: 0;
}

/* Right ~45% of the slide, identical on both variants. */
.cover-hero {
  position: absolute;
  top: 0;
  right: 0;
  width: 45%;
  height: 100%;
}

/* Text block: left side, vertically centred. */
.cover-body {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--slide-pad-x);
  width: 47%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.cover-bar {
  width: 56px;
  height: 4px;
  margin-bottom: 26px;
  background: var(--c-accent);
}

/* ----- Opening ----- */
.cover :deep(h1) {
  font-size: 36px;
  line-height: 1.15;
  margin-bottom: 16px;
}
.cover :deep(p) {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  color: color-mix(in srgb, var(--c-text) 82%, transparent);
}
/* The default theme fades the paragraph after a title to 50% and pulls it up; undo both here. */
.cover :deep(h1 + p) {
  margin-top: 0;
  opacity: 1;
}
.cover :deep(.credits) {
  margin-top: 26px;
}
.cover :deep(.credits p) {
  font-size: 16px;
  line-height: 1.6;
  color: var(--c-muted);
}
.cover :deep(.credits strong) {
  color: var(--c-text);
  font-size: 19px;
  font-weight: 700;
}

.cover-meta {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 30px;
}
/* Both logos have dark artwork on a transparent background, so each sits on a
   light plate. --c-text is white inside this dark layout. */
.cover-meta img {
  height: 46px;
  width: auto;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--c-text);
}
.logo-placeholder {
  padding: 8px 12px;
  border: 1px dashed var(--c-line);
  border-radius: 6px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 11px;
}
.cover-date {
  margin-left: auto;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 14px;
}

/* ----- Closing ----- */
.closing :deep(h1) {
  font-size: 18px;
  font-weight: 500;
  color: var(--c-muted);
  margin-bottom: 22px;
}
.closing :deep(.thanks) {
  font-family: var(--font-display);
  font-size: 58px;
  font-weight: 600;
  line-height: 1.1;
  color: var(--c-text);
}
.closing :deep(.questions) {
  margin-top: 10px;
  font-size: 26px;
  color: var(--c-accent);
}
.cover-email {
  margin-top: 30px;
  color: color-mix(in srgb, var(--c-text) 82%, transparent);
  font-family: var(--font-mono);
  font-size: 15px;
}
</style>
