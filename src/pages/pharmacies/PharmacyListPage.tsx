import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, MapPin, Plus, Search, X, ArrowRight } from 'lucide-react'
import { mockPharmacies } from '@/mocks/purchase.mocks'
import { cn } from '@/lib/utils'

// ─── PharmacyListPage ─────────────────────────────────────────────────────────

export function PharmacyListPage() {
  const navigate  = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return mockPharmacies
    return mockPharmacies.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Мои аптеки</h1>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              {mockPharmacies.length}
            </span>
          </div>
          <Link
            to="/pharmacies/add"
            className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            <Plus className="h-4 w-4" />
            Добавить аптеку
          </Link>
        </div>
      </div>

      {/* ── Поиск ── */}
      <div className="shrink-0 border-b border-gray-100 bg-gray-50/40 px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию или городу..."
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
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} из {mockPharmacies.length}
          </span>
        </div>
      </div>

      {/* ── Контент ── */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/40 px-6 py-5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <Building2 className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-gray-900">Ничего не найдено</p>
            <p className="mt-1 text-xs text-gray-500">Попробуйте изменить запрос</p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-xs font-medium text-gray-500 underline hover:text-gray-700"
            >
              Сбросить поиск
            </button>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(pharmacy => (
                <button
                  key={pharmacy.id}
                  onClick={() => navigate(`/pharmacies/${pharmacy.id}`)}
                  className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 text-left transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                >
                  {/* Иконка */}
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-gray-200">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>

                  {/* Название */}
                  <p className="text-sm font-semibold text-gray-900 leading-snug">
                    {pharmacy.name}
                  </p>

                  {/* Адрес */}
                  <div className="mt-2 flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <p className="text-xs text-gray-500 leading-snug">
                      {pharmacy.address}, {pharmacy.city}
                    </p>
                  </div>

                  {/* Ссылка */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-gray-400 transition-colors group-hover:text-gray-700">
                    Подробнее
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </div>
                </button>
              ))}

              {/* Карточка добавления */}
              <Link
                to="/pharmacies/add"
                className={cn(
                  'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-5',
                  'text-gray-400 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600',
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">Добавить аптеку</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
