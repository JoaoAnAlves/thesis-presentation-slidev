// Slide numbers as the footer shows them (1–23) are not Slidev's page numbers:
// act dividers and backups are pages too. This turns a footer number into the
// page to link to, so links keep working when dividers are added or removed.
//
//   const { pageOf } = useSlideNumber()
//   <Link :to="pageOf(20)">slide 20</Link>
//
// Same rule as slide-bottom.vue: a slide is "main" unless its layout is
// `section` (divider) or `backup`.
import { useNav } from '@slidev/client'

export function useSlideNumber() {
  const { slides } = useNav()
  function pageOf(n: number) {
    const main = slides.value.filter((s) => {
      const layout = s.meta.slide.frontmatter.layout
      return layout !== 'section' && layout !== 'backup'
    })
    return main[n - 1]?.no ?? n
  }
  return { pageOf }
}
