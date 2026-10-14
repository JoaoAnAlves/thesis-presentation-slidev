<!--
A recorded clip of the prototype in a light device frame, with a label.

Usage:  <PrototypeClip :at="3" src="/video/weights.mp4" poster="/img/weights-poster.png" label="…" />

`at` is the click on which the panel fades in and the video starts. The video
is Slidev's <SlidevVideo>: muted, starts on that click, goes back to the start
when you step back. In PDF export Slidev shows the poster instead.

If the video file is not in public/ yet, a dashed placeholder of the same size
is shown instead (also in the PDF), so the slide is never a blank box.
-->
<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const props = defineProps<{ at: number, src: string, poster?: string, label: string }>()
const { $clicks } = useSlideContext()

// Which videos exist in public/video. Vite fills this list in when it builds.
const available = Object.keys(import.meta.glob('../public/video/*'))
const exists = computed(() => available.includes(`../public${props.src}`))
</script>

<template>
  <figure class="proto-clip" :class="{ on: $clicks >= at }">
    <!-- TODO(João): review wording (label comes from the slide) -->
    <figcaption>{{ label }}</figcaption>
    <div class="proto-screen">
      <SlidevVideo v-if="exists" v-click="at" autoplay autoreset="click" muted playsinline :poster="poster">
        <source :src="src" type="video/mp4">
      </SlidevVideo>
      <div v-else class="proto-missing">
        TODO(João): {{ src }}
      </div>
    </div>
  </figure>
</template>

<style scoped>
.proto-clip {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 12px 14px 14px;
  border: 1.5px solid var(--c-line);
  border-radius: 14px;
  background: var(--c-surface);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.proto-clip.on {
  opacity: 1;
  pointer-events: auto;
}
.proto-clip figcaption {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
/* The screen is 16:9 whatever is inside it. */
.proto-screen {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--c-line);
  border-radius: 8px;
  background: var(--c-bg);
}
.proto-screen :deep(video) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 1 !important; /* the panel does the fading, not v-click */
}
.proto-missing {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border: 2px dashed var(--c-muted);
  border-radius: 8px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 16px;
}

@media print {
  .proto-clip {
    transition: none;
  }
}
</style>
