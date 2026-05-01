import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Search, X, Check,
  Store, TrendingUp, ShoppingCart, ClipboardList, BarChart3, Users,
  CheckCircle2, ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUsersStore } from '@/stores/useUsersStore'
import {
  MODULES_CONFIG, buildFullPermission, buildEmptyPermission,
  type ModuleId, type ModuleConfig, type ModulePermission,
} from './types/users.types'

// ── Module icon map ───────────────────────────────────────────────────────────

const MODULE_ICONS: Record<ModuleId, React.ReactNode> = {
  shop:      <Store className="h-4 w-4" />,
  needs:     <TrendingUp className="h-4 w-4" />,
  cart:      <ShoppingCart className="h-4 w-4" />,
  orders:    <ClipboardList className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  users:     <Users className="h-4 w-4" />,
}

// ── Feature pill ──────────────────────────────────────────────────────────────

interface FeaturePillProps {
  label:    string
  enabled:  boolean
  onChange: () => void
}

function FeaturePill({ label, enabled, onChange }: FeaturePillProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150',
        enabled
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700',
      )}
    >
      {enabled && <Check className="h-3 w-3 shrink-0" />}
      {label}
    </button>
  )
}

// ── Module card ───────────────────────────────────────────────────────────────

interface ModuleCardProps {
  config:             ModuleConfig
  perm:               ModulePermission
  onToggleAccess:     () => void
  onTogglePermission: (id: string) => void
  onToggleFeature:    (id: string) => void
}

function ModuleCard({
  config, perm, onToggleAccess, onTogglePermission, onToggleFeature,
}: ModuleCardProps) {
  const hasPerms    = config.permissions.length > 0
  const hasFeatures = config.features.length > 0
  const hasBody     = hasPerms || hasFeatures

  const activePerms = Object.values(perm.permissions).filter(Boolean).length
  const totalPerms  = config.permissions.length
  const activeFeat  = Object.values(perm.features).filter(Boolean).length
  const totalFeat   = config.features.length

  return (
    <div className={cn(
      'overflow-hidden rounded-xl border transition-colors duration-200',
      perm.access ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50/60',
    )}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3 p-4">
        <div className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          perm.access ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400',
        )}>
          {MODULE_ICONS[config.id]}
        </div>

        <div className="min-w-0 flex-1">
          <p className={cn(
            'text-sm font-semibold transition-colors',
            perm.access ? 'text-gray-900' : 'text-gray-400',
          )}>
            {config.label}
          </p>
          <p className="text-xs text-gray-400">
            {perm.access && hasBody
              ? `${activePerms}/${totalPerms} прав · ${activeFeat}/${totalFeat} функций`
              : perm.access
              ? 'Базовый доступ'
              : 'Доступ отключён'}
          </p>
        </div>

        {/* Toggle switch */}
        <button
          type="button"
          onClick={onToggleAccess}
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
            perm.access ? 'bg-gray-900' : 'bg-gray-200',
          )}
        >
          <span className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            perm.access ? 'translate-x-5' : 'translate-x-0.5',
          )} />
        </button>
      </div>

      {/* ── Body ── */}
      {perm.access && hasBody && (
        <div className="border-t border-gray-100 p-4 space-y-4">

          {/* Permissions — same style as features */}
          {hasPerms && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Права
              </p>
              <div className="flex flex-wrap gap-2">
                {config.permissions.map((p) => (
                  <FeaturePill
                    key={p.id}
                    label={p.label}
                    enabled={!!perm.permissions[p.id]}
                    onChange={() => onTogglePermission(p.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {hasPerms && hasFeatures && (
            <div className="border-t border-gray-100" />
          )}

          {/* Features — standard dark pills */}
          {hasFeatures && (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Функции
              </p>
              <div className="flex flex-wrap gap-2">
                {config.features.map((f) => (
                  <FeaturePill
                    key={f.id}
                    label={f.label}
                    enabled={!!perm.features[f.id]}
                    onChange={() => onToggleFeature(f.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Success modal ─────────────────────────────────────────────────────────────

interface SuccessModalProps {
  roleName: string
  modules:  Partial<Record<ModuleId, ModulePermission>>
  onClose:  () => void
}

function SuccessModal({ roleName, modules, onClose }: SuccessModalProps) {
  const activeModules = MODULES_CONFIG.filter((m) => modules[m.id]?.access)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm px-4"
         style={{ paddingTop: 80, paddingBottom: 80 }}>
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
           style={{ maxHeight: 'calc(100vh - 160px)' }}>

        {/* ── Fixed header ── */}
        <div className="shrink-0 flex flex-col items-center px-6 pt-8 pb-5 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Роль успешно создана</h2>
          <p className="mt-1 text-sm text-gray-500">Новая роль добавлена в систему</p>

          {/* Role name */}
          <div className="mt-4 w-full flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-900">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Название роли</p>
              <p className="text-sm font-semibold text-gray-900">{roleName}</p>
            </div>
          </div>
        </div>

        {/* ── Scrollable modules ── */}
        {activeModules.length > 0 && (
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Доступные модули · {activeModules.length}
            </p>
            <div className="flex flex-col gap-3">
              {activeModules.map((m) => {
                const perm           = modules[m.id]!
                const activePerms    = m.permissions.filter((p) => perm.permissions[p.id])
                const activeFeatures = m.features.filter((f) => perm.features[f.id])
                const hasContent     = activePerms.length > 0 || activeFeatures.length > 0

                return (
                  <div key={m.id} className="rounded-xl border border-gray-200 overflow-hidden">

                    {/* Module header */}
                    <div className="flex items-center gap-2.5 bg-gray-50 px-4 py-2.5">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-900 text-white">
                        {MODULE_ICONS[m.id]}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                    </div>

                    {/* Права + Функции */}
                    {hasContent ? (
                      <div className="px-4 py-3 space-y-3">

                        {/* Права */}
                        {activePerms.length > 0 && (
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400 w-14">
                              Права
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {activePerms.map((p) => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-medium text-white"
                                >
                                  {p.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Функции */}
                        {activeFeatures.length > 0 && (
                          <div className="flex items-start gap-3">
                            <span className="mt-0.5 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400 w-14">
                              Функции
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {activeFeatures.map((f) => (
                                <span
                                  key={f.id}
                                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-[11px] text-gray-600"
                                >
                                  {f.label}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="px-4 py-3 text-xs text-gray-400">Базовый доступ</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Fixed footer ── */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="h-10 w-full rounded-xl bg-gray-900 text-sm font-semibold text-white transition-colors hover:bg-black"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  )
}

// ── RoleCreatePage ────────────────────────────────────────────────────────────

type FormModules = Partial<Record<ModuleId, ModulePermission>>

function initAllModules(): FormModules {
  return Object.fromEntries(
    MODULES_CONFIG.map((m) => [m.id, buildEmptyPermission(m)])
  )
}

export function RoleCreatePage() {
  const navigate          = useNavigate()
  const { addRole, roles } = useUsersStore()

  const [name,         setName]         = useState('')
  const [nameError,    setNameError]    = useState('')
  const [search,       setSearch]       = useState('')
  const [modules,      setModules]      = useState<FormModules>(initAllModules)
  const [savedRole,    setSavedRole]    = useState<{ name: string; modules: FormModules } | null>(null)

  // ── Filtered modules ──────────────────────────────────────────────────────

  const filteredConfigs = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q
      ? MODULES_CONFIG.filter((m) => m.label.toLowerCase().includes(q))
      : MODULES_CONFIG
  }, [search])

  // ── Select-all switch ─────────────────────────────────────────────────────

  const activeCount  = Object.values(modules).filter((p) => p.access).length
  const allSelected  = activeCount === MODULES_CONFIG.length

  function toggleSelectAll() {
    if (allSelected) {
      setModules(initAllModules())
    } else {
      setModules(Object.fromEntries(MODULES_CONFIG.map((m) => [m.id, buildFullPermission(m)])))
    }
  }

  // ── Module toggles ────────────────────────────────────────────────────────

  function toggleAccess(moduleId: ModuleId) {
    setModules((prev) => ({
      ...prev,
      [moduleId]: { ...prev[moduleId]!, access: !prev[moduleId]!.access },
    }))
  }

  function togglePermission(moduleId: ModuleId, permId: string) {
    setModules((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId]!,
        permissions: {
          ...prev[moduleId]!.permissions,
          [permId]: !prev[moduleId]!.permissions[permId],
        },
      },
    }))
  }

  function toggleFeature(moduleId: ModuleId, featureId: string) {
    setModules((prev) => ({
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
    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('Введите название роли')
      return
    }
    const duplicate = roles.some(
      (r) => r.name.toLowerCase() === trimmed.toLowerCase()
    )
    if (duplicate) {
      setNameError('Роль с таким названием уже существует')
      return
    }

    const activePermissions = Object.fromEntries(
      Object.entries(modules).filter(([, p]) => p.access)
    ) as FormModules

    addRole({ name: trimmed, permissions: activePermissions })
    setSavedRole({ name: trimmed, modules: activePermissions })
  }

  function handleCancel() {
    navigate('/users', { state: { tab: 'roles' } })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden bg-white">

        {/* ── Scrollable body ── */}
        <div className="min-h-0 flex-1 overflow-y-auto">

          {/* Back button — full width, true left */}
          <div className="px-6 pt-5 pb-0">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад к ролям
            </button>
          </div>

          <div className="mx-auto max-w-3xl px-6 pb-8 pt-5">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Создание роли</h1>
              <p className="mt-1 text-sm text-gray-500">
                Настройте доступы и функции для новой роли
              </p>
            </div>

            {/* ── Role name (no card, just input) ── */}
            <div className="mb-0">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Название роли
              </label>
              <input
                type="text"
                placeholder="Например: Менеджер, Оператор, Контент менеджер"
                value={name}
                autoFocus
                onChange={(e) => { setName(e.target.value); setNameError('') }}
                className={cn(
                  'h-10 w-full rounded-lg border px-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/20',
                  nameError
                    ? 'border-red-300 focus:border-red-400'
                    : 'border-gray-200 focus:border-gray-400',
                )}
              />
              {nameError && (
                <p className="mt-1.5 text-xs text-red-500">{nameError}</p>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* ── Modules section header ── */}
            <div className="mb-4 flex items-center gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Модули и права</h2>
                <p className="text-xs text-gray-400">
                  {activeCount} из {MODULES_CONFIG.length} модулей включено
                </p>
              </div>

              {/* Select-all switch */}
              <div className="ml-auto flex items-center gap-2.5">
                <span className="text-xs font-medium text-gray-500">Выбрать все</span>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
                    allSelected ? 'bg-gray-900' : 'bg-gray-200',
                  )}
                >
                  <span className={cn(
                    'inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                    allSelected ? 'translate-x-5' : 'translate-x-0.5',
                  )} />
                </button>
              </div>
            </div>

            {/* ── Search ── */}
            <div className="relative mb-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Найти модуль..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
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

            {/* ── Module cards ── */}
            {filteredConfigs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 py-12">
                <p className="text-sm text-gray-400">Модули не найдены</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredConfigs.map((config) => (
                  <ModuleCard
                    key={config.id}
                    config={config}
                    perm={modules[config.id]!}
                    onToggleAccess={() => toggleAccess(config.id)}
                    onTogglePermission={(id) => togglePermission(config.id, id)}
                    onToggleFeature={(id) => toggleFeature(config.id, id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky bottom action bar ── */}
        <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleCancel}
              className="h-9 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="h-9 rounded-lg bg-gray-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Создать роль
            </button>
          </div>
        </div>
      </div>

      {/* ── Success modal ── */}
      {savedRole && (
        <SuccessModal
          roleName={savedRole.name}
          modules={savedRole.modules}
          onClose={() => navigate('/users', { state: { tab: 'roles' } })}
        />
      )}
    </>
  )
}
