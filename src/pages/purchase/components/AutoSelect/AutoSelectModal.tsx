import { useState, useMemo } from 'react'
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import type {
  Medicine,
  SupplierOffer,
  AutoSelectSettings,
} from '@/pages/purchase/types/purchase.types'

interface AutoSelectResult {
  medicine: Medicine
  offer: SupplierOffer | null
}

interface AutoSelectModalProps {
  medicines: Medicine[]
  offers: SupplierOffer[]
  onClose: () => void
  onConfirm: (results: AutoSelectResult[]) => void
}

const allDistributors = [
  { id: 'd1', name: 'MEDSERVICE' },
  { id: 'd2', name: 'PHARMEX' },
  { id: 'd3', name: 'TURON PHARM' },
  { id: 'd4', name: 'MEGA PHARM' },
  { id: 'd5', name: 'DOSTLIK FARM' },
  { id: 'd6', name: 'BIOMED' },
]

export function AutoSelectModal({ medicines, offers, onClose, onConfirm }: AutoSelectModalProps) {
  const [step, setStep] = useState<'settings' | 'results'>('settings')
  const [settings, setSettings] = useState<AutoSelectSettings>({
    distributorIds: allDistributors.map((d) => d.id),
    manufacturerIds: [],
    priority: 'price',
    maxPrice: undefined,
  })
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [results, setResults] = useState<AutoSelectResult[]>([])

  const uniqueManufacturers = useMemo(
    () => Array.from(new Set(medicines.map((m) => m.manufacturer))).sort(),
    [medicines]
  )

  function toggleDistributor(id: string) {
    setSettings((prev) => ({
      ...prev,
      distributorIds: prev.distributorIds.includes(id)
        ? prev.distributorIds.filter((d) => d !== id)
        : [...prev.distributorIds, id],
    }))
  }

  function toggleManufacturer(name: string) {
    setSettings((prev) => ({
      ...prev,
      manufacturerIds: prev.manufacturerIds.includes(name)
        ? prev.manufacturerIds.filter((m) => m !== name)
        : [...prev.manufacturerIds, name],
    }))
  }

  function runAlgorithm() {
    const maxPrice = maxPriceInput ? parseFloat(maxPriceInput) : undefined

    const computed = medicines.map((medicine) => {
      let candidates = offers.filter((o) => {
        if (o.medicineId !== medicine.id) return false
        // Filter by distributor name by matching offer distributor id
        const distName = o.distributor.name
        const matchedDist = allDistributors.find((d) => d.name === distName)
        if (matchedDist && !settings.distributorIds.includes(matchedDist.id)) return false
        if (settings.manufacturerIds.length > 0 && !settings.manufacturerIds.includes(medicine.manufacturer)) return false
        if (maxPrice !== undefined && o.priceWithVat > maxPrice) return false
        return true
      })

      if (candidates.length === 0) return { medicine, offer: null }

      candidates = [...candidates].sort((a, b) => {
        if (settings.priority === 'price') return a.priceWithVat - b.priceWithVat
        if (settings.priority === 'expiry') {
          return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
        }
        // payment: prefer those with days (deferred)
        const daysA = Math.max(...a.paymentTypes.map(p => p.days ?? 0))
        const daysB = Math.max(...b.paymentTypes.map(p => p.days ?? 0))
        return daysB - daysA
      })

      return { medicine, offer: candidates[0] }
    })

    setResults(computed)
    setStep('results')
  }

  const matched = results.filter((r) => r.offer !== null)
  const unmatched = results.filter((r) => r.offer === null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-lexend text-lg font-semibold text-gray-900">Авто-подбор</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'settings' ? (
            <div className="space-y-5">
              {/* Distributors */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Дистрибьюторы</p>
                <div className="space-y-1.5">
                  {allDistributors.map((d) => (
                    <label key={d.id} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={settings.distributorIds.includes(d.id)}
                        onChange={() => toggleDistributor(d.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Manufacturers */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Производители{' '}
                  <span className="font-normal text-gray-400">(оставьте пустым для всех)</span>
                </p>
                <div className="space-y-1.5">
                  {uniqueManufacturers.map((m) => (
                    <label key={m} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={settings.manufacturerIds.includes(m)}
                        onChange={() => toggleManufacturer(m)}
                        className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{m}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Приоритет</p>
                <div className="space-y-1.5">
                  {[
                    { value: 'price', label: 'Цена' },
                    { value: 'expiry', label: 'Срок годности' },
                    { value: 'payment', label: 'Тип оплаты' },
                  ].map((opt) => (
                    <label key={opt.value} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name="priority"
                        value={opt.value}
                        checked={settings.priority === opt.value}
                        onChange={() =>
                          setSettings((prev) => ({
                            ...prev,
                            priority: opt.value as AutoSelectSettings['priority'],
                          }))
                        }
                        className="h-4 w-4 border-gray-300 accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max price */}
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Максимальная цена{' '}
                  <span className="font-normal text-gray-400">(необязательно)</span>
                </p>
                <input
                  type="number"
                  min={0}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  placeholder="например 5000"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {unmatched.length > 0 && (
                <div className="rounded-lg bg-[#ffefcf] p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-[#ab570a]" />
                    <p className="text-sm font-medium text-[#ab570a]">
                      Не найдены предложения для {unmatched.length} лекарств
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1 pl-6">
                    {unmatched.map((r) => (
                      <li key={r.medicine.id} className="text-xs text-[#ab570a]">
                        {r.medicine.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {matched.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#11843c]" />
                    <p className="text-sm font-medium text-gray-700">
                      Подобрано предложений: {matched.length}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {matched.map((r) => (
                      <div
                        key={r.medicine.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.medicine.name}</p>
                          <p className="text-xs text-gray-500">
                            {r.offer!.distributor.name} · {r.offer!.distributor.city}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(r.offer!.priceWithVat)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-gray-200 px-6 py-4">
          {step === 'settings' ? (
            <>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={runAlgorithm}
                disabled={settings.distributorIds.length === 0}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                  settings.distributorIds.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-[#4e36f5] hover:bg-[#432ad8]'
                )}
              >
                Подобрать
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('settings')}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Назад
              </button>
              <button
                onClick={() => {
                  onConfirm(matched)
                  onClose()
                }}
                disabled={matched.length === 0}
                className={cn(
                  'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors',
                  matched.length === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-gray-900 hover:bg-black'
                )}
              >
                Добавить в корзину ({matched.length})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
