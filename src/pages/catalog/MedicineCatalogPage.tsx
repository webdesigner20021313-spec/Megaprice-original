import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, Upload, Star, X,
  ChevronUp, ChevronDown, ChevronsUpDown,
  FlaskConical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockMedicines } from '@/mocks/purchase.mocks'
import type { Medicine } from '@/pages/purchase/types/purchase.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'mnn' | 'manufacturer' | 'country'
type SortDir = 'asc' | 'desc'

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-gray-700" />
    : <ChevronDown className="h-3.5 w-3.5 text-gray-700" />
}

// ─── Favorite Button ──────────────────────────────────────────────────────────

function FavoriteBtn({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded-lg transition-colors',
        active
          ? 'text-amber-400 hover:text-amber-500'
          : 'text-gray-200 hover:text-gray-400',
      )}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      <Star className={cn('h-4 w-4', active && 'fill-amber-400')} />
    </button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptySearch({ onReset }: { onReset: () => void }) {
  return (
    <tr>
      <td colSpan={5}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Ничего не найдено</p>
          <p className="mt-1 text-xs text-gray-500">Попробуйте изменить запрос или сбросить фильтры</p>
          <button
            onClick={onReset}
            className="mt-4 text-xs font-medium text-gray-500 underline hover:text-gray-700"
          >
            Сбросить фильтры
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MedicineCatalogPage ──────────────────────────────────────────────────────

const thBase = 'px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 select-none'

export function MedicineCatalogPage() {
  const [search,      setSearch]      = useState('')
  const [favOnly,     setFavOnly]     = useState(false)
  const [sortKey,     setSortKey]     = useState<SortKey>('name')
  const [sortDir,     setSortDir]     = useState<SortDir>('asc')
  const [favorites,   setFavorites]   = useState<Set<string>>(
    () => new Set(mockMedicines.filter(m => m.isFavorite).map(m => m.id))
  )

  // ── Фильтрация + сортировка ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mockMedicines
      .filter(m => {
        if (favOnly && !favorites.has(m.id)) return false
        if (!q) return true
        return (
          m.name.toLowerCase().includes(q) ||
          m.mnn.toLowerCase().includes(q) ||
          (m.mnnLatin ?? '').toLowerCase().includes(q) ||
          m.manufacturer.toLowerCase().includes(q) ||
          m.country.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        const va = a[sortKey].toLowerCase()
        const vb = b[sortKey].toLowerCase()
        const cmp = va.localeCompare(vb, 'ru')
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [search, favOnly, sortKey, sortDir, favorites])

  // ── Сортировка по колонке ───────────────────────────────────────────────────
  function handleSort(col: SortKey) {
    if (col === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(col); setSortDir('asc') }
  }

  // ── Избранное ───────────────────────────────────────────────────────────────
  function toggleFav(id: string) {
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Сброс ───────────────────────────────────────────────────────────────────
  function resetAll() {
    setSearch('')
    setFavOnly(false)
  }

  const hasFilters = search.trim() !== '' || favOnly

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ─────────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Каталог лекарств</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {mockMedicines.length}
            </span>
          </div>

          <Link
            to="/catalog/upload"
            className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Upload className="h-4 w-4 text-gray-400" />
            Загрузить Excel
          </Link>
        </div>
      </div>

      {/* ── Фильтры ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <div className="flex items-center gap-3">

          {/* Поиск */}
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, МНН, производителю..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Только избранные */}
          <button
            onClick={() => setFavOnly(v => !v)}
            className={cn(
              'flex h-9 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition-all duration-200',
              favOnly
                ? 'border-amber-300 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
            )}
          >
            <Star className={cn('h-3.5 w-3.5', favOnly ? 'fill-amber-400 text-amber-400' : 'text-gray-400')} />
            Избранные
          </button>

          {/* Сброс */}
          {hasFilters && (
            <button
              onClick={resetAll}
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
              Сбросить
            </button>
          )}

          {/* Счётчик результатов */}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} из {mockMedicines.length} препаратов
          </span>
        </div>
      </div>

      {/* ── Таблица ───────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 44 }} />
            <col />
            <col style={{ width: 220 }} />
            <col style={{ width: 180 }} />
            <col style={{ width: 130 }} />
            <col style={{ width: 44 }} />
          </colgroup>

          <thead>
            <tr>
              {/* № */}
              <th className={cn(thBase, 'text-center')}>№</th>

              {/* Препарат */}
              <th
                className={cn(thBase, 'cursor-pointer hover:bg-gray-100')}
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  Препарат
                  <SortIcon col="name" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </th>

              {/* МНН */}
              <th
                className={cn(thBase, 'cursor-pointer hover:bg-gray-100')}
                onClick={() => handleSort('mnn')}
              >
                <div className="flex items-center gap-1.5">
                  МНН
                  <SortIcon col="mnn" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </th>

              {/* Производитель */}
              <th
                className={cn(thBase, 'cursor-pointer hover:bg-gray-100')}
                onClick={() => handleSort('manufacturer')}
              >
                <div className="flex items-center gap-1.5">
                  Производитель
                  <SortIcon col="manufacturer" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </th>

              {/* Страна */}
              <th
                className={cn(thBase, 'cursor-pointer hover:bg-gray-100')}
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center gap-1.5">
                  Страна
                  <SortIcon col="country" sortKey={sortKey} sortDir={sortDir} />
                </div>
              </th>

              {/* Избранное */}
              <th className={cn(thBase, 'text-center')} />
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <EmptySearch onReset={resetAll} />
            ) : (
              filtered.map((med, idx) => (
                <MedicineRow
                  key={med.id}
                  index={idx + 1}
                  medicine={med}
                  isFav={favorites.has(med.id)}
                  onToggleFav={() => toggleFav(med.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── MedicineRow ──────────────────────────────────────────────────────────────

function MedicineRow({
  index, medicine, isFav, onToggleFav,
}: {
  index: number
  medicine: Medicine
  isFav: boolean
  onToggleFav: () => void
}) {
  return (
    <tr
      className="group border-b border-gray-100 transition-colors hover:bg-gray-50/60"
    >
      {/* № */}
      <td className="px-4 py-3 text-center text-xs text-gray-400">{index}</td>

      {/* Препарат */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <FlaskConical className="h-4 w-4 text-gray-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{medicine.name}</p>
          </div>
        </div>
      </td>

      {/* МНН */}
      <td className="px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm text-gray-700">{medicine.mnn}</p>
          {medicine.mnnLatin && <p className="truncate text-xs text-gray-400 italic">{medicine.mnnLatin}</p>}
        </div>
      </td>

      {/* Производитель */}
      <td className="px-4 py-3">
        <p className="truncate text-sm text-gray-700">{medicine.manufacturer}</p>
      </td>

      {/* Страна */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-500">{medicine.country}</p>
      </td>

      {/* Избранное */}
      <td className="px-4 py-3 text-center">
        <FavoriteBtn active={isFav} onClick={onToggleFav} />
      </td>
    </tr>
  )
}
