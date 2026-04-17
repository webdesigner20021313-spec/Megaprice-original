import { MedicineRow } from './MedicineRow'
import type { Medicine } from '@/pages/purchase/types/purchase.types'

interface MedicineTableProps {
  medicines: Medicine[]
  selectedId: string | null
  onSelect: (medicine: Medicine) => void
  checkedIds: string[]
  onToggleCheck: (id: string) => void
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  cartQtyByMedicine: Record<string, number>
  panel1Width: number
}

const COL_CB  = 56
const COL_MNN = 240
const COL_FAV = 56
const FIXED   = COL_CB + COL_MNN + COL_FAV  // 352
const MIN_NAME = 400

export function MedicineTable({
  medicines, selectedId, onSelect, checkedIds, onToggleCheck,
  favoriteIds, onToggleFavorite, cartQtyByMedicine, panel1Width,
}: MedicineTableProps) {
  const nameW  = Math.max(MIN_NAME, panel1Width - FIXED)
  const tableW = Math.max(MIN_NAME + FIXED, panel1Width)

  if (medicines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-gray-400">Лекарства не найдены</p>
      </div>
    )
  }

  return (
    <table style={{ tableLayout: 'fixed', width: tableW, borderCollapse: 'collapse' }}>
      <colgroup>
        <col style={{ width: COL_CB }} />
        <col style={{ width: nameW }} />
        <col style={{ width: COL_MNN }} />
        <col style={{ width: COL_FAV }} />
      </colgroup>
      <thead>
        <tr style={{ height: 48 }}>
          {/* Checkbox header — sticky top + left */}
          <th
            style={{
              position: 'sticky', top: 0, left: 0, zIndex: 4,
              width: COL_CB, background: '#F9FAFB',
              borderBottom: '1px solid #e5e7eb',
              boxShadow: '1px 0 0 #e5e7eb',
            }}
          />
          {/* Название header */}
          <th
            style={{
              position: 'sticky', top: 0, zIndex: 2, background: '#F9FAFB',
              padding: '8px 12px', textAlign: 'left',
              borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Название
            </span>
          </th>
          {/* МНН header */}
          <th
            style={{
              position: 'sticky', top: 0, zIndex: 2, background: '#F9FAFB',
              padding: '8px 12px', textAlign: 'left',
              borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb',
              overflow: 'hidden',
            }}
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500"
              style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              МНН
            </span>
          </th>
          {/* Fav header — sticky top + right */}
          <th
            style={{
              position: 'sticky', top: 0, right: 0, zIndex: 4,
              width: COL_FAV, background: '#F9FAFB',
              borderBottom: '1px solid #e5e7eb',
              boxShadow: '-1px 0 0 #e5e7eb',
            }}
          />
        </tr>
      </thead>
      <tbody>
        {medicines.map((medicine) => (
          <MedicineRow
            key={medicine.id}
            medicine={medicine}
            isSelected={medicine.id === selectedId}
            isChecked={checkedIds.includes(medicine.id)}
            isFavorite={favoriteIds.includes(medicine.id)}
            cartQty={cartQtyByMedicine[medicine.id] ?? 0}
            onSelect={() => onSelect(medicine)}
            onToggleCheck={() => onToggleCheck(medicine.id)}
            onToggleFavorite={() => onToggleFavorite(medicine.id)}
          />
        ))}
      </tbody>
    </table>
  )
}
