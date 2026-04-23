import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ShoppingCart, Trash2, Minus, Plus,
  ChevronDown, CheckCircle2, MapPin,
  Receipt, ArrowRight,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { usePurchaseCart } from '@/pages/purchase/hooks/usePurchaseCart'
import { mockPharmacies } from '@/mocks/purchase.mocks'
import type { CartItem, Pharmacy } from '@/pages/purchase/types/purchase.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DistGroup { id: string; name: string; city: string; items: CartItem[] }
interface ConfirmPayload { groups: DistGroup[]; pharmacy: Pharmacy }

// ─── Qty Control ──────────────────────────────────────────────────────────────

function QtyControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <Minus className="h-3 w-3" />
      </button>
      <span className="w-8 text-center text-sm font-semibold text-gray-900">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-28">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <ShoppingCart className="h-7 w-7 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-900">Корзина пуста</p>
      <p className="mt-1 text-sm text-gray-500">Добавьте препараты из раздела «Закупки»</p>
      <Link to="/purchase" className="mt-5">
        <Button size="sm">Перейти к закупкам</Button>
      </Link>
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ payload, onClose }: { payload: ConfirmPayload; onClose: () => void }) {
  const navigate = useNavigate()
  const orderNum = useState(() => `ЗАК-${Math.floor(10000 + Math.random() * 90000)}`)[0]
  const totalSum = payload.groups.reduce(
    (s, g) => s + g.items.reduce((ss, i) => ss + i.offer.priceWithVat * i.quantity, 0), 0,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-lg">

        <div className="bg-[#F0FDF4] px-6 pb-5 pt-6">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#D1FAE5]">
            <CheckCircle2 className="h-6 w-6 text-[#065F46]" />
          </div>
          <p className="text-lg font-bold text-gray-900">Заказ успешно создан</p>
          <p className="mt-0.5 text-sm text-gray-500">{payload.pharmacy.name}</p>
          <div className="mt-4 flex items-center justify-between rounded-xl border border-[#BBF7D0] bg-white px-4 py-3">
            <span className="text-xs text-gray-400">Номер заказа</span>
            <span className="font-mono text-base font-bold text-gray-900">{orderNum}</span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-500">Сумма заказа</span>
            <span className="text-sm font-bold text-gray-900">{formatCurrency(totalSum)}</span>
          </div>
          <div className="my-3 border-t border-gray-100" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Отправлено в Telegram
          </p>
          <div className="space-y-1.5">
            {payload.groups.map(group => (
              <div key={group.id} className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{group.name}</span>
                <span className="shrink-0 text-xs text-gray-400">
                  {group.items.length} поз. · {group.items.reduce((s, i) => s + i.quantity, 0)} ед.
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2.5 border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => { onClose(); navigate('/orders') }}
            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50"
          >
            Мои заказы <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white transition-all duration-200 hover:bg-black"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CartPage ─────────────────────────────────────────────────────────────────

export function CartPage() {
  const items      = usePurchaseCart(s => s.items)
  const removeItem = usePurchaseCart(s => s.removeItem)
  const updateQty  = usePurchaseCart(s => s.updateQuantity)

  const [pharmacyId,     setPharmacyId]     = useState(mockPharmacies[0]?.id ?? '')
  const [checkedIds,     setCheckedIds]     = useState<Set<string>>(new Set())
  const [successPayload, setSuccessPayload] = useState<ConfirmPayload | null>(null)
  const [distFilter,     setDistFilter]     = useState<string | null>(null)
  const [collapsed,      setCollapsed]      = useState<Set<string>>(new Set())

  const pharmacy = mockPharmacies.find(p => p.id === pharmacyId) ?? mockPharmacies[0]

  // Все группы (для чипсов и инвойса)
  const groups = useMemo((): DistGroup[] => {
    const map = new Map<string, DistGroup>()
    for (const item of items) {
      const { id, name, city } = item.offer.distributor
      if (!map.has(id)) map.set(id, { id, name, city, items: [] })
      map.get(id)!.items.push(item)
    }
    return Array.from(map.values())
  }, [items])

  // Группы с учётом фильтра оптовика
  const filteredGroups = useMemo(() =>
    distFilter ? groups.filter(g => g.id === distFilter) : groups,
    [groups, distFilter],
  )

  // Позиции только из видимых групп — для корректного "выбрать все"
  const filteredItems = useMemo(() => filteredGroups.flatMap(g => g.items), [filteredGroups])

  // ── Сворачивание ─────────────────────────────────────────────────────────
  function toggleCollapse(id: string) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Чекбоксы ─────────────────────────────────────────────────────────────
  const toggleItem = useCallback((offerId: string) => {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(offerId) ? next.delete(offerId) : next.add(offerId)
      return next
    })
  }, [])

  const toggleGroup = useCallback((group: DistGroup) => {
    const allIn = group.items.every(i => checkedIds.has(i.offerId))
    setCheckedIds(prev => {
      const next = new Set(prev)
      group.items.forEach(i => allIn ? next.delete(i.offerId) : next.add(i.offerId))
      return next
    })
  }, [checkedIds])

  // "Выбрать все" работает только по видимым позициям
  const toggleAll = useCallback(() => {
    const allVisible = filteredItems.every(i => checkedIds.has(i.offerId))
    setCheckedIds(prev => {
      const next = new Set(prev)
      filteredItems.forEach(i => allVisible ? next.delete(i.offerId) : next.add(i.offerId))
      return next
    })
  }, [filteredItems, checkedIds])

  const allChecked  = filteredItems.length > 0 && filteredItems.every(i => checkedIds.has(i.offerId))
  const someChecked = !allChecked && filteredItems.some(i => checkedIds.has(i.offerId))
  const cbRef = useRef<HTMLInputElement>(null)
  if (cbRef.current) cbRef.current.indeterminate = someChecked

  // ── Инвойс ───────────────────────────────────────────────────────────────
  const invoiceGroups = useMemo(() =>
    groups
      .map(g => {
        const selected = g.items.filter(i => checkedIds.has(i.offerId))
        if (!selected.length) return null
        return {
          ...g,
          items:    selected,
          subtotal: selected.reduce((s, i) => s + i.offer.priceWithVat * i.quantity, 0),
          qty:      selected.reduce((s, i) => s + i.quantity, 0),
        }
      })
      .filter(Boolean) as Array<DistGroup & { subtotal: number; qty: number }>,
    [groups, checkedIds],
  )
  const hasSelection   = invoiceGroups.length > 0
  const invoiceTotal   = invoiceGroups.reduce((s, g) => s + g.subtotal, 0)
  const invoiceItemCnt = invoiceGroups.reduce((s, g) => s + g.items.length, 0)
  const invoiceQtyCnt  = invoiceGroups.reduce((s, g) => s + g.qty, 0)

  function createOrder() {
    if (!invoiceGroups.length) return
    setSuccessPayload({ groups: invoiceGroups, pharmacy })
  }

  function handleSuccessClose() {
    if (successPayload) {
      successPayload.groups.forEach(g => g.items.forEach(i => removeItem(i.offerId)))
      setCheckedIds(new Set())
    }
    setSuccessPayload(null)
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (items.length === 0 && !successPayload) {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">Корзина</h1>
        </div>
        <EmptyCart />
      </div>
    )
  }

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Корзина</h1>
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
            {items.length}
          </span>
        </div>
      </div>

      {/* ── Тело ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* ── Левая часть ── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Тулбар: фильтр + выбрать все */}
          <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-3">

              {/* Чекбокс «выбрать все» */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  ref={cbRef}
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
                />
                <span className="text-xs font-medium text-gray-500">Все</span>
              </label>

              <div className="h-4 w-px bg-gray-200" />

              {/* Чипсы оптовиков */}
              <div className="flex flex-1 gap-1.5 overflow-x-auto">
                <button
                  onClick={() => setDistFilter(null)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                    distFilter === null
                      ? 'bg-gray-900 text-white'
                      : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  Все ({items.length})
                </button>
                {groups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setDistFilter(prev => prev === g.id ? null : g.id)}
                    className={cn(
                      'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150',
                      distFilter === g.id
                        ? 'bg-gray-900 text-white'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {g.name} ({g.items.length})
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Список групп */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-3">
              {filteredGroups.map(group => {
                const isCollapsed      = collapsed.has(group.id)
                const groupAllChecked  = group.items.every(i => checkedIds.has(i.offerId))
                const groupSomeChecked = group.items.some(i => checkedIds.has(i.offerId))
                const groupTotal       = group.items.reduce((s, i) => s + i.offer.priceWithVat * i.quantity, 0)
                const groupQty         = group.items.reduce((s, i) => s + i.quantity, 0)

                return (
                  <div key={group.id} className="overflow-hidden rounded-xl border border-gray-200">

                    {/* Заголовок оптовика */}
                    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={groupAllChecked}
                        ref={el => { if (el) el.indeterminate = groupSomeChecked && !groupAllChecked }}
                        onChange={() => toggleGroup(group)}
                        className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-gray-900"
                      />
                      <button
                        onClick={() => toggleCollapse(group.id)}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
                        aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
                      >
                        <ChevronDown className={cn(
                          'h-3.5 w-3.5 transition-transform duration-150',
                          isCollapsed && '-rotate-90',
                        )} />
                      </button>
                      <span className="text-sm font-semibold text-gray-900">{group.name}</span>
                      <span className="text-xs text-gray-400">
                        {group.city} · {group.items.length} поз. · {groupQty} ед.
                      </span>
                      <span className="ml-auto text-sm font-bold text-gray-900">
                        {formatCurrency(groupTotal)}
                      </span>
                    </div>

                    {/* Строки товаров */}
                    {!isCollapsed && (
                      <div className="divide-y divide-gray-100 bg-white">
                        {group.items.map(item => {
                          const isChecked = checkedIds.has(item.offerId)
                          const lineTotal = item.offer.priceWithVat * item.quantity
                          return (
                            <div
                              key={item.offerId}
                              className={cn(
                                'flex items-center gap-3 px-4 py-3 transition-colors',
                                isChecked ? 'bg-gray-50' : 'hover:bg-gray-50/60',
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItem(item.offerId)}
                                className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-gray-900"
                              />
                              {/* Название + производитель */}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {item.medicine.name}
                                </p>
                                <p className="truncate text-xs text-gray-400">
                                  {item.medicine.manufacturer} · {item.medicine.country}
                                </p>
                              </div>
                              {/* Цена за шт */}
                              <span className="w-24 shrink-0 text-right text-sm text-gray-400">
                                {formatCurrency(item.offer.priceWithVat)}
                              </span>
                              {/* Количество */}
                              <QtyControl
                                value={item.quantity}
                                onChange={v => v === 0 ? removeItem(item.offerId) : updateQty(item.offerId, v)}
                              />
                              {/* Сумма */}
                              <span className="w-24 shrink-0 text-right text-sm font-semibold text-gray-900">
                                {formatCurrency(lineTotal)}
                              </span>
                              {/* Удалить */}
                              <button
                                onClick={() => removeItem(item.offerId)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                                aria-label="Удалить"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Правая часть: инвойс ── */}
        <div className="flex w-[375px] shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white">

          <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3">
            <Receipt className="h-4 w-4 text-gray-900" />
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-900">Заказ</p>
          </div>

          {!hasSelection ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200">
                <Receipt className="h-6 w-6 text-gray-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Заказ пуст</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  Отметьте товары слева — они появятся здесь
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto">

                {/* Аптека */}
                <div className="border-b border-gray-100 px-4 py-3.5">
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <select
                      value={pharmacyId}
                      onChange={e => setPharmacyId(e.target.value)}
                      className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm font-medium text-gray-900 transition-all hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                    >
                      {mockPharmacies.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {/* Состав */}
                <div className="px-4 py-3.5">
                  <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-gray-900">
                    Состав заказа
                  </p>
                  <div className="space-y-2">
                    {invoiceGroups.map(g => (
                      <div key={g.id} className="overflow-hidden rounded-xl border border-gray-200">
                        <div className="border-b border-gray-100 bg-gray-50 px-3.5 py-2.5">
                          <p className="truncate text-sm font-semibold text-gray-900">{g.name}</p>
                          <p className="text-xs text-gray-400">{g.city}</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {g.items.map(item => (
                            <div key={item.offerId} className="flex items-center gap-2 px-3.5 py-2">
                              <p className="min-w-0 flex-1 truncate text-xs text-gray-600">
                                {item.medicine.name}
                              </p>
                              <span className="shrink-0 text-xs text-gray-400">×{item.quantity}</span>
                              <span className="shrink-0 text-xs font-semibold text-gray-900">
                                {formatCurrency(item.offer.priceWithVat * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-3.5 py-2">
                          <span className="text-xs text-gray-400">
                            {g.items.length} поз. · {g.qty} ед.
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(g.subtotal)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Статистика */}
                <div className="border-t border-gray-100 px-4 py-3.5">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-gray-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{invoiceItemCnt}</p>
                      <p className="mt-0.5 text-xs text-gray-400">позиций</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{invoiceQtyCnt}</p>
                      <p className="mt-0.5 text-xs text-gray-400">единиц</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-2 py-2.5 text-center">
                      <p className="text-base font-bold text-gray-900">{invoiceGroups.length}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {invoiceGroups.length === 1 ? 'оптовик' : 'оптовика'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Итого + кнопка */}
              <div className="shrink-0 border-t border-gray-200">
                <div className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-gray-500">Итого к оплате</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(invoiceTotal)}</span>
                </div>
                <div className="border-t border-gray-100 px-5 py-4">
                  <button
                    onClick={createOrder}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-900 text-sm font-semibold text-white transition-all duration-200 hover:bg-black"
                  >
                    Создать заказ
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {successPayload && (
        <SuccessModal payload={successPayload} onClose={handleSuccessClose} />
      )}
    </div>
  )
}
