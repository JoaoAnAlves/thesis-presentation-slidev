<!-- Title and thank-you slides: hex motif on the right, text block bottom-left. -->
<template>
  <div class="slidev-layout cover">
    <HexMotif />
    <div class="cover-body">
      <div class="cover-bar" />
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cover {
  display: flex;
  align-items: center;
  padding-bottom: 44px;
}
.cover-body {
  position: relative;
  max-width: 62%;
}
.cover-bar {
  width: 56px;
  height: 4px;
  margin-bottom: 28px;
  background: var(--c-accent);
}
.cover :deep(h1) {
  font-size: 40px;
  line-height: 1.15;
  margin-bottom: 20px;
}
.cover :deep(p) {
  color: var(--c-muted);
  font-size: 19px;
}
</style>
