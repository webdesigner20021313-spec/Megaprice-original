import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label, required, children, hint,
}: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  )
}

// ─── AddPharmacyPage ──────────────────────────────────────────────────────────

export function AddPharmacyPage() {
  const navigate = useNavigate()

  const [name,    setName]    = useState('')
  const [address, setAddress] = useState('')
  const [city,    setCity]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [inn,     setInn]     = useState('')
  const [step,    setStep]    = useState<'form' | 'success'>('form')

  const isValid = name.trim() !== '' && address.trim() !== '' && city.trim() !== ''

  const inputClass = [
    'h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-900',
    'placeholder-gray-400 transition-all duration-200',
    'hover:border-gray-300 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20',
  ].join(' ')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="flex h-full flex-col bg-white">
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-20">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5]">
            <CheckCircle2 className="h-8 w-8 text-[#065F46]" />
          </div>
          <p className="text-xl font-bold text-gray-900">Аптека добавлена!</p>
          <p className="mt-2 text-sm text-gray-500">{name}</p>
          <p className="text-xs text-gray-400">{address}, {city}</p>
          <div className="mt-8 flex gap-3">
            <Button variant="outline" onClick={() => navigate('/pharmacies')}>
              К списку аптек
            </Button>
            <Button onClick={() => { setName(''); setAddress(''); setCity(''); setPhone(''); setInn(''); setStep('form') }}>
              Добавить ещё
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Шапка ── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/pharmacies')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            aria-label="Назад"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Добавить аптеку</h1>
        </div>
      </div>

      {/* ── Форма ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-lg">

          {/* Иконка */}
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
            <Building2 className="h-7 w-7 text-gray-500" />
          </div>

          <div className="space-y-4">

            {/* Основная информация */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Основная информация</p>
              </div>
              <div className="space-y-4 p-5">
                <Field label="Название аптеки" required>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder='Аптека "Здоровье"'
                    className={inputClass}
                    autoFocus
                  />
                </Field>
                <Field label="Город" required>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="Алматы"
                    className={inputClass}
                  />
                </Field>
                <Field label="Адрес" required>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="ул. Абая, 12"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

            {/* Контакты */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Контакты и реквизиты</p>
              </div>
              <div className="space-y-4 p-5">
                <Field label="Телефон" hint="Необязательно">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+7 (777) 000-00-00"
                    className={inputClass}
                  />
                </Field>
                <Field label="ИНН" hint="Необязательно">
                  <input
                    type="text"
                    value={inn}
                    onChange={e => setInn(e.target.value)}
                    placeholder="123456789012"
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>

          </div>

          {/* Кнопки */}
          <div className="mt-6 flex items-center gap-3">
            <Button variant="outline" type="button" onClick={() => navigate('/pharmacies')}>
              Отмена
            </Button>
            <Button type="submit" disabled={!isValid}>
              Добавить аптеку
            </Button>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            <span className="text-red-500">*</span> — обязательные поля
          </p>
        </form>
      </div>
    </div>
  )
}
