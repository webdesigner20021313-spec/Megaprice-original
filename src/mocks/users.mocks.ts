import type { Role, User } from '@/pages/users/types/users.types'

export const mockRoles: Role[] = [
  {
    id: 'role-1',
    name: 'Администратор',
    permissions: {
      shop:      { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: { manual: true,  post: true,  excel: true,  wholesalers: true  } },
      needs:     { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: { product_info: true,  kpi_cards: true  } },
      cart:      { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: {} },
      orders:    { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: { download_all: true,  download_vendor: true,  download_invoice: true  } },
      analytics: { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: {} },
      users:     { access: true, permissions: { read: true,  edit: true,  delete: true  }, features: { add_user: true,  create_role: true,  edit_user: true  } },
    },
  },
  {
    id: 'role-2',
    name: 'Менеджер',
    permissions: {
      shop:   { access: true, permissions: { read: true,  edit: true,  delete: false }, features: { manual: true,  post: true,  excel: true,  wholesalers: true  } },
      needs:  { access: true, permissions: { read: true,  edit: false, delete: false }, features: { product_info: true,  kpi_cards: false } },
      cart:   { access: true, permissions: { read: true,  edit: true,  delete: false }, features: {} },
      orders: { access: true, permissions: { read: true,  edit: true,  delete: false }, features: { download_all: true,  download_vendor: false, download_invoice: false } },
    },
  },
  {
    id: 'role-3',
    name: 'Аналитик',
    permissions: {
      analytics: { access: true, permissions: { read: true,  edit: false, delete: false }, features: {} },
      needs:     { access: true, permissions: { read: true,  edit: false, delete: false }, features: { product_info: true,  kpi_cards: true  } },
    },
  },
  {
    id: 'role-4',
    name: 'Оператор',
    permissions: {
      shop:   { access: true, permissions: { read: true,  edit: true,  delete: false }, features: { manual: true,  post: false, excel: false, wholesalers: true  } },
      orders: { access: true, permissions: { read: true,  edit: false, delete: false }, features: { download_all: false, download_vendor: false, download_invoice: false } },
    },
  },
]

export const mockUsers: User[] = [
  { id: 'u-1', name: 'Алишер Каримов',   phone: '+998 90 000 11 01', email: 'alisher@megaprice.uz',  login: 'alisher.karimov',   password: '123456', roleId: 'role-1', isActive: true,  createdAt: '2026-01-10T09:00:00' },
  { id: 'u-2', name: 'Зафар Рахимов',    phone: '+998 90 123 45 67', email: 'zafar@megaprice.uz',    login: 'zafar.rahimov',     password: '123456', roleId: 'role-2', isActive: true,  createdAt: '2026-02-15T10:30:00' },
  { id: 'u-3', name: 'Дилноза Усманова', phone: '+998 91 234 56 78', email: 'dilnoza@megaprice.uz',  login: 'dilnoza.usmanova',  password: '123456', roleId: 'role-3', isActive: true,  createdAt: '2026-02-20T11:00:00' },
  { id: 'u-4', name: 'Бобур Тошматов',   phone: '+998 93 345 67 89', email: undefined,               login: 'bobur.toshmatov',   password: '123456', roleId: 'role-4', isActive: false, createdAt: '2026-03-01T08:00:00' },
  { id: 'u-5', name: 'Нилуфар Хасанова', phone: '+998 94 456 78 90', email: 'nilufar@megaprice.uz',  login: 'nilufar.hasanova',  password: '123456', roleId: 'role-2', isActive: true,  createdAt: '2026-03-10T14:00:00' },
]
