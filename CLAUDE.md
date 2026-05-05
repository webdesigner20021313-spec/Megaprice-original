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
- **Фон страницы:** `#FFFFFF` (white)
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
│   └── shared/      — Toaster (toast-уведомления), PrivateRoute
├── layouts/
│   ├── RootLayout.tsx — Основной layout (Sidebar + Header + Outlet)
│   ├── Header.tsx     — Лого, поиск страниц, уведомления, профиль
│   └── Sidebar.tsx    — Навигация: Магазин / Потребность / Корзинка / Заказы / Дистрибуторы
├── pages/
│   ├── auth/        — LoginPage (логин + восстановление пароля)
│   ├── purchase/    — PurchasePage + компоненты (реализовано): PharmacySelector,
│   │                  PurchaseHeader, MedicineList/, SupplierOffers/, AutoSelect/
│   │                  hooks/ (useColumnResize, useFavorites, usePurchaseCart)
│   │                  types/purchase.types.ts
│   ├── need/        — NeedPage (Потребность — реализовано)
│   ├── cart/        — CartPage (Корзина — реализовано)
│   ├── orders/      — OrderHistoryPage, OrderDetailPage (реализовано)
│   ├── wholesalers/ — WholesalersPage (Дистрибуторы — реализовано)
│   └── users/       — UsersPage, RoleCreatePage, RoleEditPage + компоненты (готовится)
├── stores/
│   ├── useUIStore.ts           — Состояние sidebar, subPanel, language, mobile
│   ├── useUserStore.ts         — Профиль пользователя
│   ├── useNotificationStore.ts — Уведомления (read/unread)
│   ├── useAuthStore.ts         — Авторизация (persist)
│   ├── useOrdersStore.ts       — Заказы (инициализируется из mockOrders)
│   └── useWholesalersStore.ts  — Скидки дистрибуторов (пусто по умолчанию)
├── data/
│   ├── types.ts          — Общие TypeScript интерфейсы
│   ├── user.ts           — Моковый профиль пользователя
│   └── notifications.ts  — Моковые уведомления
├── mocks/
│   ├── purchase.mocks.ts  — Моки для модуля Закупки (аптеки, лекарства, поставщики)
│   ├── orders.mocks.ts    — Моки истории заказов
│   ├── need.mocks.ts      — Моки для модуля Потребность
│   └── wholesalers.mocks.ts — Моки дистрибуторов
└── lib/
    ├── utils.ts   — cn() helper
    └── format.ts  — formatCurrency, formatDate, formatDateTime, formatNumber
```

## Роуты
| Путь | Страница | Статус |
|------|----------|--------|
| `/` | → редирект на `/purchase` | — |
| `/purchase` | PurchasePage | ✅ Реализовано |
| `/need` | NeedPage | ✅ Реализовано |
| `/cart` | CartPage | ✅ Реализовано |
| `/orders` | OrderHistoryPage | ✅ Реализовано |
| `/orders/:id` | OrderDetailPage | ✅ Реализовано |
| `/wholesalers` | WholesalersPage | ✅ Реализовано |
| `/users` | UsersPage | 🔧 Готовится |
| `/users/roles/create` | RoleCreatePage | 🔧 Готовится |
| `/users/roles/:id/edit` | RoleEditPage | 🔧 Готовится |

## Компоненты Layout

### Header (`src/layouts/Header.tsx`)
- Поиск страниц и разделов (фильтрация в реальном времени)
- Колокольчик уведомлений с badge непрочитанных
- Dropdown уведомлений: список, «Прочитать все»
- Профиль → dropdown: имя/роль, Выйти
- Переключатель языка (UZ / RU / EN)

### Sidebar (`src/layouts/Sidebar.tsx`)
- 5 пунктов: Магазин, Потребность, Корзинка, Заказы, Дистрибуторы
- Узкая фиксированная ширина 140px, фон `#1C1917`
- Активный пункт — белая "пилюля" 108×40 с тёмным текстом
- Иконки Lucide, подписи под иконками

### Модуль «Закупки» (`src/pages/purchase/`)
- PurchasePage — главный контейнер
- PharmacySelector — выбор аптеки
- PurchaseHeader — шапка модуля
- MedicineList/ — список лекарств (Tabs, Filters, Row, Table, ExcelUploadView)
- SupplierOffers/ — предложения поставщиков (Filters, Row, Table, QuantityControl)
- AutoSelect/ — модалка авто-подбора
- hooks/ — useColumnResize, useFavorites, usePurchaseCart
- types/purchase.types.ts — локальные типы модуля
- Источник данных: `src/mocks/purchase.mocks.ts`

## Ключевые механики
- **Скидки дистрибуторов:** `useWholesalersStore` — пользователь задаёт скидку в `/wholesalers`, она применяется к ценам в Магазине и Корзине. Бейдж «Спец. предложение» появляется только при user-set скидке.
- **Создание заказов:** `useOrdersStore` — заказы сохраняются в Zustand и сразу видны в `/orders`
- **Корзина:** синхронизирована между Магазином и Потребностью
- **Excel загрузка:** в Магазине — маппинг колонок через модальное окно, фильтрация пустых строк/колонок

## Команды
```bash
npm run dev    # Запуск dev-сервера
npm run build  # Сборка
```

## История версий

### v1.1.0 — 05.05.2026
- Удалены неиспользуемые разделы: dashboard, analytics, settings, catalog, pharmacies
- Исправлены орфографические ошибки: «Дистрибьютор» → «Дистрибутор», «Авто подбор» → «Авто-подбор»
- Исправлена CI ошибка TS6133 (неиспользуемый импорт cn)
- Версия пакета обновлена до 1.1.0

### v1.0.10 — 05.05.2026
- Дистрибуторы: скидки хранятся в Zustand (useWholesalersStore), применяются в Магазине и Корзине
- Бейдж «Спец. предложение» в предложениях поставщиков при наличии user-скидки
- Заказы сохраняются через useOrdersStore, сразу видны в истории
- Инвойс: лого MegaPrice через base64 SVG, всегда показывается дистрибутор
- Excel маппинг: модальное окно вместо панели, фильтрация пустых строк и колонок
- Success-модал корзины: переработан в таблицу дистрибуторов

### v1.0.6 — 29.04.2026
- Страница «Потребность»: переработан выбор аптеки — мульти-селект заменён на одиночный (radio-style)
- Выбор аптеки фильтрует таблицу по данным конкретной аптеки (пересчёт остатков, продаж, статусов)
- KPI-карточки работают как фильтры таблицы при клике (активное состояние с ring)
- InfoTooltip на KPI-карточках (заполненный серый кружок, чёрный tooltip)
- Drawer детали продукта: ширина 580px, единые отступы 16px, цена 18px, кнопка «Добавить в корзину»
- MiniBarChart: резиновая ширина через ResizeObserver, hover-тултип с данными месяца
- 4 KPI-карточки: Нет в наличии / Критично / Срочный заказ / Заморожено

### v1.0.5 — 27.04.2026
- Добавлён раздел «Потребность» (/need): 3-панельный layout (лекарства | оптовики | аналитика аптек)
- Фильтры Дистрибутор/Город/Бонусы вынесены в шапку рядом с периодом
- Кнопка Корзины в шапке Потребности (синхронизирована с общей корзиной)

### v1.0.0 — 23.04.2026
- Первый релиз: Layout (Header + Sidebar), модуль «Закупки», Корзина
- UI Kit: Button, Input, Badge, Toast, Card, Table, Modal, Select
