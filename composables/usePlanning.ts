// Planning arithmetic for slide 15, in one place: plan → gross needs per
// component (BOM explosion) → FEFO lots → net requirement → order date.
//
//   const { plan, tree, fefo, order } = usePlanning()
//   usePlanning({ applyScrapPerLevel: false })   scrap only on the first level
//
// BomTree, FefoLots and OrderTimeline all read from here, so the numbers on
// the slide always agree with each other.
//
// DATA: data/sku.json → planning (MOCK for now). Nothing is typed by hand.
import sku from '../data/sku.json'
import { fmtAmount } from './useFormat'
import { MANAGER_OVERRIDE, toPlanning, useBlend } from './useBlend'

const p = sku.planning

interface BomItem {
  id: string
  name: string
  qtyPerUnit: number
  unit: string
  type: string
  children?: BomItem[]
}

export interface PlanNode extends BomItem {
  /** quantity of the parent this node is computed from */
  parentQty: number
  /** parentQty × qtyPerUnit, × (1 + scrap) when `scrapped` */
  gross: number
  /** whether scrap was added at this level */
  scrapped: boolean
  /** column in the tree: 1 = directly under the product */
  depth: number
  /** line in the tree, counted from the top */
  row: number
  /** order of appearance when the tree expands */
  order: number
  parentId: string | null
}

/** Numbers as shown on the slide: whole units from 100 up, one decimal below. */
export const qty = fmtAmount
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
/** '2025-06-23' → '23 Jun' */
export const day = (iso: string) => `${+iso.slice(8, 10)} ${MONTHS[+iso.slice(5, 7) - 1]}`
/** '2025-07' → 'Jul 2025' */
export const month = (iso: string) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function usePlanning(options: { applyScrapPerLevel?: boolean } = {}) {
  const scrapPerLevel = options.applyScrapPerLevel ?? true

  // The plan is the "to planning" total slide 14 ends on: forecast + safety
  // stock for the month, with the manager's override applied. Same code, same
  // rounding, so slides 14 and 15 cannot disagree. `planning.plan` in the file
  // is only used if the month is not a forecast month.
  const { months, withOverride } = useBlend()
  const t = months.indexOf(p.month)
  const plan = t >= 0 ? toPlanning(withOverride(MANAGER_OVERRIDE.model, MANAGER_OVERRIDE.weight), t).total : p.plan

  // BOM explosion. The tree is flattened into a list; every node gets a column
  // (depth) and a row. Rule for rows: a first child sits on its parent's row,
  // every further child opens a new row below.
  const tree: PlanNode[] = []
  let nextRow = 0
  function explode(items: BomItem[], parentQty: number, depth: number, parentId: string | null) {
    items.forEach((item, i) => {
      if (i > 0 || depth === 1 && tree.length > 0)
        nextRow++
      // TODO(João): verify formula vs intelligent_planner_service_final.py
      // (scrap on forecast only? scrap re-applied at each BOM level?)
      const scrapped = depth === 1 || scrapPerLevel
      const gross = parentQty * item.qtyPerUnit * (scrapped ? 1 + p.scrap : 1)
      tree.push({ ...item, parentQty, gross, scrapped, depth, row: nextRow, order: tree.length, parentId })
      if (item.children?.length)
        explode(item.children, gross, depth + 1, item.id)
    })
  }
  explode(p.bom as BomItem[], plan, 1, null)

  // FEFO: earliest expiry first. A lot that expires before the need date is
  // not counted (waste alert); the others are consumed until the need is covered.
  const item = tree.find(n => n.id === p.fefo.item) ?? tree[0]
  let open = item.gross
  const lots = [...p.fefo.lots]
    .sort((a, c) => a.expires.localeCompare(c.expires))
    .map((lot) => {
      const expired = lot.expires < p.order.needDate
      const used = expired ? 0 : Math.min(lot.qty, open)
      open -= used
      return { ...lot, expired, used }
    })
  const usable = lots.reduce((sum, l) => sum + l.used, 0)

  return {
    product: p.product,
    month: p.month,
    plan,
    scrap: p.scrap,
    tree,
    rows: nextRow + 1,
    fefo: { item, lots, usable, net: item.gross - usable },
    order: {
      ...p.order,
      /** need date − lead time − buffer */
      orderBy: addDays(p.order.needDate, -(p.order.leadTimeDays + p.order.bufferDays)),
      /** need date − buffer: when the delivery should arrive */
      arrival: addDays(p.order.needDate, -p.order.bufferDays),
    },
    isMock: p._mock,
  }
}
