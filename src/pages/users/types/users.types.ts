export type ModuleId = 'shop' | 'needs' | 'cart' | 'orders' | 'analytics' | 'users'

// ── Static config types ───────────────────────────────────────────────────────

/** A single permission option inside a module (e.g. "Читать", "Создавать") */
export interface ModulePermissionDef {
  id: string
  label: string
}

/** A single feature option inside a module (e.g. "Вручную", "Excel") */
export interface ModuleFeature {
  id: string
  label: string
}

/** Static config describing a module's available permissions and features */
export interface ModuleConfig {
  id: ModuleId
  label: string
  permissions: ModulePermissionDef[]
  features: ModuleFeature[]
}

// ── Runtime permission state ──────────────────────────────────────────────────

/** Runtime state for a module in a Role */
export interface ModulePermission {
  access: boolean
  permissions: Record<string, boolean>   // e.g. { read: true, create: false }
  features:    Record<string, boolean>   // e.g. { manual: true, excel: false }
}

// ── Domain models ─────────────────────────────────────────────────────────────

export interface Role {
  id: string
  name: string
  permissions: Partial<Record<ModuleId, ModulePermission>>
}

export interface User {
  id: string
  name: string       // firstName + ' ' + lastName
  phone: string
  email?: string
  login: string
  password: string
  roleId: string | null
  isActive: boolean
  createdAt: string
  avatar?: string
}

// ── Modules config (single source of truth) ───────────────────────────────────
export const MODULES_CONFIG: ModuleConfig[] = [
  {
    id: 'shop',
    label: 'Магазин',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [
      { id: 'manual',      label: 'Вручную'  },
      { id: 'post',        label: 'Post'      },
      { id: 'excel',       label: 'Excel'     },
      { id: 'wholesalers', label: 'Оптовики' },
    ],
  },
  {
    id: 'needs',
    label: 'Потребности',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [
      { id: 'product_info', label: 'Внутренняя информация продукта'    },
      { id: 'kpi_cards',    label: 'Верхние данные карточки (4 блока)' },
    ],
  },
  {
    id: 'cart',
    label: 'Корзина',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [],
  },
  {
    id: 'orders',
    label: 'Заказы',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [
      { id: 'download_all',     label: 'Скачать заказы (общие)'      },
      { id: 'download_vendor',  label: 'Скачать заказы по оптовикам' },
      { id: 'download_invoice', label: 'Скачать invoice'             },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [],
  },
  {
    id: 'users',
    label: 'Пользователи',
    permissions: [
      { id: 'read',   label: 'Читать'   },
      { id: 'edit',   label: 'Изменять' },
      { id: 'delete', label: 'Удалять'  },
    ],
    features: [
      { id: 'add_user',    label: 'Добавить пользователя' },
      { id: 'create_role', label: 'Создать роли'          },
      { id: 'edit_user',   label: 'Изменить пользователя' },
    ],
  },
]

/** Flat list used in selectors that only need id + label */
export const MODULE_LIST = MODULES_CONFIG.map(({ id, label }) => ({ id, label }))

// ── Permission helpers ────────────────────────────────────────────────────────

/** Build a default (fully-enabled) ModulePermission from a ModuleConfig */
export function buildFullPermission(config: ModuleConfig): ModulePermission {
  return {
    access:      true,
    permissions: Object.fromEntries(config.permissions.map((p) => [p.id, true])),
    features:    Object.fromEntries(config.features.map((f)    => [f.id, true])),
  }
}

/** Build a default (fully-disabled) ModulePermission from a ModuleConfig */
export function buildEmptyPermission(config: ModuleConfig): ModulePermission {
  return {
    access:      false,
    permissions: Object.fromEntries(config.permissions.map((p) => [p.id, false])),
    features:    Object.fromEntries(config.features.map((f)    => [f.id, false])),
  }
}
