<!--
Backup (Q&A) slide. Applied to every slide in pages/99-backup.md from the
`src:` entry in slides.md. Shows a "Backup" tag and a link back to the index (b0).
-->
<template>
  <div class="slidev-layout backup">
    <div class="backup-tag">
      <span>Backup</span>
      <Link v-if="$frontmatter.routeAlias !== 'b0'" to="b0">
        ← index
      </Link>
    </div>
    <slot />
  </div>
</template>

<style scoped>
.backup-tag {
  display: flex;
  gap: 16px;
  margin-bottom: 10px;
  color: var(--c-muted);
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.backup-tag :deep(a) {
  color: var(--c-accent);
  text-transform: none;
  letter-spacing: 0;
}
.backup :deep(h1) {
  font-size: 26px;
}
</style>
