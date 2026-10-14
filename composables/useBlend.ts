// Inverse Error Weighting for the thread SKU, in one place.
//
// Slides 12–14 (and later 18) all need the same arithmetic: weights → combined
// forecast → error → band → safety stock. Components import it from here, so a
// change of weights (a manual override, a model that failed) is recomputed the
// same way everywhere.
//
//   const { models, months, automatic, blend, withOverride } = useBlend()
//   automatic.qty[t]                      combined forecast with the automatic weights
//   withOverride('chronos', 0.5).rangeUp  band after giving Chronos half of the weight
//
// DATA: data/sku.json → scenario1 (MOCK for now). Nothing here is typed by hand.
import sku from '../data/sku.json'

const s1 = sku.scenario1

/** The manager's override shown on slide 14, and carried into planning on
 *  slide 15. Change it here and both slides follow. `model` is an id in
 *  scenario1.models. */
export const MANAGER_OVERRIDE = { model: 'chronos', weight: 0.5 }

/** 1.65 standard errors each side = 90% prediction interval. */
export const Z90 = 1.65

export interface Blend {
  /** one weight per model, summing to 1 */
  weights: number[]
  /** combined forecast, one value per forecast month */
  qty: number[]
  /** combined error per forecast month */
  rmse: number[]
  rangeUp: number[]
  /** floored at 0 */
  rangeDown: number[]
  /** rangeUp − qty = 1.65 × rmse */
  safety: number[]
}

/** Divide by the sum so the weights add up to 1. All zeros stay all zeros. */
export function normalize(weights: number[]) {
  const total = weights.reduce((a, b) => a + b, 0)
  return total > 0 ? weights.map(w => w / total) : weights.map(() => 0)
}

/** w_i = (1/RMSE_i) / Σ (1/RMSE_j), with the RMSE floored at 0.001. */
export function inverseErrorWeights(rmse: number[]) {
  return normalize(rmse.map(r => 1 / Math.max(r, 0.001)))
}

/** The weights the system computes on its own: from the file if it has them, else from the RMSEs. */
export function automaticWeights() {
  const stored = s1.models.map(m => (m as { weight?: number }).weight)
  return stored.every(w => typeof w === 'number')
    ? normalize(stored as number[])
    : inverseErrorWeights(s1.models.map(m => m.rmse))
}

/** Fix one model's weight; the others keep their proportions and share the rest. */
export function overrideWeights(base: number[], index: number, value: number) {
  const others = base.reduce((sum, w, i) => (i === index ? sum : sum + w), 0)
  return base.map((w, i) => (i === index ? value : others > 0 ? (w / others) * (1 - value) : 0))
}

/** Everything that follows from one set of weights. */
export function blend(weights: number[]): Blend {
  const months = s1.blended.map((_, t) => t)
  const qty = months.map(t => s1.models.reduce((sum, m, i) => sum + weights[i] * m.forecast[t], 0))
  // Error of the month: the models' errors for that calendar month, combined
  // with the same weights. Falls back to each model's average RMSE.
  const rmse = months.map(t => s1.models.reduce((sum, m, i) =>
    sum + weights[i] * ((m as { rmseByMonth?: number[] }).rmseByMonth?.[t] ?? m.rmse), 0))
  return {
    weights,
    qty,
    rmse,
    rangeUp: qty.map((q, t) => q + Z90 * rmse[t]),
    rangeDown: qty.map((q, t) => Math.max(0, q - Z90 * rmse[t])),
    safety: rmse.map(r => Z90 * r),
  }
}

/** What planning receives for one forecast month, rounded as on the slides. */
export function toPlanning(b: Blend, t: number) {
  const forecast = Math.round(b.qty[t])
  const safety = Math.round(b.safety[t])
  return { forecast, safety, total: forecast + safety }
}

export function useBlend() {
  const auto = automaticWeights()
  return {
    models: s1.models,
    months: s1.blended.map(b => b.month),
    /** result with the automatic weights */
    automatic: blend(auto),
    blend,
    /** result after setting one model (by id) to a fixed weight */
    withOverride: (id: string, value: number) =>
      blend(overrideWeights(auto, s1.models.findIndex(m => m.id === id), value)),
  }
}
