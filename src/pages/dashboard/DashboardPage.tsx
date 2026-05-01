import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Package, Clock, TrendingUp, CheckCircle2,
  ArrowRight, ShoppingCart, Layers, Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { mockOrders } from '@/mocks/orders.mocks'
import { mockPharmacies } from '@/mocks/purchase.mocks'
import { ORDER_STATUS_CONFIG } from '@/pages/orders/types'
import { mockUser } from '@/data/user'
import type { OrderStatus } from '@/pages/orders/types'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: string
  sub?: string
}

function KpiCard({ icon, iconBg, label, value, sub }: KpiCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Status Badge (inline) ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, text } = ORDER_STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', bg, text)}>
      {label}
    </span>
  )
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

const STATUS_ORDER: OrderStatus[] = ['new', 'completed', 'cancelled']

export function DashboardPage() {
  const navigate = useNavigate()

  // ── Computed stats ──────────────────────────────────────────────────────────
  const totalOrders    = mockOrders.length
  const activeCount    = mockOrders.filter(o => o.status === 'new').length
  const completedCount = mockOrders.filter(o => o.status === 'completed').length
  const monthSum       = mockOrders.reduce((s, o) => s + o.totalSum, 0)

  const statusCounts = useMemo(() => {
    const map: Partial<Record<OrderStatus, number>> = {}
    for (const o of mockOrders) {
      map[o.status] = (map[o.status] ?? 0) + 1
    }
    return map
  }, [])

  const recentOrders = useMemo(() =>
    [...mockOrders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6),
    []
  )

  // ── Greeting ────────────────────────────────────────────────────────────────
  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Доброе утро'
    if (h < 17) return 'Добрый день'
    return 'Добрый вечер'
  }, [])

  const firstName = mockUser.name.split(' ')[0]

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ────────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {greeting}, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          {/* Быстрые действия */}
          <div className="flex items-center gap-2">
            <Link
              to="/purchase"
              className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <ShoppingCart className="h-4 w-4 text-gray-400" />
              Закупки
            </Link>
            <Link
              to="/orders"
              className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-black"
            >
              <Layers className="h-4 w-4" />
              Заказы
            </Link>
          </div>
        </div>
      </div>

      {/* ── Контент ──────────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/40 px-6 py-5">
        <div className="mx-auto max-w-6xl space-y-5">

          {/* ── KPI карточки ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <KpiCard
              icon={<Package className="h-5 w-5 text-gray-500" />}
              iconBg="bg-gray-100"
              label="Всего заказов"
              value={String(totalOrders)}
              sub="за всё время"
            />
            <KpiCard
              icon={<Clock className="h-5 w-5 text-[#1E40AF]" />}
              iconBg="bg-[#DBEAFE]"
              label="Активных"
              value={String(activeCount)}
              sub="заказов в работе"
            />
            <KpiCard
              icon={<TrendingUp className="h-5 w-5 text-[#065F46]" />}
              iconBg="bg-[#D1FAE5]"
              label="Оборот"
              value={formatCurrency(monthSum)}
              sub="сумма всех заказов"
            />
            <KpiCard
              icon={<CheckCircle2 className="h-5 w-5 text-[#065F46]" />}
              iconBg="bg-[#D1FAE5]"
              label="Завершено"
              value={String(completedCount)}
              sub={`из ${totalOrders} заказов`}
            />
          </div>

          {/* ── Основной блок: последние заказы + сводка ───────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">

            {/* Последние заказы */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
                <p className="text-sm font-semibold text-gray-900">Последние заказы</p>
                <Link
                  to="/orders"
                  className="flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900"
                >
                  Все заказы
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Номер</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Аптека</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Сумма</th>
                    <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Дата</th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {order.number}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">{order.pharmacyName}</p>
                        <p className="text-xs text-gray-400">{order.pharmacyCity}</p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(order.totalSum)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Правая колонка */}
            <div className="flex flex-col gap-4">

              {/* По статусам */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-3.5">
                  <p className="text-sm font-semibold text-gray-900">По статусам</p>
                </div>
                <div className="divide-y divide-gray-50 px-5 py-1">
                  {STATUS_ORDER.map(status => {
                    const count = statusCounts[status] ?? 0
                    if (count === 0) return null
                    const { label, bg, text } = ORDER_STATUS_CONFIG[status]
                    return (
                      <div key={status} className="flex items-center justify-between py-2.5">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                          bg, text
                        )}>
                          {label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Аптеки */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
                  <p className="text-sm font-semibold text-gray-900">Мои аптеки</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                    {mockPharmacies.length}
                  </span>
                </div>
                <div className="divide-y divide-gray-50">
                  {mockPharmacies.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <Building2 className="h-4 w-4 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.city}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
