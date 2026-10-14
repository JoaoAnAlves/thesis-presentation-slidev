// Numbers that glide to a new value instead of jumping.
//
//   const shown = useTween(() => target.value, 800)
//
// `shown` starts equal to the target. Whenever the target changes, `shown`
// moves from where it is now to the new values over `ms` milliseconds, with an
// ease-in-out curve. Bars, lines and bands that are drawn from `shown` all move
// together, with the same easing.
//
// In PDF export (print mode) there is no animation: `shown` jumps to the target.
import type { Ref } from 'vue'
import { useNav } from '@slidev/client'
import { onBeforeUnmount, ref, watch } from 'vue'

export function useTween(target: () => number[], ms = 800): Ref<number[]> {
  const { isPrintMode } = useNav()
  const shown = ref([...target()])
  let frame = 0

  watch(target, (to) => {
    cancelAnimationFrame(frame)
    const from = [...shown.value]
    if (isPrintMode.value || from.length !== to.length) {
      shown.value = [...to]
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - t0) / ms, 1)
      const k = t * t * (3 - 2 * t) // ease-in-out
      shown.value = to.map((v, i) => from[i] + (v - from[i]) * k)
      if (t < 1)
        frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => cancelAnimationFrame(frame))
  return shown
}
