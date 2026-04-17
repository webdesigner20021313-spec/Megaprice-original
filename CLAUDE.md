# MegaPrice - Платформа заказов для аптек

## О проекте
Веб-платформа для аптек, позволяющая заказывать лекарства у оптовиков. Фронтенд с моковыми данными, готовый к подключению API.

## Технологии
- **Framework:** React 18 + TypeScript (Vite)
- **Routing:** React Router v6
- **State:** Zustand
- **UI Kit:** Isomorphic FuryRoad (shadcn/ui + Radix + Tailwind CSS)
- **Charts:** Recharts
- **Icons:** Lucide React

## UI Kit — Isomorphic FuryRoad
> **Полный гайд по стилю:** `STYLE_GUIDE.md` — единственный источник правды. Не возвращаться к сайту.

Компоненты: `src/components/ui/`
- Button, Input, Select, Card, Badge, Table, Modal, Toast

### Design Tokens (кратко — полное в STYLE_GUIDE.md)
- **Шрифт:** Inter (только Inter, везде)
- **Цвет текста:** `#111827` (основной), `#6B7280` (вторичный)
- **Фон страницы:** `#F8FAFC` (slate-50)
- **Фон карточки/панели:** `#FFFFFF`, border `#E5E7EB`
- **Primary button:** `bg-gray-900` / `hover:bg-black`, text-white
- **Secondary button:** `bg-white border border-gray-300 text-gray-700`
- **Sidebar узкий фон:** `#1C1917` (stone-900)
- **Status colors:**
  - Success: `bg-[#D1FAE5]` text `text-[#065F46]`
  - Warning: `bg-[#FEF3C7]` text `text-[#92400E]`
  - Info/Blue: `bg-[#DBEAFE]` text `text-[#1E40AF]`
  - Danger: `bg-[#FEE2E2]` text `text-[#991B1B]`
  - Default/Gray: `bg-[#F3F4F6]` text `text-[#374151]`
- **Border radius:** lg=8px (кнопки/input), xl=12px (карточки), full=9999px (badges/аватары)
- **Shadows:** sm (cards), lg (modals/dropdowns)

## Структура папок
```
src/
├── components/
│   ├── ui/          — UI Kit компоненты (Button, Input, Select, Card, Badge, Table, Modal, Toast)
│   └── shared/      — Toaster (toast-уведомления)
├── layouts/
│   ├── RootLayout.tsx — Основной layout (Sidebar + Header + Outlet)
│   ├── Header.tsx     — Лого, поиск страниц, уведомления, профиль
│   └── Sidebar.tsx    — Навигация: Магазин / Потребность / Корзинка / Аналитика
├── pages/
│   ├── dashboard/   — DashboardPage (заглушка)
│   ├── purchase/    — PurchasePage + компоненты (реализовано): PharmacySelector,
│   │                  PurchaseHeader, MedicineList/, SupplierOffers/, AutoSelect/
│   │                  hooks/ (useColumnResize, useFavorites, usePurchaseCart)
│   │                  types/purchase.types.ts
│   ├── orders/      — OrderHistoryPage, OrderDetailPage (заглушки)
│   ├── catalog/     — MedicineCatalogPage, ExcelUploadPage, PosListPage (заглушки)
│   ├── pharmacies/  — PharmacyListPage, AddPharmacyPage, PharmacyDetailPage (заглушки)
│   ├── analytics/   — ReportsPage, StatisticsPage (заглушки)
│   └── settings/    — SettingsPage (заглушка)
├── stores/
│   ├── useUIStore.ts           — Состояние sidebar, subPanel, language, mobile
│   ├── useUserStore.ts         — Профиль пользователя
│   └── useNotificationStore.ts — Уведомления (read/unread)
├── data/
│   ├── types.ts          — Общие TypeScript интерфейсы
│   ├── user.ts           — Моковый профиль пользователя
│   └── notifications.ts  — Моковые уведомления
├── mocks/
│   └── purchase.mocks.ts — Моки для модуля Закупки (аптеки, лекарства, поставщики)
└── lib/
    ├── utils.ts   — cn() helper
    └── format.ts  — formatCurrency, formatDate, formatDateTime, formatNumber
```

## Роуты
| Путь | Страница | Статус |
|------|----------|--------|
| `/` | DashboardPage | Заглушка |
| `/purchase` | PurchasePage | ✅ Реализовано |
| `/orders` | OrderHistoryPage | Заглушка |
| `/orders/:id` | OrderDetailPage | Заглушка |
| `/catalog` | MedicineCatalogPage | Заглушка |
| `/catalog/upload` | ExcelUploadPage | Заглушка |
| `/catalog/pos` | PosListPage | Заглушка |
| `/pharmacies` | PharmacyListPage | Заглушка |
| `/pharmacies/add` | AddPharmacyPage | Заглушка |
| `/pharmacies/:id` | PharmacyDetailPage | Заглушка |
| `/analytics/reports` | ReportsPage | Заглушка |
| `/analytics/statistics` | StatisticsPage | Заглушка |
| `/cart` | SettingsPage (временная заглушка) | Заглушка |
| `/settings` | SettingsPage | Заглушка |

## Компоненты Этапа 1

### Header (`src/layouts/Header.tsx`)
- Поиск страниц и разделов (фильтрация в реальном времени)
- Колокольчик уведомлений с badge непрочитанных
- Dropdown уведомлений: список, «Прочитать все»
- Фото профиля → dropdown: имя/роль, Аккаунт, Настройки, Выйти
- Гамбургер-меню на мобильных

### Sidebar (`src/layouts/Sidebar.tsx`)
- 4 пункта: Магазин (`/purchase`), Потребность (`/orders`), Корзинка (`/cart`), Аналитика (`/analytics/reports`)
- Узкая фиксированная ширина 140px, фон `#1C1917`
- Активный пункт — белая "пилюля" 108×40 с тёмным текстом
- Иконки Lucide, подписи 16px

### Модуль «Закупки» (`src/pages/purchase/`)
- PurchasePage — главный контейнер
- PharmacySelector — выбор аптеки
- PurchaseHeader — шапка модуля
- MedicineList/ — список лекарств (Tabs, Filters, Row, Table, ExcelUploadView)
- SupplierOffers/ — предложения поставщиков (Filters, Row, Table, QuantityControl)
- AutoSelect/ — модалка автоподбора
- hooks/ — useColumnResize, useFavorites, usePurchaseCart
- types/purchase.types.ts — локальные типы модуля
- Источник данных: `src/mocks/purchase.mocks.ts`

## Этапы разработки
- [x] Этап 0: Инициализация проекта, UI Kit, конфигурация
- [x] Этап 1: Layout (Header + Sidebar + Routing)
- [x] Этап 2: Модуль «Закупки» (`/purchase`)
- [ ] Этап 3: Dashboard
- [ ] Этап 4: Модуль «Заказы» (история, детали)
- [ ] Этап 5: Модуль «Каталог лекарств»
- [ ] Этап 6: Модуль «Мои аптеки»
- [ ] Этап 7: Модуль «Аналитика»
- [ ] Этап 8: Настройки

## Команды
```bash
npm run dev    # Запуск dev-сервера
npm run build  # Сборка
```
