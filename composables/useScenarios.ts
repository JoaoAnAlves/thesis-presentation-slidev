// What slides 16 and 17 say about the data, computed from the data.
//
// DATA: data/sku.json → scenario1 and scenario2 (real, item 101703).
//
//   const { total, inside, below } = useBaselineCheck()
//   inside   how many forecast months have actual sales inside the 90% band
//   below    the months where sales were under WELL_BELOW × forecast
//
// ForecastChart (the orange dots) and BaselineCaption (the sentence beside the
// chart) both read from here, so the dots and the text cannot disagree.
import sku from '../data/sku.json'

const s1 = sku.scenario1

/** "Well below the forecast" = actual sales under this share of the forecast. */
export const WELL_BELOW = 0.8

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** '2025-08' → 'Aug' */
export const monthName = (iso: string) => MONTHS[+iso.slice(5, 7) - 1]

export function useBaselineCheck(threshold = WELL_BELOW) {
  // One row per forecast month that already has a full month of actual sales.
  const months = s1.blended.flatMap((b) => {
    const sale = s1.actual.find(a => a.month === b.month) as { qty: number, partial?: boolean } | undefined
    // A partial month (incomplete sales) is never compared with the forecast.
    if (sale == null || sale.partial)
      return []
    const actual = sale.qty
    return [{
      month: b.month,
      actual,
      forecast: b.qty,
      inside: actual >= b.rangeDown && actual <= b.rangeUp,
      below: actual < threshold * b.qty,
    }]
  })
  return {
    months,
    total: months.length,
    inside: months.filter(m => m.inside).length,
    below: months.filter(m => m.below).map(m => m.month),
  }
}

