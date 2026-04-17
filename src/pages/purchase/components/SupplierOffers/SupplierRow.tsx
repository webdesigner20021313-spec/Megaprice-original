import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { QuantityControl } from './QuantityControl'
import type { SupplierOffer, BonusType, PaymentOption, ColumnKey } from '@/pages/purchase/types/purchase.types'
import type { Col2Widths } from './SupplierTable'

const ROW_H = 56

interface SupplierRowProps {
  offer: SupplierOffer
  index: number
  cols: Col2Widths
  avgPrice: number
  quantity: number
  onQuantityChange: (offerId: string, quantity: number) => void
  visibleColumns: Record<ColumnKey, boolean>
}

function getExpiryLabel(expiryDate: string): { text: string; urgent: boolean } | null {
  const expiry = new Date(expiryDate)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  if (diffDays < 0)     return { text: 'Просрочен',             urgent: true }
  if (diffDays < 30)    return { text: 'Остался < 1 мес.',      urgent: true }
  if (diffMonths === 1) return { text: 'Остался 1 месяц',       urgent: true }
  if (diffMonths < 6)   return { text: `Осталось ${diffMonths} мес.`, urgent: true }
  return null
}

function getPriceCompare(price: number, avg: number): { text: string; positive: boolean } | null {
  if (!avg || avg === price) return null
  const diff = Math.round(Math.abs((price - avg) / avg) * 100)
  if (diff < 3) return null
  return price < avg
    ? { text: `Цена ниже на ${diff}%`, positive: true }
    : { text: `Цена выше на ${diff}%`, positive: false }
}

const bonusStyles: Record<BonusType, string> = {
  cashback:      'bg-[#D1FAE5] text-[#065F46]',
  gift:          'bg-[#FEF3C7] text-[#92400E]',
  free_delivery: 'bg-[#DBEAFE] text-[#1E40AF]',
  discount:      'bg-[#FEE2E2] text-[#991B1B]',
}

function formatPayment(p: PaymentOption): string {
  return p.percentage === null ? 'Договорная' : `${p.percentage}%`
}

function PaymentList({ options }: { options: PaymentOption[] }) {
  return (
    <p className="truncate text-sm text-gray-700">
      {options.map(formatPayment).join(' \\ ')}
    </p>
  )
}

// td без padding — высота фиксируется внутренним div
const tdBase: React.CSSProperties = {
  padding: 0,
  overflow: 'hidden',
  borderBottom: '1px solid #f3f4f6',
}

// внутренний div с фиксированной высотой
const cellDiv: React.CSSProperties = {
  height: ROW_H,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '0 16px',
  whiteSpace: 'nowrap',
}

export function SupplierRow({ offer, index, cols: _cols, avgPrice, quantity, onQuantityChange, visibleColumns }: SupplierRowProps) {
  const col = visibleColumns
  const expiryLabel = getExpiryLabel(offer.expiryDate)
  const priceCompare = getPriceCompare(offer.priceWithVat, avgPrice)
  const discountPct = offer.originalPrice
    ? Math.round((1 - offer.priceWithVat / offer.originalPrice) * 100)
    : null

  return (
    <tr className="group border-b border-gray-100 transition-colors hover:bg-gray-50">
      {/* № */}
      <td style={{ ...tdBase, borderRight: '1px solid #f3f4f6' }}>
        <div style={{ ...cellDiv, alignItems: 'center' }}>
          <span className="text-xs text-gray-400">{index}</span>
        </div>
      </td>

      {/* Дистрибьютор */}
      <td style={tdBase}>
        <div style={cellDiv}>
          <p className="truncate text-sm font-medium text-gray-900">{offer.distributor.name}</p>
          <p className="truncate text-xs text-gray-500">{offer.distributor.city}</p>
        </div>
      </td>

      {/* Годен до */}
      {col.expiry && (
        <td style={tdBase}>
          <div style={cellDiv}>
            <p className={cn('text-sm', expiryLabel ? 'text-red-600 font-medium' : 'text-gray-700')}>
              {formatDate(offer.expiryDate)}
            </p>
            {expiryLabel && (
              <p className="text-xs text-red-500">{expiryLabel.text}</p>
            )}
          </div>
        </td>
      )}

      {/* Оплата */}
      {col.payment && (
        <td style={tdBase}>
          <div style={cellDiv}>
            <PaymentList options={offer.paymentTypes} />
          </div>
        </td>
      )}

      {/* Цена с НДС */}
      {col.price && (
        <td style={tdBase}>
          <div style={{ ...cellDiv, alignItems: 'flex-end' }}>
            <span className="text-sm font-semibold text-gray-900">{formatCurrency(offer.priceWithVat)}</span>
            {offer.originalPrice && discountPct && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400 line-through">{formatCurrency(offer.originalPrice)}</span>
                <span className="text-xs font-medium text-red-500">-{discountPct}%</span>
              </div>
            )}
            {!offer.originalPrice && priceCompare && (
              <p className={cn('text-xs', priceCompare.positive ? 'text-green-600' : 'text-red-500')}>
                {priceCompare.text}
              </p>
            )}
          </div>
        </td>
      )}

      {/* Бонусы */}
      {col.bonus && (
        <td style={tdBase}>
          <div style={{ ...cellDiv, justifyContent: 'center', alignItems: 'center' }}>
            {offer.bonus ? (
              <span className={cn('inline-flex items-center rounded-full px-4 py-1 text-xs font-medium', bonusStyles[offer.bonus.type])}>
                {offer.bonus.label}
              </span>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </div>
        </td>
      )}

      {/* Количество — sticky right */}
      {col.quantity && (
        <td
          style={{
            padding: 0,
            position: 'sticky', right: 0, zIndex: 2,
            background: '#FFFFFF',
            borderLeft: '1px solid #f3f4f6',
            borderBottom: '1px solid #f3f4f6',
            overflow: 'hidden',
          }}
          className="group-hover:bg-gray-50 transition-colors"
        >
          <div style={{ height: ROW_H, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
            <QuantityControl value={quantity} onChange={(v) => onQuantityChange(offer.id, v)} />
          </div>
        </td>
      )}
    </tr>
  )
}
