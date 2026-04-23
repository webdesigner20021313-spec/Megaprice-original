import { type ReactNode, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Building2, Calendar, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { mockOrders } from '@/mocks/orders.mocks'
import { ORDER_STATUS_CONFIG, type OrderStatus } from '@/pages/orders/types'

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, text } = ORDER_STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', bg, text)}>
      {label}
    </span>
  )
}


// ─── Info Card ────────────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Not Found ────────────────────────────────────────────────────────────────

function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <p className="text-sm font-semibold text-gray-900">Заказ не найден</p>
      <button
        onClick={() => navigate('/orders')}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Вернуться к списку
      </button>
    </div>
  )
}

// ─── OrderDetailPage ──────────────────────────────────────────────────────────

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const order = mockOrders.find(o => o.id === id)

  if (!order) return <NotFound />

  const totalItems = order.groups.reduce((s, g) => s + g.items.length, 0)
  const multiGroup = order.groups.length > 1

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Назад */}
          <button
            onClick={() => navigate('/orders')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Назад к заказам"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Заголовок */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-gray-900">{order.number}</h1>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* ── Контент (скролл) ── */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-5">
        <div className="mx-auto max-w-4xl space-y-5">

          {/* ── Информация ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoCard
              icon={<MapPin className="h-4 w-4" />}
              label="Аптека получатель"
              value={order.pharmacyName}
              sub={`${order.pharmacyAddress}, ${order.pharmacyCity}`}
            />
            <InfoCard
              icon={<Building2 className="h-4 w-4" />}
              label={multiGroup ? `${order.groups.length} оптовика` : 'Оптовик'}
              value={
                multiGroup
                  ? order.groups.map(g => g.distributorName.replace('ООО «', '').replace('»', '')).join(', ')
                  : order.groups[0].distributorName
              }
              sub={multiGroup ? undefined : order.groups[0].distributorCity}
            />
            <InfoCard
              icon={<Calendar className="h-4 w-4" />}
              label="Дата создания"
              value={formatDateTime(order.createdAt)}
            />
            <InfoCard
              icon={<Wallet className="h-4 w-4" />}
              label="Итого"
              value={formatCurrency(order.totalSum)}
              sub={`${order.totalQty} ед. · ${totalItems} поз.`}
            />
          </div>

          {/* ── Статус заказа ── */}
          <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4">
            <p className="text-sm font-semibold text-gray-900">Статус заказа</p>
            <div className="flex items-center gap-2">
              {(['sent', 'completed'] as const).map((s, i) => {
                const isCurrent = order.status === s
                const isDone    = order.status === 'completed' && s === 'sent'
                const { label, bg, text } = ORDER_STATUS_CONFIG[s]
                return (
                  <div key={s} className="flex items-center gap-2">
                    {i > 0 && <div className={cn('h-px w-8', isDone || isCurrent ? 'bg-gray-900' : 'bg-gray-200')} />}
                    <span className={cn(
                      'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      isCurrent || isDone ? `${bg} ${text}` : 'bg-gray-100 text-gray-400'
                    )}>
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Позиции ── */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
              <p className="text-sm font-semibold text-gray-900">
                Препараты
                <span className="ml-2 text-xs font-normal text-gray-500">
                  {totalItems} поз. · {order.totalQty} ед.
                </span>
              </p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Препарат</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500">Производитель</th>
                  <th className="px-5 py-2.5 text-center text-xs font-semibold text-gray-500">Кол-во</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Цена / шт</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-gray-500">Итого</th>
                </tr>
              </thead>
              <tbody>
                {order.groups.map((group, gi) => (
                  <Fragment key={gi}>
                    {/* Заголовок оптовика — только если несколько */}
                    {multiGroup && (
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <td colSpan={3} className="px-5 py-2.5">
                          <p className="text-sm font-semibold text-gray-800">{group.distributorName}</p>
                          <p className="text-xs text-gray-400">{group.distributorCity}</p>
                        </td>
                        <td colSpan={2} className="px-5 py-2.5 text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(group.subtotal)}
                          </span>
                        </td>
                      </tr>
                    )}

                    {/* Строки препаратов */}
                    {group.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3.5">
                          <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-sm text-gray-600">{item.manufacturer}</p>
                          <p className="text-xs text-gray-400">{item.country}</p>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="text-sm font-medium text-gray-900">{item.quantity}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm text-gray-600">{formatCurrency(item.priceWithVat)}</span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.quantity * item.priceWithVat)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>

            {/* Итого */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3.5">
              <span className="text-sm text-gray-500">{order.totalQty} единиц</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(order.totalSum)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
