import React, { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle,
  ModalDescription, ModalFooter,
} from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { useUsersStore } from '@/stores/useUsersStore'
import {
  MODULES_CONFIG, MODULE_LIST,
  type ModuleId, type ModulePermission,
} from '../types/users.types'

interface Props {
  open:    boolean
  onClose: () => void
}

type Step = 1 | 2 | 3

// Init all permissions and features = true for a module
function buildDefaultPermission(moduleId: ModuleId): ModulePermission {
  const config = MODULES_CONFIG.find((m) => m.id === moduleId)!
  return {
    access:      true,
    permissions: Object.fromEntries(config.permissions.map((p) => [p.id, true])),
    features:    Object.fromEntries(config.features.map((f) => [f.id, true])),
  }
}

export function RoleCreateWizard({ open, onClose }: Props) {
  const { addRole } = useUsersStore()

  const [step,            setStep]            = useState<Step>(1)
  const [roleName,        setRoleName]        = useState('')
  const [nameError,       setNameError]       = useState('')
  const [selectedModules, setSelectedModules] = useState<ModuleId[]>([])
  const [moduleError,     setModuleError]     = useState('')
  const [permissions,     setPermissions]     = useState<Partial<Record<ModuleId, ModulePermission>>>({})

  useEffect(() => {
    if (!open) return
    setStep(1)
    setRoleName('')
    setNameError('')
    setSelectedModules([])
    setModuleError('')
    setPermissions({})
  }, [open])

  // ── Navigation ────────────────────────────────────────────────────────────

  function goToStep2() {
    if (!roleName.trim()) { setNameError('Введите название роли'); return }
    setNameError('')
    setStep(2)
  }

  function goToStep3() {
    if (selectedModules.length === 0) { setModuleError('Выберите хотя бы один модуль'); return }
    setModuleError('')
    // Keep existing perms for already-selected modules, init new ones
    setPermissions((prev) => {
      const next: Partial<Record<ModuleId, ModulePermission>> = {}
      selectedModules.forEach((id) => {
        next[id] = prev[id] ?? buildDefaultPermission(id)
      })
      return next
    })
    setStep(3)
  }

  // ── Module toggle ─────────────────────────────────────────────────────────

  function toggleModule(id: ModuleId) {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
    setModuleError('')
  }

  // ── Permission helpers ────────────────────────────────────────────────────

  function toggleAccess(moduleId: ModuleId) {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId]!, access: !prev[moduleId]!.access },
    }))
  }

  function toggleFeature(moduleId: ModuleId, featureId: string) {
    setPermissions((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId]!,
        features: {
          ...prev[moduleId]!.features,
          [featureId]: !prev[moduleId]!.features[featureId],
        },
      },
    }))
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  function handleSave() {
    addRole({ name: roleName.trim(), permissions })
    onClose()
  }

  // ── Step indicator ────────────────────────────────────────────────────────

  const STEPS = [
    { n: 1 as Step, label: 'Название' },
    { n: 2 as Step, label: 'Модули'   },
    { n: 3 as Step, label: 'Права'    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Modal open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <ModalContent className="max-w-2xl">

        {/* Step indicator */}
        <div className="mb-2 flex items-center">
          {STEPS.map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  step > n  ? 'bg-gray-900 text-white'
                  : step === n ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-400'
                )}>
                  {step > n ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn(
                  'text-sm transition-colors',
                  step >= n ? 'font-medium text-gray-900' : 'text-gray-400'
                )}>
                  {label}
                </span>
              </div>
              {i < 2 && (
                <div className={cn(
                  'mx-3 h-px flex-1 transition-colors',
                  step > n ? 'bg-gray-900' : 'bg-gray-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── Step 1: Название ─────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <ModalHeader>
              <ModalTitle>Название роли</ModalTitle>
              <ModalDescription>Придумайте понятное название — например, «Менеджер» или «Оператор»</ModalDescription>
            </ModalHeader>

            <div className="py-4">
              <input
                type="text"
                placeholder="Название роли"
                value={roleName}
                autoFocus
                onChange={(e) => { setRoleName(e.target.value); setNameError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') goToStep2() }}
                className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
              {nameError && <p className="mt-1.5 text-xs text-red-500">{nameError}</p>}
            </div>

            <ModalFooter>
              <button onClick={onClose} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={goToStep2} className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-black">
                Далее →
              </button>
            </ModalFooter>
          </>
        )}

        {/* ── Step 2: Модули ───────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <ModalHeader>
              <ModalTitle>Доступ к модулям</ModalTitle>
              <ModalDescription>Выберите модули для роли «{roleName}»</ModalDescription>
            </ModalHeader>

            <div className="py-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {MODULE_LIST.map((m) => {
                  const isSelected = selectedModules.includes(m.id)
                  const featCount  = MODULES_CONFIG.find((c) => c.id === m.id)!.features.length
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleModule(m.id)}
                      className={cn(
                        'flex flex-col gap-1 rounded-xl border-2 p-4 text-left transition-all duration-150',
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          isSelected ? 'border-gray-900 bg-gray-900' : 'border-gray-300 bg-white'
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </div>
                        <span className={cn(
                          'text-sm font-medium',
                          isSelected ? 'text-gray-900' : 'text-gray-600'
                        )}>
                          {m.label}
                        </span>
                      </div>
                      {featCount > 0 && (
                        <p className="pl-7 text-xs text-gray-400">
                          {featCount} {featCount === 1 ? 'функция' : featCount < 5 ? 'функции' : 'функций'}
                        </p>
                      )}
                    </button>
                  )
                })}
              </div>
              {moduleError && <p className="mt-3 text-xs text-red-500">{moduleError}</p>}
            </div>

            <ModalFooter>
              <button onClick={() => setStep(1)} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Назад
              </button>
              <button onClick={goToStep3} className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-black">
                Далее →
              </button>
            </ModalFooter>
          </>
        )}

        {/* ── Step 3: Права ────────────────────────────────────────────────── */}
        {step === 3 && (
          <>
            <ModalHeader>
              <ModalTitle>Права доступа</ModalTitle>
              <ModalDescription>Настройте функции роли «{roleName}» для каждого модуля</ModalDescription>
            </ModalHeader>

            <div className="py-4">
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="w-40 px-4 py-3 text-left   text-xs font-semibold text-gray-500">Модуль</th>
                      <th className="w-20 px-4 py-3 text-center text-xs font-semibold text-gray-500">Доступ</th>
                      <th className="px-4 py-3 text-left         text-xs font-semibold text-gray-500">Функции</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedModules.map((moduleId) => {
                      const config = MODULES_CONFIG.find((m) => m.id === moduleId)!
                      const perm   = permissions[moduleId]!
                      return (
                        <tr key={moduleId} className={cn('bg-white transition-opacity', !perm.access && 'opacity-40')}>

                          {/* Модуль */}
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {config.label}
                          </td>

                          {/* Доступ — toggle */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleAccess(moduleId)}
                              className={cn(
                                'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200',
                                perm.access ? 'bg-gray-900' : 'bg-gray-200'
                              )}
                            >
                              <span className={cn(
                                'inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
                                perm.access ? 'translate-x-4' : 'translate-x-0.5'
                              )} />
                            </button>
                          </td>

                          {/* Функции — pill-checkboxes */}
                          <td className="px-4 py-3">
                            {config.features.length === 0 ? (
                              <span className="text-xs text-gray-400">Базовый доступ</span>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {config.features.map((feature) => {
                                  const enabled = !!perm.features[feature.id]
                                  return (
                                    <button
                                      key={feature.id}
                                      disabled={!perm.access}
                                      onClick={() => toggleFeature(moduleId, feature.id)}
                                      className={cn(
                                        'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                                        enabled
                                          ? 'border-gray-900 bg-gray-900 text-white'
                                          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300',
                                        !perm.access && 'pointer-events-none'
                                      )}
                                    >
                                      {feature.label}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <ModalFooter>
              <button onClick={() => setStep(2)} className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">
                ← Назад
              </button>
              <button onClick={handleSave} className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white hover:bg-black">
                Сохранить роль
              </button>
            </ModalFooter>
          </>
        )}

      </ModalContent>
    </Modal>
  )
}
