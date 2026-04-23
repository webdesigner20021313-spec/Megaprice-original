import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { mockOrders } from '@/mocks/orders.mocks'
import {
  ORDER_STATUS_CONFIG,
  type OrderStatus,
} from '@/pages/orders/types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, text } = ORDER_STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', bg, text)}>
      {label}
    </span>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
        <Package className="h-5 w-5 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-900">
        {hasFilters ? 'Заказов не найдено' : 'Заказов пока нет'}
      </p>
      <p className="mt-1 text-sm text-gray-500">
        {hasFilters
          ? 'Попробуйте изменить фильтры или поисковый запрос'
          : 'Созданные заказы будут отображаться здесь'}
      </p>
    </div>
  )
}

// ─── OrderHistoryPage ─────────────────────────────────────────────────────────

export function OrderHistoryPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filteredOrders = useMemo(() => {
    return mockOrders
      .filter(o => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          o.number.toLowerCase().includes(q) ||
          o.pharmacyName.toLowerCase().includes(q) ||
          o.pharmacyCity.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [search])

  const hasFilters = search.trim().length > 0

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Заказы</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {mockOrders.length}
            </span>
          </div>

          {/* Поиск */}
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Номер, аптека, оптовик..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </div>
        </div>
      </div>


      {/* ── Список заказов ── */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-5">
        {filteredOrders.length === 0 ? (
          <EmptyState hasFilters={hasFilters} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Номер</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Аптека</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Оптовик</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Поз.</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Сумма</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                  >
                    {/* Номер */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {order.number}
                      </span>
                    </td>

                    {/* Аптека */}
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{order.pharmacyName}</p>
                      <p className="text-xs text-gray-400">{order.pharmacyCity}</p>
                    </td>

                    {/* Оптовик(и) */}
                    <td className="px-4 py-3.5">
                      {order.groups.length === 1 ? (
                        <>
                          <p className="text-sm text-gray-700">{order.groups[0].distributorName}</p>
                          <p className="text-xs text-gray-400">{order.groups[0].distributorCity}</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-700">{order.groups.length} оптовика</p>
                          <p className="truncate text-xs text-gray-400 max-w-[160px]">
                            {order.groups.map(g => g.distributorName.replace('ООО «', '').replace('»', '')).join(', ')}
                          </p>
                        </>
                      )}
                    </td>

                    {/* Позиций */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-sm text-gray-600">
                        {order.groups.reduce((s, g) => s + g.items.length, 0)}
                      </span>
                    </td>

                    {/* Сумма */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalSum)}
                      </span>
                    </td>

                    {/* Дата */}
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    {/* Статус */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
              <p className="text-xs text-gray-400">
                Показано {filteredOrders.length} из {mockOrders.length} заказов
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
