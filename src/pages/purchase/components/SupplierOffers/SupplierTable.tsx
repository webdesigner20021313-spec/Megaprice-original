import { useState } from 'react'
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'
import { SupplierRow } from './SupplierRow'
import type { SupplierOffer, SortField, SortDirection, ColumnKey } from '@/pages/purchase/types/purchase.types'

interface SupplierTableProps {
  offers: SupplierOffer[]
  avgPrice: number
  quantities: Record<string, number>
  onQuantityChange: (offerId: string, quantity: number) => void
  sortField: SortField | null
  sortDir: SortDirection
  onSort: (field: SortField) => void
  visibleColumns: Record<ColumnKey, boolean>
}

export type Col2Widths = {
  num: number; distributor: number; expiry: number
  payment: number; price: number; bonus: number; quantity: number
}

const INIT_COLS: Col2Widths = {
  num: 48, distributor: 264, expiry: 160,
  payment: 160, price: 160, bonus: 160, quantity: 180,
}

function ResizeHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{ position: 'absolute', right: 0, top: 0, width: 4, height: '100%', cursor: 'col-resize', zIndex: 1 }}
      className="hover:bg-blue-400 active:bg-blue-500"
    />
  )
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField | null; sortDir: SortDirection }) {
  if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 text-gray-400" />
  if (sortDir === 'asc') return <ArrowUp className="h-3.5 w-3.5 text-gray-700" />
  return <ArrowDown className="h-3.5 w-3.5 text-gray-700" />
}

export function SupplierTable({ offers, avgPrice, quantities, onQuantityChange, sortField, sortDir, onSort, visibleColumns }: SupplierTableProps) {
  const col = visibleColumns
  const [cols, setCols] = useState<Col2Widths>(INIT_COLS)

  const tableWidth = cols.num + cols.distributor
    + (col.expiry   ? cols.expiry   : 0)
    + (col.payment  ? cols.payment  : 0)
    + (col.price    ? cols.price    : 0)
    + (col.bonus    ? cols.bonus    : 0)
    + (col.quantity ? cols.quantity : 0)

  function startResize(e: React.MouseEvent, key: keyof Col2Widths) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startW = cols[key]
    function onMove(ev: MouseEvent) {
      setCols(prev => ({ ...prev, [key]: Math.max(48, startW + ev.clientX - startX) }))
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

  // th base: position relative — чтобы ResizeHandle позиционировался относительно th
  const thBase: React.CSSProperties = {
    position: 'relative',
    background: '#F9FAFB',
    borderBottom: '1px solid #e5e7eb',
    padding: '10px 16px',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    // sticky через отдельный style на каждом th
  }

  const thSticky: React.CSSProperties = {
    ...thBase,
    position: 'sticky',
    top: 0,
    zIndex: 2,
  }

  return (
    <div style={{ height: '100%', overflowX: 'scroll', overflowY: 'scroll' }}>
      <table style={{ tableLayout: 'fixed', width: tableWidth, borderCollapse: 'collapse' }}>
        <colgroup>
          <col style={{ width: cols.num }} />
          <col style={{ width: cols.distributor }} />
          {col.expiry   && <col style={{ width: cols.expiry }} />}
          {col.payment  && <col style={{ width: cols.payment }} />}
          {col.price    && <col style={{ width: cols.price }} />}
          {col.bonus    && <col style={{ width: cols.bonus }} />}
          {col.quantity && <col style={{ width: cols.quantity }} />}
        </colgroup>
        <thead>
          <tr style={{ height: 48 }}>
            {/* № — no resize */}
            <th style={{ ...thSticky, textAlign: 'center', borderRight: '1px solid #e5e7eb' }}>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">№</span>
            </th>

            {/* Дистрибьютор — resizable */}
            <th style={{ ...thSticky, borderRight: '1px solid #e5e7eb' }}>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={{ paddingRight: 8 }}>
                Дистрибьютор
              </span>
              <ResizeHandle onMouseDown={(e) => startResize(e, 'distributor')} />
            </th>

            {/* Годен до — resizable + sort */}
            {col.expiry && (
              <th
                style={{ ...thSticky, borderRight: '1px solid #e5e7eb', cursor: 'pointer' }}
                onClick={() => onSort('expiry')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, paddingRight: 8 }}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Годен до</span>
                  <SortIcon field="expiry" sortField={sortField} sortDir={sortDir} />
                </span>
                <ResizeHandle onMouseDown={(e) => { e.stopPropagation(); startResize(e, 'expiry') }} />
              </th>
            )}

            {/* Оплата — resizable */}
            {col.payment && (
              <th style={{ ...thSticky, borderRight: '1px solid #e5e7eb' }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={{ paddingRight: 8 }}>
                  Оплата
                </span>
                <ResizeHandle onMouseDown={(e) => startResize(e, 'payment')} />
              </th>
            )}

            {/* Цена с НДС — resizable + sort */}
            {col.price && (
              <th
                style={{ ...thSticky, textAlign: 'right', borderRight: '1px solid #e5e7eb', cursor: 'pointer' }}
                onClick={() => onSort('price')}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, paddingRight: 8 }}>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Цена с НДС</span>
                  <SortIcon field="price" sortField={sortField} sortDir={sortDir} />
                </span>
                <ResizeHandle onMouseDown={(e) => { e.stopPropagation(); startResize(e, 'price') }} />
              </th>
            )}

            {/* Бонусы — resizable */}
            {col.bonus && (
              <th style={{ ...thSticky, borderRight: '1px solid #e5e7eb' }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={{ paddingRight: 8 }}>
                  Бонусы
                </span>
                <ResizeHandle onMouseDown={(e) => startResize(e, 'bonus')} />
              </th>
            )}

            {/* Количество — sticky right, no resize */}
            {col.quantity && (
              <th
                style={{
                  position: 'sticky', top: 0, right: 0, zIndex: 4,
                  background: '#F9FAFB',
                  borderBottom: '1px solid #e5e7eb',
                  borderLeft: '1px solid #e5e7eb',
                  padding: '10px 16px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Количество
                </span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => (
            <SupplierRow
              key={offer.id}
              offer={offer}
              index={index + 1}
              cols={cols}
              avgPrice={avgPrice}
              quantity={quantities[offer.id] ?? 0}
              onQuantityChange={onQuantityChange}
              visibleColumns={col}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
