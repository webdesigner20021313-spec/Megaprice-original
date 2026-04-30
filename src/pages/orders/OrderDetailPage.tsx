import { useState, type ReactNode, Fragment } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Building2, Calendar, Wallet,
  Send, Download, FileText, Check, Mail, MessageCircle,
  AlertCircle, CheckCircle2, Clock,
} from 'lucide-react'
// Note: AlertCircle, Check, Clock used in table group rows
import * as XLSX from 'xlsx'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { mockOrders } from '@/mocks/orders.mocks'
import {
  ORDER_STATUS_CONFIG,
  type OrderStatus,
  type OrderDistributorGroup,
} from '@/pages/orders/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadGroupExcel(group: OrderDistributorGroup, orderNumber: string) {
  const rows = group.items.map(item => ({
    'Препарат':        item.medicineName,
    'Производитель':   item.manufacturer,
    'Страна':          item.country,
    'Кол-во':          item.quantity,
    'Цена с НДС':      item.priceWithVat,
    'Итого':           item.quantity * item.priceWithVat,
  }))
  rows.push({
    'Препарат':      'ИТОГО',
    'Производитель': '',
    'Страна':        '',
    'Кол-во':        group.items.reduce((s, i) => s + i.quantity, 0),
    'Цена с НДС':    0,
    'Итого':         group.subtotal,
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Заказ')
  XLSX.writeFile(wb, `${orderNumber}_${group.distributorName}.xlsx`)
}

function downloadFullExcel(order: typeof mockOrders[0]) {
  const rows: Record<string, string | number>[] = []

  for (const group of order.groups) {
    rows.push({
      'Оптовик': group.distributorName,
      'Город':   group.distributorCity,
      'Препарат': '',
      'Производитель': '',
      'Страна': '',
      'Кол-во': '',
      'Цена с НДС': '',
      'Итого': '',
    })
    for (const item of group.items) {
      rows.push({
        'Оптовик':       '',
        'Город':         '',
        'Препарат':      item.medicineName,
        'Производитель': item.manufacturer,
        'Страна':        item.country,
        'Кол-во':        item.quantity,
        'Цена с НДС':    item.priceWithVat,
        'Итого':         item.quantity * item.priceWithVat,
      })
    }
    rows.push({
      'Оптовик':       `Итого ${group.distributorName}`,
      'Город':         '',
      'Препарат':      '',
      'Производитель': '',
      'Страна':        '',
      'Кол-во':        group.items.reduce((s, i) => s + i.quantity, 0),
      'Цена с НДС':    '',
      'Итого':         group.subtotal,
    })
  }

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Заказ')
  XLSX.writeFile(wb, `${order.number}.xlsx`)
}

function printInvoice(order: typeof mockOrders[0]) {
  const win = window.open('', '_blank')
  if (!win) return
  const totalItems = order.groups.reduce((s, g) => s + g.items.length, 0)

  const groupsHtml = order.groups.map(group => `
    ${order.groups.length > 1 ? `
      <tr style="background:#f9fafb; border-top:2px solid #e5e7eb;">
        <td colspan="5" style="padding:8px 12px; font-weight:700; font-size:13px;">${group.distributorName} — ${group.distributorCity}</td>
      </tr>
    ` : ''}
    ${group.items.map((item, idx) => `
      <tr style="border-bottom:1px solid #f3f4f6; background:${idx % 2 === 1 ? '#f9fafb' : '#fff'}">
        <td style="padding:8px 12px; font-size:12px;">${item.medicineName}</td>
        <td style="padding:8px 12px; font-size:12px; color:#6b7280;">${item.manufacturer}</td>
        <td style="padding:8px 12px; font-size:12px; text-align:center;">${item.quantity}</td>
        <td style="padding:8px 12px; font-size:12px; text-align:right;">${item.priceWithVat.toLocaleString('ru-RU')} UZS</td>
        <td style="padding:8px 12px; font-size:12px; text-align:right; font-weight:600;">${(item.quantity * item.priceWithVat).toLocaleString('ru-RU')} UZS</td>
      </tr>
    `).join('')}
    ${order.groups.length > 1 ? `
      <tr style="background:#f9fafb; border-top:1px solid #e5e7eb;">
        <td colspan="4" style="padding:6px 12px; font-size:12px; text-align:right; color:#6b7280;">Итого ${group.distributorName}:</td>
        <td style="padding:6px 12px; font-size:12px; text-align:right; font-weight:700;">${group.subtotal.toLocaleString('ru-RU')} UZS</td>
      </tr>
    ` : ''}
  `).join('')

  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Инвойс ${order.number}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family: -apple-system, Arial, sans-serif; color:#111827; padding:32px; font-size:13px; }
        .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; }
        .logo { font-size:20px; font-weight:800; letter-spacing:-0.5px; }
        .order-num { font-size:24px; font-weight:700; margin-top:4px; }
        .meta { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:24px; padding:16px; background:#f9fafb; border-radius:8px; }
        .meta-item label { font-size:10px; color:#9ca3af; text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:4px; }
        .meta-item span { font-size:13px; font-weight:600; }
        table { width:100%; border-collapse:collapse; margin-bottom:16px; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
        thead tr { background:#f9fafb; border-bottom:1px solid #e5e7eb; }
        th { padding:10px 12px; font-size:11px; font-weight:600; color:#6b7280; text-align:left; text-transform:uppercase; letter-spacing:0.03em; }
        .total-row td { padding:12px; font-size:14px; font-weight:700; background:#111827; color:#fff; }
        @media print { body { padding:16px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">MegaPrice</div>
          <div class="order-num">${order.number}</div>
          <div style="margin-top:4px; font-size:12px; color:#6b7280;">${formatDateTime(order.createdAt)}</div>
        </div>
        <div style="text-align:right; font-size:12px; color:#6b7280;">
          <div style="font-weight:600; color:#111827; font-size:14px;">${ORDER_STATUS_CONFIG[order.status].label}</div>
        </div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <label>Аптека</label>
          <span>${order.pharmacyName}</span>
          <div style="font-size:11px; color:#6b7280; margin-top:2px;">${order.pharmacyAddress}, ${order.pharmacyCity}</div>
        </div>
        <div class="meta-item">
          <label>Позиций / Единиц</label>
          <span>${totalItems} поз. / ${order.totalQty} ед.</span>
        </div>
        <div class="meta-item">
          <label>Сумма заказа</label>
          <span style="font-size:16px;">${order.totalSum.toLocaleString('ru-RU')} UZS</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Препарат</th>
            <th>Производитель</th>
            <th style="text-align:center;">Кол-во</th>
            <th style="text-align:right;">Цена / шт</th>
            <th style="text-align:right;">Итого</th>
          </tr>
        </thead>
        <tbody>
          ${groupsHtml}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="4" style="text-align:right;">ИТОГО</td>
            <td style="text-align:right;">${order.totalSum.toLocaleString('ru-RU')} UZS</td>
          </tr>
        </tfoot>
      </table>
    </body>
    </html>
  `)
  win.document.close()
  win.print()
}

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

function InfoCard({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
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
      <button onClick={() => navigate('/orders')} className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline">
        Вернуться к списку
      </button>
    </div>
  )
}

// ─── SendPanel ────────────────────────────────────────────────────────────────

function SendPanel({ groups }: { groups: OrderDistributorGroup[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-5 py-3.5">
        <Send className="h-4 w-4 text-gray-500" />
        <p className="text-sm font-semibold text-gray-900">Скачать заказ по оптовикам</p>
        <span className="text-xs text-gray-400">— скачайте часть каждого оптовика и отправьте самостоятельно</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100">
        {groups.map(group => {
          const isTg    = group.contactType === 'telegram'
          const itemQty = group.items.reduce((s, i) => s + i.quantity, 0)

          return (
            <div key={group.distributorId} className="flex items-center gap-4 px-5 py-3.5">
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{group.distributorName}</p>
                  <span className="text-xs text-gray-400">{group.distributorCity}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {isTg
                    ? <MessageCircle className="h-3 w-3 text-blue-500" />
                    : <Mail className="h-3 w-3 text-gray-400" />
                  }
                  <span className="text-xs text-gray-500">{group.contact}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    {group.items.length} поз. · {itemQty} ед. · {formatCurrency(group.subtotal)}
                  </span>
                </div>
              </div>

              {/* Скачать */}
              <button
                onClick={() => downloadGroupExcel(group, group.distributorName)}
                className="flex items-center gap-1.5 rounded-lg border border-green-600 bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 hover:border-green-700 transition-colors"
              >
                <Download className="h-3 w-3" />
                Скачать
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── OrderDetailPage ──────────────────────────────────────────────────────────

export function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const order = mockOrders.find(o => o.id === id)

  const [localStatus, setLocalStatus] = useState<OrderStatus | null>(null)
  const groupSendStatus: Record<string, 'sent' | 'pending'> = {}

  order.groups.forEach(group => {
  groupSendStatus[group.distributorId] = 'pending'
  })
  if (!order) return <NotFound />

  const effectiveStatus: OrderStatus = localStatus ?? order.status

  const totalItems  = order.groups.reduce((s, g) => s + g.items.length, 0)
  const multiGroup  = order.groups.length > 1
  const isActive    = effectiveStatus === 'new' || effectiveStatus === 'partial' || effectiveStatus === 'sent'
  const showSendPanel = effectiveStatus === 'new' || effectiveStatus === 'partial'

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-gray-900">{order.number}</h1>
            <StatusBadge status={effectiveStatus} />
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => printInvoice(order)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Инвойс
            </button>
            <button
              onClick={() => downloadFullExcel(order)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-green-600 bg-green-600 px-3 text-sm font-medium text-white hover:bg-green-700 hover:border-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
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
              value={multiGroup
                ? order.groups.map(g => g.distributorName).join(', ')
                : order.groups[0].distributorName}
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

          {/* ── Отправка оптовикам (для new/partial) ── */}
          {showSendPanel && (
            <SendPanel groups={order.groups} />
          )}

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
                    {multiGroup && (
                      <tr className="border-b border-gray-200 bg-gray-100">
                        <td colSpan={3} className="px-5 py-2.5">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-gray-800">{group.distributorName}</p>
                            <span className="text-xs text-gray-400">{group.distributorCity}</span>
                            {groupSendStatus[group.distributorId] === 'sent'
                              ? <span className="inline-flex items-center gap-0.5 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700"><Check className="h-2.5 w-2.5" /> Отправлено</span>
                              : <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"><Clock className="h-2.5 w-2.5" /> Ожидает</span>
                            }
                          </div>
                        </td>
                        <td colSpan={2} className="px-5 py-2.5 text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {formatCurrency(group.subtotal)}
                          </span>
                        </td>
                      </tr>
                    )}

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

            <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-5 py-3.5">
              <span className="text-sm text-gray-500">{order.totalQty} единиц</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(order.totalSum)}</span>
            </div>
          </div>

          {/* ── Действия: завершить / отменить ── */}
          {isActive && effectiveStatus === 'sent' && (
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="flex-1 text-sm text-gray-500">Заказ отправлен всем оптовикам. Переведите его в завершённый или отмените.</p>
              <button
                onClick={() => setLocalStatus('cancelled')}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors"
              >
                Отменить заказ
              </button>
              <button
                onClick={() => setLocalStatus('completed')}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Завершить заказ
              </button>
            </div>
          )}

          {/* Статус изменён */}
          {(effectiveStatus === 'completed' || effectiveStatus === 'cancelled') && localStatus !== null && (
            <div className={cn(
              'flex items-center gap-3 rounded-xl border px-5 py-4',
              effectiveStatus === 'completed' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50',
            )}>
              {effectiveStatus === 'completed'
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <AlertCircle className="h-5 w-5 text-red-500" />
              }
              <p className={cn(
                'flex-1 text-sm font-medium',
                effectiveStatus === 'completed' ? 'text-green-700' : 'text-red-600',
              )}>
                {effectiveStatus === 'completed' ? 'Заказ переведён в завершённый' : 'Заказ отменён'}
              </p>
              <button
                onClick={() => setLocalStatus(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Отменить действие
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
