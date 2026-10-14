// How numbers are written on the slides, in one place.
//
// The values in data/*.json stay as exported (unrounded). Components pass them
// through one of these functions at the moment they print them, so every slide
// writes the same number the same way.
//
//   fmtInt(2358.2152)        '2,358'
//   fmtCompact(10000)        '10K'      (axis ticks)
//   fmtPct(0.2578)           '25.8%'    fmtPct(0.5, 0) → '50%'
//   fmtQty(8041.3)           '8,041 kg'
//   fmtAmount(61.24)         '61.2'     (planning: one decimal below 100)
//   fmtMult(0.6807)          '×0.68'    (scenario multipliers)
//   baseUnit('kg / month')   'kg'

/** Whole number with a thousands separator: 2,358 */
export const fmtInt = (v: number) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v)

/** Short form for axis ticks: 5K, 10K, 2.4K */
export const fmtCompact = (v: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)

/** A share between 0 and 1 as a percentage with `d` decimals: 25.8% */
export const fmtPct = (v: number, d = 1) => `${(v * 100).toFixed(d)}%`

/** Whole number followed by its unit: 8,041 kg */
export const fmtQty = (v: number, unit = 'kg') => `${fmtInt(v)} ${unit}`

/** Planning quantities: whole numbers from 100 up, one decimal below. */
export const fmtAmount = (v: number) => (Math.abs(v) >= 100 ? fmtInt(v) : v.toFixed(1))

/** A multiplier with two decimals: ×0.68, ×1.38, ×0.00 */
export const fmtMult = (v: number) => `×${v.toFixed(2)}`

/** The unit of a quantity, without the period: 'kg / month' → 'kg' */
export const baseUnit = (unit: string) => unit.split('/')[0].trim()
