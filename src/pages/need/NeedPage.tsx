import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package, Check, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, X, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { mockMedicines, mockSupplierOffers } from '@/mocks/purchase.mocks'
import { mockPharmacyAnalytics } from '@/mocks/need.mocks'
import { SupplierTable } from '@/pages/purchase/components/SupplierOffers/SupplierTable'
import { usePurchaseCart } from '@/pages/purchase/hooks/usePurchaseCart'
import type {
  Medicine, SupplierOffer, SortField, SortDirection, BonusType, ColumnKey,
} from '@/pages/purchase/types/purchase.types'

// ─── Bonus options ────────────────────────────────────────────────────────────
const bonusOptions: { value: BonusType; label: string }[] = [
  { value: 'cashback',      label: 'Кэшбэк'         },
  { value: 'gift',          label: '+Товар'          },
  { value: 'free_delivery', label: 'Беспл. доставка' },
  { value: 'discount',      label: 'Скидка'          },
]

// ─── useClickOutside ──────────────────────────────────────────────────────────
function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])
  return ref
}

// ─── Searchable filter dropdown ───────────────────────────────────────────────
function FilterDropdown({
  open, onToggle, label, count,
  items, selected, onToggleItem, onClear,
}: {
  open: boolean; onToggle: () => void; label: string; count: number
  items: string[]; selected: string[]
  onToggleItem: (v: string) => void; onClear: () => void
}) {
  const [q, setQ] = useState('')
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current?.focus(), 50) }
  }, [open])

  const filtered = items.filter((i) => i.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          'flex h-9 w-[200px] items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
          open
            ? 'border-gray-400 bg-white text-gray-900'
            : count > 0
              ? 'border-gray-300 bg-white text-gray-700'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700',
        )}
      >
        <span className="flex-1 truncate text-left">{count > 0 ? `${label} · ${count}` : label}</span>
        <ChevronDown className={cn('h-3 w-3 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-[200px] rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Поиск..."
                onClick={(e) => e.stopPropagation()}
                className="h-8 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-7 text-sm outline-none focus:border-gray-400 focus:bg-white"
              />
              {q && (
                <button onClick={(e) => { e.stopPropagation(); setQ('') }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto py-1">
            {filtered.length === 0
              ? <p className="px-3 py-3 text-xs text-gray-400">Ничего не найдено</p>
              : filtered.map((item) => {
                  const checked = selected.includes(item)
                  return (
                    <label key={item} onClick={() => onToggleItem(item)}
                      className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50">
                      <div className={cn(
                        'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                        checked ? 'border-gray-900 bg-gray-900' : 'border-gray-300',
                      )}>
                        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="truncate text-sm text-gray-700">{item}</span>
                    </label>
                  )
                })
            }
          </div>
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">Сбросить всё</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── Bonus filter dropdown (no search) ───────────────────────────────────────
function BonusDropdown({
  open, onToggle, selected, onToggleItem, onClear,
}: {
  open: boolean; onToggle: () => void
  selected: BonusType[]; onToggleItem: (v: BonusType) => void; onClear: () => void
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className={cn(
          'flex h-9 w-[200px] items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors',
          open
            ? 'border-gray-400 bg-white text-gray-900'
            : selected.length
              ? 'border-gray-300 bg-white text-gray-700'
              : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700',
        )}
      >
        <span>{selected.length ? `Бонусы · ${selected.length}` : 'Бонусы'}</span>
        <ChevronDown className={cn('h-3 w-3 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-[180px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {bonusOptions.map((b) => {
            const checked = selected.includes(b.value)
            return (
              <label key={b.value} onClick={() => onToggleItem(b.value)}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-gray-50">
                <div className={cn(
                  'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors',
                  checked ? 'border-gray-900 bg-gray-900' : 'border-gray-300',
                )}>
                  {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm text-gray-700">{b.label}</span>
              </label>
            )
          })}
          {selected.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button onClick={onClear} className="text-xs text-gray-400 hover:text-gray-600">Сбросить всё</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonTable() {
  return (
    <div className="space-y-px px-4 pt-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex h-14 items-center gap-4 rounded-lg">
          <div className="h-3 w-40 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60}ms` }} />
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60 + 30}ms` }} />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-gray-100" style={{ animationDelay: `${i * 60 + 60}ms` }} />
        </div>
      ))}
    </div>
  )
}

// ─── Empty placeholder ───────────────────────────────────────────────────────

function EmptyPlaceholder({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
      <div className="rounded-2xl bg-gray-100 p-5">
        <Package className="h-9 w-9 text-gray-300" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// ─── NeedSupplierPanel — таблица оптовиков без строки фильтров ───────────────
// Фильтрация поднята в NeedPage (шапка). Панель отвечает только за сортировку
// и управление количеством.

interface NeedSupplierPanelProps {
  preFilteredOffers: SupplierOffer[]
  avgPrice: number
  medicine: Medicine | null
  visibleColumns: Record<ColumnKey, boolean>
  isLoading: boolean
}

function NeedSupplierPanel({
  preFilteredOffers, avgPrice, medicine, visibleColumns, isLoading,
}: NeedSupplierPanelProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir,   setSortDir]   = useState<SortDirection>('asc')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItem, removeItem } = usePurchaseCart()

  const sortedOffers = useMemo(() => {
    if (sortField === 'price') {
      return [...preFilteredOffers].sort((a, b) =>
        sortDir === 'asc' ? a.priceWithVat - b.priceWithVat : b.priceWithVat - a.priceWithVat,
      )
    }
    if (sortField === 'expiry') {
      return [...preFilteredOffers].sort((a, b) => {
        const da = new Date(a.expiryDate).getTime()
        const db = new Date(b.expiryDate).getTime()
        return sortDir === 'asc' ? da - db : db - da
      })
    }
    return preFilteredOffers
  }, [preFilteredOffers, sortField, sortDir])

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  function handleQuantityChange(offerId: string, qty: number) {
    setQuantities((prev) => ({ ...prev, [offerId]: qty }))
    const offer = preFilteredOffers.find((o) => o.id === offerId)
    const med = medicine ?? mockMedicines.find((m) => m.id === offer?.medicineId) ?? null
    if (!offer || !med) return
    if (qty <= 0) removeItem(offerId)
    else addItem({ offerId, medicineId: med.id, quantity: qty, offer, medicine: med })
  }

  if (!medicine) {
    return <EmptyPlaceholder title="Выберите лекарство" sub="из списка слева" />
  }

  if (isLoading) {
    return <SkeletonTable />
  }

  return (
    <div className="min-h-0 flex-1">
      <SupplierTable
        offers={sortedOffers}
        avgPrice={avgPrice}
        quantities={quantities}
        onQuantityChange={handleQuantityChange}
        sortField={sortField}
        sortDir={sortDir}
        onSort={handleSort}
        visibleColumns={visibleColumns}
      />
    </div>
  )
}

// ─── PharmacyAnalyticsPanel — аналитика аптек ────────────────────────────────

type AnalyticsSort = 'salesPeriod' | 'stock' | 'needs' | null

interface PharmacyAnalyticsPanelProps {
  medicine: Medicine | null
  period: number
  isLoading: boolean
}

function PharmacyAnalyticsPanel({ medicine, period, isLoading }: PharmacyAnalyticsPanelProps) {
  const [sortCol, setSortCol] = useState<AnalyticsSort>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const rows = useMemo(() => {
    if (!medicine) return []
    return mockPharmacyAnalytics[medicine.id] ?? []
  }, [medicine])

  const scaledRows = useMemo(() =>
    rows.map((r) => {
      const salesPeriod = Math.round(r.sales30d * period / 30)
      const needs       = Math.max(0, salesPeriod - r.stock)
      return { ...r, salesPeriod, needs }
    }),
    [rows, period],
  )

  const sortedRows = useMemo(() => {
    if (!sortCol) return scaledRows
    return [...scaledRows].sort((a, b) =>
      sortDir === 'asc' ? a[sortCol] - b[sortCol] : b[sortCol] - a[sortCol],
    )
  }, [scaledRows, sortCol, sortDir])

  const totals = useMemo(() => ({
    salesPeriod: scaledRows.reduce((s, r) => s + r.salesPeriod, 0),
    stock:       scaledRows.reduce((s, r) => s + r.stock, 0),
    needs:       scaledRows.reduce((s, r) => s + r.needs, 0),
  }), [scaledRows])

  function handleSort(col: AnalyticsSort) {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortCol(col); setSortDir('desc') }
  }

  function SortIcon({ col }: { col: AnalyticsSort }) {
    if (sortCol !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-gray-400" />
    if (sortDir === 'asc')  return <ArrowUp   className="ml-1 inline h-3 w-3 text-gray-700" />
    return <ArrowDown className="ml-1 inline h-3 w-3 text-gray-700" />
  }

  if (!medicine) {
    return <EmptyPlaceholder title="Выберите лекарство" sub="из списка слева" />
  }

  if (isLoading) {
    return <SkeletonTable />
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* Скроллируемая часть */}
      <div className="min-h-0 flex-1 overflow-auto">
        {sortedRows.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Нет данных по выбранному препарату</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr className="h-11 border-b border-gray-200">
                <th className="whitespace-nowrap px-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Аптека
                </th>
                <th className="whitespace-nowrap px-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Цена продаж
                </th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                  onClick={() => handleSort('salesPeriod')}
                >
                  Продажи за {period} дн. <SortIcon col="salesPeriod" />
                </th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                  onClick={() => handleSort('stock')}
                >
                  Остаток <SortIcon col="stock" />
                </th>
                <th className="whitespace-nowrap px-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Послед. закуп
                </th>
                <th
                  className="cursor-pointer select-none whitespace-nowrap px-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                  onClick={() => handleSort('needs')}
                >
                  Потребуется <SortIcon col="needs" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRows.map((row, i) => (
                <tr key={i} className="border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <p className="whitespace-nowrap text-sm font-medium text-gray-900">{row.pharmacyName}</p>
                    <p className="text-xs text-gray-400">{row.manufacturer}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-gray-600">
                    {formatCurrency(row.salePrice)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums font-medium text-gray-800">
                    {row.salesPeriod}
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm tabular-nums text-gray-700">
                    {row.stock}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm tabular-nums text-gray-500">
                    {formatDate(row.lastPurchaseDate)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {row.needs > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[#92400E]">
                        {row.needs} ед.
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-semibold text-[#065F46]">
                        <Check className="h-3 w-3" />
                        Достаточно
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Итого — фиксированная строка снизу */}
      {sortedRows.length > 0 && (
        <div className="shrink-0 border-t-2 border-gray-200 bg-gray-50">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="px-4 py-2.5 text-sm font-bold text-gray-900">Итого</td>
                <td />
                <td className="px-3 py-2.5 text-right text-sm font-bold tabular-nums text-gray-900">
                  {totals.salesPeriod}
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold tabular-nums text-gray-900">
                  {totals.stock}
                </td>
                <td />
                <td className="px-4 py-2.5 text-right">
                  {totals.needs > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[#92400E]">
                      {totals.needs} ед.
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D1FAE5] px-2.5 py-0.5 text-xs font-bold text-[#065F46]">
                      <Check className="h-3 w-3" />
                      Достаточно
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

    </div>
  )
}

// ─── NeedPage ────────────────────────────────────────────────────────────────

export function NeedPage() {
  const navigate   = useNavigate()
  const cartCount  = usePurchaseCart((s) => s.totalItems())

  // ── Лекарство ──
  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null)
  const [medicineSearch,     setMedicineSearch]     = useState('')

  // ── Настройки панели управления ──
  const [period, setPeriod] = useState(30)

  // ── Фильтры оптовиков (подняты в NeedPage → рендерятся в шапке) ──
  const [distributorFilter, setDistributorFilter] = useState<string[]>([])
  const [cityFilter,        setCityFilter]        = useState<string[]>([])
  const [bonusFilter,       setBonusFilter]       = useState<BonusType[]>([])
  //const [visibleColumns, setVisibleColumns]       = useState<Record<ColumnKey, boolean>>({
    //expiry: true, payment: true, price: true, bonus: true, quantity: true,
  //})

  // ── Dropdown open states ──
  const [openDist,  setOpenDist]  = useState(false)
  const [openCity,  setOpenCity]  = useState(false)
  const [openBonus, setOpenBonus] = useState(false)

  const distRef  = useClickOutside(() => setOpenDist(false))
  const cityRef  = useClickOutside(() => setOpenCity(false))
  const bonusRef = useClickOutside(() => setOpenBonus(false))

  // ── Размеры панелей ──
  const [leftW,        setLeftW]        = useState(480)
  const [vertSplitPct, setVertSplitPct] = useState(55)

  // ── Состояния ──
  const [isLoading, setIsLoading] = useState(false)

  const containerRef      = useRef<HTMLDivElement>(null)
  const rightContainerRef = useRef<HTMLDivElement>(null)

  const selectedMedicine = mockMedicines.find((m) => m.id === selectedMedicineId) ?? null

  // Skeleton на смену лекарства
  useEffect(() => {
    if (!selectedMedicineId) return
    setIsLoading(true)
    const t = setTimeout(() => setIsLoading(false), 350)
    return () => clearTimeout(t)
  }, [selectedMedicineId])

  // Сброс фильтров при смене лекарства
  useEffect(() => {
    setDistributorFilter([])
    setCityFilter([])
    setBonusFilter([])
  }, [selectedMedicineId])

  // ── Поиск лекарств ──
  const filteredMedicines = useMemo(() => {
    const q = medicineSearch.toLowerCase().trim()
    if (!q) return mockMedicines
    return mockMedicines.filter(
      (m) => m.name.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q),
    )
  }, [medicineSearch])

  // ── Офферы: база → применяем фильтры ──
  const baseOffers = useMemo(() => {
    if (!selectedMedicine) return []
    return mockSupplierOffers.filter((o) => o.medicineId === selectedMedicine.id)
  }, [selectedMedicine])

  const avgPrice = useMemo(
    () => baseOffers.length ? baseOffers.reduce((s, o) => s + o.priceWithVat, 0) / baseOffers.length : 0,
    [baseOffers],
  )

  const distributors = useMemo(
    () => Array.from(new Set(baseOffers.map((o) => o.distributor.name))).sort(),
    [baseOffers],
  )
  const cities = useMemo(
    () => Array.from(new Set(baseOffers.map((o) => o.distributor.city))).sort(),
    [baseOffers],
  )

  // Применяем все фильтры
  const preFilteredOffers = useMemo(() => {
    let list = baseOffers
    if (distributorFilter.length) list = list.filter((o) => distributorFilter.includes(o.distributor.name))
    if (cityFilter.length)        list = list.filter((o) => cityFilter.includes(o.distributor.city))
    if (bonusFilter.length)       list = list.filter((o) => o.bonus && bonusFilter.includes(o.bonus.type))
    return list
  }, [baseOffers, distributorFilter, cityFilter, bonusFilter])

  // ── Resize: горизонтальный (лево | право) ──
  function startLeftResize(e: React.MouseEvent) {
    e.preventDefault()
    const startX = e.clientX, startW = leftW
    const onMove = (ev: MouseEvent) => setLeftW(Math.max(200, Math.min(560, startW + ev.clientX - startX)))
    const onUp   = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Resize: вертикальный (оптовики | аналитика) ──
  function startVertResize(e: React.MouseEvent) {
    e.preventDefault()
    if (!rightContainerRef.current) return
    const containerH = rightContainerRef.current.offsetHeight
    const startY     = e.clientY
    const startPct   = vertSplitPct
    const onMove = (ev: MouseEvent) => {
      const dy = ev.clientY - startY
      setVertSplitPct(Math.max(20, Math.min(80, startPct + (dy / containerH) * 100)))
    }
    const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp) }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ══ Шапка ══ */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          {/* Период */}
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm text-gray-600">Период:</span>
            <input
              type="number"
              min={1}
              max={365}
              value={period}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v) && v >= 1 && v <= 365) setPeriod(v)
              }}
              className="h-9 w-16 rounded-lg border border-gray-200 bg-white px-2 text-center text-sm font-semibold tabular-nums text-gray-900 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
            />
            <span className="text-sm text-gray-600">дней</span>
          </div>

          <div className="h-5 w-px shrink-0 bg-gray-200" />

          {/* Фильтр: Дистрибьютор */}
          <div ref={distRef} className="relative">
            <FilterDropdown
              open={openDist}
              onToggle={() => { setOpenDist((v) => !v); setOpenCity(false); setOpenBonus(false) }}
              label="Дистрибьютор"
              count={distributorFilter.length}
              items={distributors}
              selected={distributorFilter}
              onToggleItem={(v) => setDistributorFilter((prev) =>
                prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
              onClear={() => setDistributorFilter([])}
            />
          </div>

          {/* Фильтр: Город */}
          <div ref={cityRef} className="relative">
            <FilterDropdown
              open={openCity}
              onToggle={() => { setOpenCity((v) => !v); setOpenDist(false); setOpenBonus(false) }}
              label="Город"
              count={cityFilter.length}
              items={cities}
              selected={cityFilter}
              onToggleItem={(v) => setCityFilter((prev) =>
                prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
              onClear={() => setCityFilter([])}
            />
          </div>

          {/* Фильтр: Бонусы */}
          <div ref={bonusRef} className="relative">
            <BonusDropdown
              open={openBonus}
              onToggle={() => { setOpenBonus((v) => !v); setOpenDist(false); setOpenCity(false) }}
              selected={bonusFilter}
              onToggleItem={(v) => setBonusFilter((prev) =>
                prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
              onClear={() => setBonusFilter([])}
            />
          </div>

          {/* Кнопка очистить */}
          {(distributorFilter.length > 0 || cityFilter.length > 0 || bonusFilter.length > 0) && (
            <button
              onClick={() => { setDistributorFilter([]); setCityFilter([]); setBonusFilter([]) }}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-500 transition-colors hover:border-red-300 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Очистить
            </button>
          )}

          {/* Корзина */}
          <button
            onClick={() => navigate('/cart')}
            className="ml-auto flex h-9 items-center gap-1.5 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-black"
          >
            <ShoppingCart className="h-4 w-4" />
            Корзина
            {cartCount > 0 && (
              <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white px-1 text-xs font-semibold text-gray-900">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ══ Основная область: три панели ══ */}
      <div ref={containerRef} className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Таблица 1: список лекарств ── */}
        <div
          className="flex shrink-0 flex-col overflow-hidden border-r border-gray-200"
          style={{ width: leftW, minWidth: 200 }}
        >
          {/* Поиск */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-3 py-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={medicineSearch}
                onChange={(e) => setMedicineSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-200"
              />
            </div>
          </div>

          {/* Список */}
          <div className="flex-1 overflow-auto">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="h-10 border-b border-gray-200">
                  <th className="w-10 px-3" />
                  <th className="px-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Название
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-10 text-center text-sm text-gray-400">
                      Ничего не найдено
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => {
                    const isSelected = med.id === selectedMedicineId
                    return (
                      <tr
                        key={med.id}
                        onClick={() => setSelectedMedicineId(
                          med.id === selectedMedicineId ? null : med.id,
                        )}
                        className={cn(
                          'group cursor-pointer border-b border-gray-100 transition-colors',
                          isSelected ? 'bg-gray-100' : 'bg-white hover:bg-gray-50',
                        )}
                      >
                        {/* Checkbox + индикатор (как в Магазине) */}
                        <td className="relative w-10 px-3 py-0">
                          {isSelected && (
                            <span
                              style={{
                                position: 'absolute', left: 0, top: 0, bottom: 0,
                                width: 3, background: '#111827', borderRadius: '0 2px 2px 0',
                              }}
                            />
                          )}
                          <div className="flex h-14 items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedMedicineId(
                                  med.id === selectedMedicineId ? null : med.id,
                                )
                              }}
                              className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
                            />
                          </div>
                        </td>
                        {/* Название + производитель */}
                        <td className="px-3 py-0">
                          <div className="flex h-14 flex-col justify-center overflow-hidden">
                            <p className={cn(
                              'truncate text-sm',
                              isSelected ? 'font-semibold text-gray-900' : 'font-medium text-gray-900',
                            )}>
                              {med.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {med.manufacturer} · {med.country}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Resize handle: горизонтальный ── */}
        <div
          onMouseDown={startLeftResize}
          className="flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-gray-200 transition-colors hover:bg-blue-400 active:bg-blue-500"
        />

        {/* ── Правая область: таблицы 2 и 3 стопкой ── */}
        <div ref={rightContainerRef} className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">

          {/* Таблица 2: оптовики (верхняя) */}
          <div
            className="flex flex-col overflow-hidden border-b border-gray-200"
            style={{ height: `${vertSplitPct}%`, minHeight: 120 }}
          >
            <NeedSupplierPanel
              //preFilteredOffers={preFilteredOffers}
              //avgPrice={avgPrice}
              //medicine={selectedMedicine}
              //visibleColumns={visibleColumns}
              //isLoading={isLoading}
            />
          </div>

          {/* ── Resize handle: вертикальный ── */}
          <div
            onMouseDown={startVertResize}
            className="flex h-2 shrink-0 cursor-row-resize items-center justify-center bg-gray-200 transition-colors hover:bg-blue-400 active:bg-blue-500"
          />

          {/* Таблица 3: аналитика аптек (нижняя) */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PharmacyAnalyticsPanel
              medicine={selectedMedicine}
              period={period}
              isLoading={isLoading}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
