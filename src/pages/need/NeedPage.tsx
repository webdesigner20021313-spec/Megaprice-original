import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, X, AlertTriangle, Package,
  ChevronDown, Check, Zap, TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { mockNeedItems, type NeedItem, type NeedStatus } from '@/mocks/need.mocks'
import { mockSupplierOffers } from '@/mocks/purchase.mocks'
import { usePurchaseCart } from '@/pages/purchase/hooks/usePurchaseCart'

// ─── Types ────────────────────────────────────────────────────────────────────

type ScenarioKey = 'urgent' | 'oos' | 'overstock' | 'dead' | 'all'
type PeriodKey   = 'week' | 'month' | 'quarter' | 'year'
type ColKey      = 'status' | 'stock' | 'doc' | 'sales' | 'need' | 'financial'

// ─── Custom icon: ShoppingCart + Plus ────────────────────────────────────────

function CartPlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      <line x1="12" y1="8" x2="12" y2="14" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  )
}

// ─── Resize handle ────────────────────────────────────────────────────────────

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      draggable={false}
      onDragStart={e => e.preventDefault()}
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', right: 0, top: 0, width: 4, height: '100%', cursor: 'col-resize', zIndex: 10 }}
      className="hover:bg-blue-400 active:bg-blue-500"
    />
  )
}

// ─── Config ───────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр']

const STATUS_CFG: Record<NeedStatus, { label: string; badgeCls: string; borderColor: string; rowBg: string }> = {
  oos:       { label: 'Out of Stock',  badgeCls: 'bg-[#FEE2E2] text-[#991B1B]', borderColor: '#EF4444', rowBg: '#FFF8F8' },
  critical:  { label: 'Критично',      badgeCls: 'bg-[#FEF3C7] text-[#92400E]', borderColor: '#F59E0B', rowBg: '' },
  normal:    { label: 'В норме',       badgeCls: 'bg-[#D1FAE5] text-[#065F46]', borderColor: '#10B981', rowBg: '' },
  overstock: { label: 'Overstock',     badgeCls: 'bg-[#DBEAFE] text-[#1E40AF]', borderColor: '#3B82F6', rowBg: '' },
  dead:      { label: 'Мёртвый сток',  badgeCls: 'bg-[#F3F4F6] text-[#374151]', borderColor: '#9CA3AF', rowBg: '' },
}

const STATUS_ORDER: Record<NeedStatus, number> = { oos: 0, critical: 1, normal: 2, overstock: 3, dead: 4 }

const SCENARIOS: { key: ScenarioKey; label: string; filter: (i: NeedItem[]) => NeedItem[] }[] = [
  { key: 'urgent',    label: 'Купить сейчас',  filter: i => i.filter(x => x.status === 'oos' || x.status === 'critical') },
  { key: 'oos',       label: 'OOS',            filter: i => i.filter(x => x.status === 'oos') },
  { key: 'overstock', label: 'Overstock',      filter: i => i.filter(x => x.status === 'overstock' || x.status === 'dead') },
  { key: 'dead',      label: 'Мёртвый сток',   filter: i => i.filter(x => x.status === 'dead') },
  { key: 'all',       label: 'Все товары',     filter: i => i },
]

const PERIODS: { key: PeriodKey; label: string; days: number }[] = [
  { key: 'week',    label: 'Неделя',  days: 7 },
  { key: 'month',   label: 'Месяц',   days: 30 },
  { key: 'quarter', label: 'Квартал', days: 90 },
  { key: 'year',    label: 'Год',     days: 365 },
]

const GROUPS = Array.from(new Set(mockNeedItems.map(i => i.group))).sort()

const COL_LABELS: Record<ColKey, string> = {
  status:    'Статус',
  stock:     'Остаток',
  doc:       'Покрытие',
  sales:     'Прод./день',
  need:      'Заказать',
  financial: 'Потери / Заморожено',
}

const DEFAULT_ORDER: ColKey[] = ['status', 'stock', 'doc', 'sales', 'need', 'financial']

type ColWidths = Record<ColKey, number>
const INIT_WIDTHS: ColWidths = { status: 114, stock: 72, doc: 136, sales: 88, need: 80, financial: 132 }

const COL_CB     = 40
const COL_ACTION = 52
const MIN_NAME   = 180

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcRecommendedQty(item: NeedItem, days: number): number {
  if (item.status === 'overstock' || item.status === 'dead') return 0
  return Math.max(0, Math.ceil(item.avgDailySales * days) - item.stock)
}

function calcKpi(items: NeedItem[], periodDays: number) {
  const oos       = items.filter(i => i.status === 'oos')
  const critical  = items.filter(i => i.status === 'critical')
  const overstock = items.filter(i => i.status === 'overstock' || i.status === 'dead')
  const lostPerDay  = oos.reduce((s, i) => s + i.lostRevenuePerDay, 0)
  const frozenTotal = overstock.reduce((s, i) => s + i.frozenAmount, 0)
  const orderTotal  = items.reduce((s, i) => s + calcRecommendedQty(i, periodDays) * i.costPrice, 0)
  const orderCount  = items.filter(i => calcRecommendedQty(i, periodDays) > 0).length
  const withDOC     = items.filter(i => i.status !== 'oos' && i.status !== 'dead')
  const avgDOC      = withDOC.length ? withDOC.reduce((s, i) => s + i.daysOfCover, 0) / withDOC.length : 0
  return { oos, critical, overstock, lostPerDay, frozenTotal, orderTotal, orderCount, avgDOC }
}

function defaultSort(a: NeedItem, b: NeedItem) {
  const so = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  if (so !== 0) return so
  if (a.status === 'critical') return a.daysOfCover - b.daysOfCover
  if (a.status === 'overstock') return b.daysOfCover - a.daysOfCover
  return 0
}

function getBestOffer(medicineId: string) {
  return mockSupplierOffers.filter(o => o.medicineId === medicineId).sort((a, b) => a.priceWithVat - b.priceWithVat)[0] ?? null
}

// ─── DOC Bar ─────────────────────────────────────────────────────────────────

function DocBar({ days }: { days: number }) {
  if (days === 0)   return <span className="text-xs font-bold text-red-500">OOS</span>
  if (days > 99)    return <span className="text-xs text-gray-400">{Math.round(days)} дн.</span>
  const color = days < 3 ? '#EF4444' : days < 7 ? '#F59E0B' : days <= 30 ? '#10B981' : '#3B82F6'
  const pct   = Math.min(100, (days / 30) * 100)
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 48, height: 4, background: '#F3F4F6', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ color, fontSize: 12, fontWeight: 600 }}>{Math.round(days)} дн.</span>
    </div>
  )
}

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const W = 300; const H = 72; const gap = 3
  const bw = (W - gap * (data.length - 1)) / data.length
  return (
    <svg width={W} height={H + 14} style={{ overflow: 'visible' }}>
      {data.map((v, i) => {
        const bh = Math.max(3, (v / max) * H)
        const x  = i * (bw + gap)
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={bw} height={bh} rx={2}
              fill={i === data.length - 1 ? '#111827' : '#E5E7EB'} />
            {(i === 0 || i === 5 || i === 11) && (
              <text x={x + bw / 2} y={H + 12} textAnchor="middle" fontSize={9} fill="#9CA3AF">
                {MONTHS_SHORT[i]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ─── Product Drawer ───────────────────────────────────────────────────────────

function NeedDrawer({ item, periodDays, onClose, onAddToCart }: {
  item: NeedItem; periodDays: number
  onClose: () => void; onAddToCart: (item: NeedItem, qty: number) => void
}) {
  const cfg       = STATUS_CFG[item.status]
  const recQty    = calcRecommendedQty(item, periodDays)
  const [qty, setQty] = useState(recQty > 0 ? recQty : 1)
  const bestOffer = useMemo(() => getBestOffer(item.id), [item.id])

  useEffect(() => {
    const q = calcRecommendedQty(item, periodDays)
    setQty(q > 0 ? q : 1)
  }, [item.id, periodDays])

  const oosDays   = item.oosSince
    ? Math.floor((new Date('2026-04-28').getTime() - new Date(item.oosSince).getTime()) / 86400000)
    : 0
  const totalLost = oosDays * item.lostRevenuePerDay
  const orderCost = qty * (bestOffer?.priceWithVat ?? item.costPrice)
  const excessQty = Math.max(0, item.stock - item.optimalStock)

  return (
    <div className="flex h-full w-[380px] shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">
      {/* Header */}
      <div className="shrink-0 border-b border-gray-200 px-5 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug text-gray-900">{item.name}</p>
            <p className="mt-0.5 text-xs text-gray-400">{item.manufacturer} · {item.country} · {item.group}</p>
          </div>
          <button onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cfg.badgeCls)}>
            {cfg.label}
          </span>
          {item.status === 'oos' && oosDays > 0 && (
            <span className="text-xs text-red-500">{oosDays} {oosDays < 5 ? 'дня' : 'дней'} без товара</span>
          )}
          {item.status === 'critical' && (
            <span className="text-xs text-amber-600">Осталось {Math.round(item.daysOfCover)} дн.</span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Action card */}
        {recQty > 0 && (
          <div className="m-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Рекомендуем заказать</p>
            <div className="mb-3 flex items-center gap-2">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors text-sm font-bold">−</button>
              <input type="number" min={1} value={qty}
                onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                className="h-8 w-16 rounded-lg border border-gray-200 bg-white text-center text-sm font-semibold tabular-nums outline-none focus:border-gray-900" />
              <button onClick={() => setQty(q => q + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 transition-colors text-sm font-bold">+</button>
              <span className="ml-auto text-sm font-bold text-gray-900">{formatCurrency(orderCost)}</span>
            </div>
            {bestOffer && (
              <p className="mb-3 text-xs text-gray-500">
                Лучшая цена: <span className="font-medium text-gray-700">{bestOffer.distributor.name}</span>
                {' · '}{formatCurrency(bestOffer.priceWithVat)}/шт.
              </p>
            )}
            <button onClick={() => onAddToCart(item, qty)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black">
              <CartPlusIcon className="h-4 w-4" />
              Добавить в заказ
            </button>
          </div>
        )}

        {/* Metrics grid */}
        <div className="mx-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Остаток',      value: item.stock === 0 ? 'Нет' : `${item.stock} шт.`, color: item.stock === 0 ? '#EF4444' : undefined },
            { label: 'Продажи/день', value: `${item.avgDailySales.toFixed(1)} шт.` },
            { label: 'Покрытие',     value: item.daysOfCover === 0 ? 'OOS' : `${Math.round(item.daysOfCover)} дн.`, color: item.daysOfCover === 0 ? '#EF4444' : undefined },
            { label: 'Цена продажи', value: formatCurrency(item.salePrice) },
            { label: 'Закупочная',   value: formatCurrency(item.costPrice) },
            { label: 'Продажи/мес.', value: `${item.sales30d} шт.` },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
              <p className="mt-1.5 text-sm font-semibold text-gray-900" style={color ? { color } : undefined}>{value}</p>
            </div>
          ))}
        </div>

        {/* OOS losses */}
        {item.status === 'oos' && item.lostRevenuePerDay > 0 && (
          <div className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-red-500">Финансовые потери</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-red-700">В день</span>
                <span className="font-semibold text-red-700 tabular-nums">{formatCurrency(item.lostRevenuePerDay)}</span>
              </div>
              {oosDays > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-700">За {oosDays} {oosDays < 5 ? 'дня' : 'дней'}</span>
                  <span className="font-bold text-red-800 tabular-nums">{formatCurrency(totalLost)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overstock frozen */}
        {(item.status === 'overstock' || item.status === 'dead') && item.frozenAmount > 0 && (
          <div className="mx-4 mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-500">Заморожено в запасах</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Текущий остаток</span>
                <span className="font-semibold text-blue-700">{item.stock} шт.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Оптимальный запас</span>
                <span className="font-semibold text-blue-700">{item.optimalStock} шт.</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-1.5">
                <span className="font-medium text-blue-800">Избыток ({excessQty} шт.)</span>
                <span className="font-bold text-blue-800 tabular-nums">{formatCurrency(item.frozenAmount)}</span>
              </div>
            </div>
            {item.avgDailySales > 0 && (
              <p className="mt-2 text-xs text-blue-600">
                Распродастся через ~{Math.round(item.stock / item.avgDailySales)} дней без дозаказа
              </p>
            )}
          </div>
        )}

        {/* Chart */}
        <div className="mx-4 mt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Продажи — последние 12 месяцев</p>
          <MiniBarChart data={item.monthlySales} />
        </div>

        {/* DOC bar */}
        <div className="mx-4 mt-4 mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Уровень запасов</p>
          <div className="relative h-2 overflow-hidden rounded-full bg-gray-100">
            {item.daysOfCover > 0 && (
              <div style={{
                width: `${Math.min(100, (item.daysOfCover / 30) * 100)}%`, height: '100%', borderRadius: 9999,
                background: item.daysOfCover < 3 ? '#EF4444' : item.daysOfCover < 7 ? '#F59E0B' : item.daysOfCover <= 30 ? '#10B981' : '#3B82F6',
              }} />
            )}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>Пусто</span><span>Норма: 21 дн.</span><span>30+ дн.</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {item.daysOfCover === 0 ? 'Товар отсутствует'
              : item.daysOfCover > 30 ? `Переизбыток: ${Math.round(item.daysOfCover - 21)} дн. сверх нормы`
              : `Скорость продаж: ${item.avgDailySales.toFixed(1)} шт./день`}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── NeedPage ─────────────────────────────────────────────────────────────────

export function NeedPage() {
  const { addItem } = usePurchaseCart()

  // Filters / UI state
  const [scenario,    setScenario]    = useState<ScenarioKey>('urgent')
  const [period,      setPeriod]      = useState<PeriodKey>('week')
  const [search,      setSearch]      = useState('')
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [groupOpen,   setGroupOpen]   = useState(false)
  const [checkedIds,  setCheckedIds]  = useState<string[]>([])
  const [drawerItem,  setDrawerItem]  = useState<NeedItem | null>(null)

  // Table container width → rubber name column
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(900)
  useEffect(() => {
    if (!tableContainerRef.current) return
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width))
    ro.observe(tableContainerRef.current)
    return () => ro.disconnect()
  }, [])

  // Column resize
  const [colWidths, setColWidths] = useState<ColWidths>(INIT_WIDTHS)

  function startResize(e: React.MouseEvent, key: ColKey) {
    e.preventDefault(); e.stopPropagation()
    const startX = e.clientX, startW = colWidths[key]
    function onMove(ev: MouseEvent) {
      setColWidths(prev => ({ ...prev, [key]: Math.max(60, startW + ev.clientX - startX) }))
    }
    function onUp() {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // Column drag-and-drop reorder
  const [colOrder, setColOrder] = useState<ColKey[]>(DEFAULT_ORDER)
  const dragColRef = useRef<ColKey | null>(null)
  const [overCol,  setOverCol]  = useState<ColKey | null>(null)

  function handleColDragStart(e: React.DragEvent, key: ColKey) {
    dragColRef.current = key
    e.dataTransfer.effectAllowed = 'move'
  }
  function handleColDragOver(e: React.DragEvent, key: ColKey) {
    e.preventDefault()
    if (overCol !== key) setOverCol(key)
  }
  function handleColDrop(key: ColKey) {
    const from = dragColRef.current
    if (!from || from === key) { dragColRef.current = null; setOverCol(null); return }
    const next = [...colOrder]
    const fi = next.indexOf(from), ti = next.indexOf(key)
    next.splice(fi, 1); next.splice(ti, 0, from)
    setColOrder(next)
    dragColRef.current = null; setOverCol(null)
  }
  function handleColDragEnd() { dragColRef.current = null; setOverCol(null) }

  // Derived
  const periodDays = PERIODS.find(p => p.key === period)!.days
  const kpi = useMemo(() => calcKpi(mockNeedItems, periodDays), [periodDays])

  const scenarioCounts = useMemo(() =>
    Object.fromEntries(SCENARIOS.map(s => [s.key, s.filter(mockNeedItems).length])) as Record<ScenarioKey, number>,
    [],
  )

  const filtered = useMemo(() => {
    let list = SCENARIOS.find(s => s.key === scenario)!.filter(mockNeedItems)
    if (groupFilter) list = list.filter(i => i.group === groupFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.manufacturer.toLowerCase().includes(q))
    }
    return [...list].sort(defaultSort)
  }, [scenario, groupFilter, search])

  const allChecked  = filtered.length > 0 && filtered.every(i => checkedIds.includes(i.id))
  const someChecked = !allChecked && filtered.some(i => checkedIds.includes(i.id))

  const reorderableW = colOrder.reduce((s, k) => s + colWidths[k], 0)
  const drawerOpen   = drawerItem !== null
  const nameW  = Math.max(MIN_NAME, containerW - COL_CB - reorderableW - COL_ACTION - (drawerOpen ? 380 : 0))
  const tableW = COL_CB + nameW + reorderableW + COL_ACTION

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (allChecked) setCheckedIds(p => p.filter(id => !filtered.some(i => i.id === id)))
    else setCheckedIds(p => Array.from(new Set([...p, ...filtered.map(i => i.id)])))
  }, [allChecked, filtered])

  function toggleCheck(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setCheckedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const handleAddToCart = useCallback((item: NeedItem, qty: number) => {
    const offer = getBestOffer(item.id)
    if (!offer) return
    addItem({
      offerId: offer.id, medicineId: item.id, quantity: qty, offer,
      medicine: { id: item.id, name: item.name, manufacturer: item.manufacturer, country: item.country, isFavorite: false, mnn: '', form: '', dosage: '', packageSize: '' } as any,
    })
  }, [addItem])

  function handleBulkAddToCart() {
    filtered.filter(i => checkedIds.includes(i.id)).forEach(item => {
      const qty = calcRecommendedQty(item, periodDays)
      if (qty > 0) handleAddToCart(item, qty)
    })
    setCheckedIds([])
  }

  // ── Render th (reorderable) ────────────────────────────────────────────────
  const thBase: React.CSSProperties = {
    position: 'sticky', top: 0, zIndex: 2, height: 48,
    background: '#F9FAFB', borderBottom: '1px solid #e5e7eb',
    padding: '0 12px', whiteSpace: 'nowrap', overflow: 'hidden',
  }

  function renderTh(key: ColKey) {
    const isDragOver = overCol === key && dragColRef.current !== key
    const borderStyle: React.CSSProperties = isDragOver
      ? { borderLeft: '2px solid #3B82F6', borderRight: '1px solid #e5e7eb' }
      : { borderRight: '1px solid #e5e7eb' }
    const dragProps = {
      draggable: true as const,
      onDragStart: (e: React.DragEvent) => handleColDragStart(e, key),
      onDragOver:  (e: React.DragEvent) => handleColDragOver(e, key),
      onDrop:      (e: React.DragEvent) => { e.preventDefault(); handleColDrop(key) },
      onDragEnd:   handleColDragEnd,
    }
    return (
      <th key={key} {...dragProps}
        style={{ ...thBase, ...borderStyle, position: 'sticky', top: 0, cursor: 'grab', textAlign: key === 'stock' || key === 'sales' || key === 'need' ? 'right' : 'left' }}>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500" style={{ paddingRight: 8 }}>
          {COL_LABELS[key]}
        </span>
        <ResizeHandle onMouseDown={e => { e.stopPropagation(); startResize(e, key) }} />
      </th>
    )
  }

  // ── Render td (reorderable cell) ───────────────────────────────────────────
  function renderCell(key: ColKey, item: NeedItem, recQty: number) {
    const cfg    = STATUS_CFG[item.status]
    const isDead = item.status === 'dead'
    const tdBase: React.CSSProperties = { padding: '0 12px', borderRight: '1px solid #f3f4f6' }

    switch (key) {
      case 'status':
        return (
          <td key="status" style={tdBase}>
            <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', cfg.badgeCls)}>
              {cfg.label}
            </span>
          </td>
        )
      case 'stock':
        return (
          <td key="stock" style={{ ...tdBase, textAlign: 'right' }}>
            <span className={cn('text-sm tabular-nums font-medium',
              item.stock === 0 ? 'text-red-500 font-bold' : isDead ? 'text-gray-400' : 'text-gray-700')}>
              {item.stock === 0 ? '—' : item.stock}
            </span>
          </td>
        )
      case 'doc':
        return (
          <td key="doc" style={tdBase}>
            <DocBar days={item.daysOfCover} />
          </td>
        )
      case 'sales':
        return (
          <td key="sales" style={{ ...tdBase, textAlign: 'right' }}>
            <span className={cn('text-sm tabular-nums', isDead ? 'text-gray-300' : 'text-gray-600')}>
              {item.avgDailySales.toFixed(1)}
            </span>
          </td>
        )
      case 'need':
        return (
          <td key="need" style={{ ...tdBase, textAlign: 'right' }}>
            {recQty > 0
              ? <span className="text-sm font-semibold tabular-nums text-gray-900">{recQty}</span>
              : <span className="text-sm text-gray-300">—</span>}
          </td>
        )
      case 'financial':
        return (
          <td key="financial" style={{ ...tdBase, textAlign: 'right' }}>
            {item.status === 'oos' && (
              <span className="text-xs font-semibold text-red-500 tabular-nums whitespace-nowrap">
                −{formatCurrency(item.lostRevenuePerDay)}/д
              </span>
            )}
            {(item.status === 'overstock' || item.status === 'dead') && item.frozenAmount > 0 && (
              <span className="text-xs font-semibold text-blue-500 tabular-nums">
                {formatCurrency(item.frozenAmount)}
              </span>
            )}
            {(item.status === 'normal' || item.status === 'critical') && (
              <span className="text-xs text-gray-300">—</span>
            )}
          </td>
        )
      default: return null
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white" onClick={() => setGroupOpen(false)}>

      {/* ── Top controls: Title + Search | Period + Group ─────────────────── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Title */}
          <h1 className="shrink-0 text-base font-semibold text-gray-900">Потребность</h1>

          {/* Search */}
          <div className="relative h-9 w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Поиск по названию..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-full w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition-colors focus:border-gray-400" />
          </div>

          {/* Period tabs — right side */}
          <div className="ml-auto flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  period === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}>
                {p.label}
              </button>
            ))}
          </div>

          {/* Group filter */}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setGroupOpen(v => !v)}
              className={cn(
                'flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
                groupFilter ? 'border-gray-300 text-gray-700' : 'border-gray-200 text-gray-500 hover:border-gray-300',
              )}>
              <span className="max-w-[130px] truncate">{groupFilter ?? 'Группа товаров'}</span>
              <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 transition-transform', groupOpen && 'rotate-180')} />
            </button>
            {groupOpen && (
              <div className="absolute right-0 top-10 z-50 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button onClick={() => { setGroupFilter(null); setGroupOpen(false) }}
                  className={cn('flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50', !groupFilter ? 'font-medium text-gray-900' : 'text-gray-500')}>
                  Все группы
                </button>
                {GROUPS.map(g => (
                  <button key={g} onClick={() => { setGroupFilter(g); setGroupOpen(false) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    {groupFilter === g && <Check className="h-3.5 w-3.5 shrink-0 text-gray-900" />}
                    <span className={groupFilter === g ? '' : 'ml-5'}>{g}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {groupFilter && (
            <button onClick={() => setGroupFilter(null)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <X className="h-3 w-3" /> Сбросить
            </button>
          )}
        </div>
      </div>

      {/* ── Alert strip ─────────────────────────────────────────────────── */}
      {kpi.oos.length > 0 && (
        <div className="shrink-0 flex items-center gap-3 border-b border-red-200 bg-red-50 px-6 py-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{kpi.oos.length} {kpi.oos.length === 1 ? 'товар' : 'товара'} OOS</span>
            {' — '}ежедневные потери{' '}
            <span className="font-semibold">{formatCurrency(kpi.lostPerDay)}</span>
          </p>
          <button onClick={() => setScenario('oos')}
            className="ml-auto text-sm font-medium text-red-600 hover:underline">
            Посмотреть →
          </button>
        </div>
      )}

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-3">
          <button onClick={() => setScenario('oos')}
            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Out of Stock</p>
            <p className={cn('text-2xl font-bold tabular-nums leading-none', kpi.oos.length > 0 ? 'text-red-500' : 'text-gray-900')}>
              {kpi.oos.length} {kpi.oos.length === 1 ? 'товар' : 'товара'}
            </p>
            <p className="text-xs text-gray-500">{kpi.oos.length > 0 ? `Потери ${formatCurrency(kpi.lostPerDay)}/день` : 'Всё в наличии'}</p>
          </button>

          <button onClick={() => setScenario('urgent')}
            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Критично</p>
            <p className={cn('text-2xl font-bold tabular-nums leading-none', kpi.critical.length > 0 ? 'text-amber-500' : 'text-gray-900')}>
              {kpi.critical.length} {kpi.critical.length === 1 ? 'товар' : 'товара'}
            </p>
            <p className="text-xs text-gray-500">Остаток меньше 7 дней</p>
          </button>

          <button onClick={() => setScenario('overstock')}
            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Заморожено</p>
            <p className="text-2xl font-bold tabular-nums leading-none text-blue-500">{formatCurrency(kpi.frozenTotal)}</p>
            <p className="text-xs text-gray-500">{kpi.overstock.length} товара с избытком</p>
          </button>

          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Потери за месяц</p>
            <p className={cn('text-2xl font-bold tabular-nums leading-none', kpi.lostPerDay > 0 ? 'text-red-500' : 'text-gray-900')}>
              {formatCurrency(kpi.lostPerDay * 30)}
            </p>
            <p className="text-xs text-gray-500">При текущих OOS позициях</p>
          </div>

          <button onClick={() => setScenario('urgent')}
            className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:border-gray-300 hover:shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Нужно заказать</p>
            <p className="text-2xl font-bold tabular-nums leading-none text-gray-900">{formatCurrency(kpi.orderTotal)}</p>
            <p className="text-xs text-gray-500">{kpi.orderCount} позиций · {PERIODS.find(p => p.key === period)!.label.toLowerCase()}</p>
          </button>

          <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Среднее покрытие</p>
            <p className={cn('text-2xl font-bold tabular-nums leading-none', kpi.avgDOC < 14 ? 'text-amber-500' : 'text-gray-900')}>
              {Math.round(kpi.avgDOC)} дней
            </p>
            <p className="text-xs text-gray-500">Норма: 21–30 дней</p>
          </div>
        </div>
      </div>

      {/* ── Scenario tabs ────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-2">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 w-fit">
          {SCENARIOS.map(s => (
            <button key={s.key} onClick={() => setScenario(s.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                scenario === s.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}>
              {s.label}
              <span className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
                scenario === s.key ? 'bg-gray-100 text-gray-600' : 'bg-white/60 text-gray-400',
              )}>
                {scenarioCounts[s.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Table */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div ref={tableContainerRef} className="flex-1 overflow-x-auto overflow-y-auto">
            <table style={{ tableLayout: 'fixed', width: tableW, minWidth: tableW, borderCollapse: 'collapse' }}>
              <colgroup>
                <col style={{ width: COL_CB }} />
                <col style={{ width: nameW }} />
                {colOrder.map(k => <col key={k} style={{ width: colWidths[k] }} />)}
                <col style={{ width: COL_ACTION }} />
              </colgroup>
              <thead>
                <tr>
                  {/* Checkbox */}
                  <th style={{ ...thBase, padding: 0, textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <input type="checkbox" checked={allChecked}
                        ref={el => { if (el) el.indeterminate = someChecked }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900" />
                    </div>
                  </th>
                  {/* Name — fixed, not reorderable */}
                  <th style={{ ...thBase, textAlign: 'left', borderRight: '1px solid #e5e7eb' }}>
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Название</span>
                  </th>
                  {/* Reorderable columns */}
                  {colOrder.map(k => renderTh(k))}
                  {/* CTA header */}
                  <th style={{ ...thBase, position: 'sticky', right: 0, zIndex: 4, padding: 0, borderLeft: '1px solid #e5e7eb' }} />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3 + colOrder.length}>
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="mb-3 rounded-2xl bg-gray-100 p-5">
                          <Package className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">Нет позиций по выбранным фильтрам</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(item => {
                  const cfg       = STATUS_CFG[item.status]
                  const isChecked = checkedIds.includes(item.id)
                  const isOpen    = drawerItem?.id === item.id
                  const recQty    = calcRecommendedQty(item, periodDays)

                  return (
                    <tr key={item.id}
                      onClick={() => setDrawerItem(isOpen ? null : item)}
                      className="group cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
                      style={{ background: isOpen ? '#F3F4F6' : (cfg.rowBg || undefined) }}>

                      {/* Checkbox */}
                      <td style={{ padding: 0, position: 'relative', borderRight: '1px solid #f3f4f6' }}
                        onClick={e => toggleCheck(item.id, e)}>
                        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: cfg.borderColor, borderRadius: '0 2px 2px 0' }} />
                        <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <input type="checkbox" checked={isChecked} onChange={() => {}}
                            className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900" />
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '0 12px', overflow: 'hidden', borderRight: '1px solid #f3f4f6' }}>
                        <div style={{ height: 56, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                          <p className={cn('truncate text-sm font-medium', item.status === 'dead' ? 'text-gray-400' : 'text-gray-900')}>
                            {item.name}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-400">{item.manufacturer} · {item.group}</p>
                        </div>
                      </td>

                      {/* Reorderable cells */}
                      {colOrder.map(k => renderCell(k, item, recQty))}

                      {/* CTA sticky right */}
                      <td style={{
                        position: 'sticky', right: 0, zIndex: 2, padding: '0 8px',
                        borderLeft: '1px solid #f3f4f6',
                        background: isOpen ? '#F3F4F6' : (cfg.rowBg || '#FFFFFF'),
                      }}
                        className="transition-colors group-hover:bg-gray-50"
                        onClick={e => e.stopPropagation()}>
                        {recQty > 0 ? (
                          <button
                            onClick={() => handleAddToCart(item, recQty)}
                            title={`Добавить ${recQty} шт. в заказ`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-all hover:border-gray-900 hover:text-gray-900">
                            <CartPlusIcon className="h-4 w-4" />
                          </button>
                        ) : (
                          <div className="h-8 w-8" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Bulk action bar */}
          {checkedIds.length >= 2 && (
            <div className="shrink-0 flex items-center justify-between border-t border-gray-200 bg-white px-6 py-3">
              <span className="text-sm text-gray-600">
                Выбрано: <span className="font-semibold text-gray-900">{checkedIds.length}</span>
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setCheckedIds([])}
                  className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-500 hover:border-gray-300 transition-colors">
                  Отмена
                </button>
                <button onClick={handleBulkAddToCart}
                  className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-black">
                  <Zap className="h-4 w-4" />
                  Добавить в заказ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer */}
        {drawerItem && (
          <NeedDrawer
            item={drawerItem}
            periodDays={periodDays}
            onClose={() => setDrawerItem(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  )
}
