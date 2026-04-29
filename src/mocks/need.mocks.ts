// ─── Existing: PharmacyAnalytics (используется в старом NeedPage) ─────────────

export interface PharmacySaleRow {
  pharmacyName: string
  manufacturer: string
  salePrice: number
  sales30d: number
  stock: number
  lastPurchaseDate: string
}

export const mockPharmacyAnalytics: Record<string, PharmacySaleRow[]> = {
  m1: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',  manufacturer: 'Novartis',          salePrice: 52000,  sales30d: 28, stock: 12, lastPurchaseDate: '2026-04-01' },
    { pharmacyName: 'Шифо (Юнусабад)',            manufacturer: 'Novartis',          salePrice: 53500,  sales30d: 15, stock:  8, lastPurchaseDate: '2026-03-20' },
    { pharmacyName: 'Здоровье (Чиланзар)',        manufacturer: 'Novartis',          salePrice: 51000,  sales30d: 32, stock:  5, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Hayot Dori (Самарканд)',     manufacturer: 'Novartis',          salePrice: 50000,  sales30d: 10, stock: 18, lastPurchaseDate: '2026-03-15' },
    { pharmacyName: 'Nasiba Dori (Фергана)',      manufacturer: 'Novartis',          salePrice: 49500,  sales30d:  7, stock:  3, lastPurchaseDate: '2026-04-05' },
  ],
  m2: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',  manufacturer: 'Novartis',          salePrice: 18500,  sales30d: 45, stock: 30, lastPurchaseDate: '2026-04-08' },
    { pharmacyName: 'Шифо (Юнусабад)',            manufacturer: 'Novartis',          salePrice: 19000,  sales30d: 22, stock:  7, lastPurchaseDate: '2026-03-25' },
    { pharmacyName: 'Здоровье (Чиланзар)',        manufacturer: 'Novartis',          salePrice: 18000,  sales30d: 38, stock: 15, lastPurchaseDate: '2026-04-12' },
    { pharmacyName: 'Hayot Dori (Самарканд)',     manufacturer: 'Novartis',          salePrice: 17500,  sales30d: 18, stock: 25, lastPurchaseDate: '2026-03-10' },
  ],
}

// ─── NEW: NeedItem — аналитика по каждому товару ─────────────────────────────

export type NeedStatus = 'oos' | 'critical' | 'normal' | 'overstock' | 'dead'

export interface NeedItem {
  id: string
  name: string
  manufacturer: string
  country: string
  group: string

  // Остатки
  stock: number
  optimalStock: number       // оптимальный запас (ед.)

  // Продажи
  avgDailySales: number      // средние продажи/день
  sales30d: number           // продажи за 30 дней
  sales7d: number            // продажи за 7 дней
  lastSaleDate: string       // дата последней продажи

  // Расчётные
  daysOfCover: number        // дней покрытия = stock / avgDailySales
  status: NeedStatus

  // Финансы
  salePrice: number          // розничная цена (₸)
  costPrice: number          // закупочная цена (₸)
  lostRevenuePerDay: number  // потери выручки в день (если OOS)
  frozenAmount: number       // заморожено в overstock (₸)

  // Рекомендации
  recommendedQty: number     // рекомендуемое количество к заказу

  // OOS
  oosSince: string | null    // дата начала OOS

  // Продажи по месяцам (Май 2025 → Апр 2026) — для графика в drawer
  monthlySales: number[]
}

export const mockNeedItems: NeedItem[] = [
  // ── OOS ──────────────────────────────────────────────────────────────────────
  {
    id: 'm2',
    name: 'Амоксициллин 500мг, капс. №20',
    manufacturer: 'Novartis', country: 'Швейцария', group: 'Антибиотики',
    stock: 0, optimalStock: 60,
    avgDailySales: 4.1, sales30d: 123, sales7d: 29,
    lastSaleDate: '2026-04-23',
    daysOfCover: 0, status: 'oos',
    salePrice: 18500, costPrice: 13000,
    lostRevenuePerDay: 75850, frozenAmount: 0,
    recommendedQty: 80,
    oosSince: '2026-04-24',
    monthlySales: [88, 82, 77, 85, 102, 118, 140, 148, 152, 134, 126, 118],
  },
  {
    id: 'm7',
    name: 'Аугментин 875/125мг, табл. №14',
    manufacturer: 'GlaxoSmithKline', country: 'Великобритания', group: 'Антибиотики',
    stock: 0, optimalStock: 25,
    avgDailySales: 1.2, sales30d: 36, sales7d: 8,
    lastSaleDate: '2026-04-21',
    daysOfCover: 0, status: 'oos',
    salePrice: 78000, costPrice: 58000,
    lostRevenuePerDay: 93600, frozenAmount: 0,
    recommendedQty: 30,
    oosSince: '2026-04-21',
    monthlySales: [26, 24, 22, 25, 30, 35, 42, 44, 46, 40, 38, 35],
  },

  // ── Критично (< 7 дней) ───────────────────────────────────────────────────
  {
    id: 'm3',
    name: 'Омепразол 20мг, капс. №30',
    manufacturer: 'Novartis', country: 'Швейцария', group: 'Гастроэнтерология',
    stock: 7, optimalStock: 60,
    avgDailySales: 3.5, sales30d: 105, sales7d: 25,
    lastSaleDate: '2026-04-27',
    daysOfCover: 2.0, status: 'critical',
    salePrice: 24000, costPrice: 17500,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 65,
    oosSince: null,
    monthlySales: [92, 90, 88, 92, 95, 100, 106, 110, 112, 108, 105, 102],
  },
  {
    id: 'm5',
    name: 'Цетиризин 10мг, табл. №20',
    manufacturer: 'Биосинтез', country: 'Россия', group: 'Антигистаминные',
    stock: 12, optimalStock: 100,
    avgDailySales: 4.8, sales30d: 144, sales7d: 34,
    lastSaleDate: '2026-04-27',
    daysOfCover: 2.5, status: 'critical',
    salePrice: 5500, costPrice: 4000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 120,
    oosSince: null,
    monthlySales: [72, 68, 78, 125, 138, 105, 82, 78, 92, 115, 128, 112],
  },
  {
    id: 'm4',
    name: 'Нурофен 400мг, табл. №12',
    manufacturer: 'Reckitt Benckiser', country: 'Великобритания', group: 'Анальгетики',
    stock: 32, optimalStock: 100,
    avgDailySales: 4.7, sales30d: 141, sales7d: 33,
    lastSaleDate: '2026-04-27',
    daysOfCover: 6.8, status: 'critical',
    salePrice: 12500, costPrice: 9000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 80,
    oosSince: null,
    monthlySales: [118, 112, 118, 125, 130, 138, 145, 152, 155, 148, 142, 138],
  },
  {
    id: 'm12',
    name: 'Кларитромицин 500мг, табл. №14',
    manufacturer: 'Teva', country: 'Израиль', group: 'Антибиотики',
    stock: 18, optimalStock: 55,
    avgDailySales: 2.6, sales30d: 78, sales7d: 18,
    lastSaleDate: '2026-04-26',
    daysOfCover: 6.9, status: 'critical',
    salePrice: 11000, costPrice: 8000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 50,
    oosSince: null,
    monthlySales: [55, 52, 48, 54, 65, 75, 90, 96, 98, 88, 82, 75],
  },
  {
    id: 'm15',
    name: 'Тиотропий 18мкг, капс. №30',
    manufacturer: 'Takeda', country: 'Япония', group: 'Дыхательная система',
    stock: 4, optimalStock: 18,
    avgDailySales: 0.8, sales30d: 24, sales7d: 6,
    lastSaleDate: '2026-04-25',
    daysOfCover: 5.0, status: 'critical',
    salePrice: 125000, costPrice: 95000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 15,
    oosSince: null,
    monthlySales: [16, 14, 14, 16, 18, 22, 28, 30, 30, 26, 24, 22],
  },

  // ── Норма ─────────────────────────────────────────────────────────────────
  {
    id: 'm1',
    name: 'Диклофенак 50мг, табл. №20',
    manufacturer: 'Novartis', country: 'Швейцария', group: 'Анальгетики',
    stock: 45, optimalStock: 70,
    avgDailySales: 3.2, sales30d: 96, sales7d: 22,
    lastSaleDate: '2026-04-27',
    daysOfCover: 14.1, status: 'normal',
    salePrice: 52000, costPrice: 38000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 30,
    oosSince: null,
    monthlySales: [85, 82, 85, 90, 96, 100, 105, 110, 112, 106, 100, 96],
  },
  {
    id: 'm6',
    name: 'Эналаприл 10мг, табл. №20',
    manufacturer: 'KRKA', country: 'Словения', group: 'Кардиология',
    stock: 44, optimalStock: 50,
    avgDailySales: 1.8, sales30d: 54, sales7d: 13,
    lastSaleDate: '2026-04-27',
    daysOfCover: 24.4, status: 'normal',
    salePrice: 33000, costPrice: 24000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [52, 51, 50, 52, 53, 54, 55, 56, 58, 56, 54, 53],
  },
  {
    id: 'm8',
    name: 'Метформин 500мг, табл. №60',
    manufacturer: 'Teva', country: 'Израиль', group: 'Диабетология',
    stock: 56, optimalStock: 60,
    avgDailySales: 2.2, sales30d: 66, sales7d: 15,
    lastSaleDate: '2026-04-27',
    daysOfCover: 25.5, status: 'normal',
    salePrice: 27000, costPrice: 19500,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [64, 63, 60, 62, 64, 65, 66, 68, 70, 68, 66, 65],
  },
  {
    id: 'm10',
    name: 'Бисопролол 5мг, табл. №30',
    manufacturer: 'KRKA', country: 'Словения', group: 'Кардиология',
    stock: 34, optimalStock: 42,
    avgDailySales: 2.0, sales30d: 60, sales7d: 14,
    lastSaleDate: '2026-04-27',
    daysOfCover: 17.0, status: 'normal',
    salePrice: 9500, costPrice: 7000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 15,
    oosSince: null,
    monthlySales: [58, 57, 55, 58, 59, 60, 61, 62, 64, 62, 60, 59],
  },
  {
    id: 'm13',
    name: 'Азитромицин 500мг, табл. №3',
    manufacturer: "Dr. Reddy's", country: 'Индия', group: 'Антибиотики',
    stock: 26, optimalStock: 50,
    avgDailySales: 2.4, sales30d: 72, sales7d: 17,
    lastSaleDate: '2026-04-26',
    daysOfCover: 10.8, status: 'normal',
    salePrice: 17500, costPrice: 12500,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 25,
    oosSince: null,
    monthlySales: [62, 58, 55, 60, 72, 82, 98, 104, 106, 95, 88, 80],
  },
  {
    id: 'm14',
    name: 'Пантопразол 40мг, табл. №28',
    manufacturer: 'Sanofi', country: 'Франция', group: 'Гастроэнтерология',
    stock: 20, optimalStock: 40,
    avgDailySales: 1.7, sales30d: 51, sales7d: 12,
    lastSaleDate: '2026-04-25',
    daysOfCover: 11.8, status: 'normal',
    salePrice: 22000, costPrice: 16000,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 20,
    oosSince: null,
    monthlySales: [48, 47, 46, 48, 50, 51, 52, 53, 54, 52, 51, 50],
  },
  {
    id: 'm17',
    name: 'Лизиноприл 10мг, табл. №30',
    manufacturer: 'KRKA', country: 'Словения', group: 'Кардиология',
    stock: 38, optimalStock: 55,
    avgDailySales: 2.5, sales30d: 75, sales7d: 17,
    lastSaleDate: '2026-04-27',
    daysOfCover: 15.2, status: 'normal',
    salePrice: 7000, costPrice: 5200,
    lostRevenuePerDay: 0, frozenAmount: 0,
    recommendedQty: 20,
    oosSince: null,
    monthlySales: [72, 70, 68, 72, 74, 75, 76, 78, 80, 78, 76, 74],
  },

  // ── Overstock ─────────────────────────────────────────────────────────────
  {
    id: 'm9',
    name: 'Лоратадин 10мг, табл. №30',
    manufacturer: 'Акрихин', country: 'Россия', group: 'Антигистаминные',
    stock: 78, optimalStock: 30,
    avgDailySales: 2.0, sales30d: 60, sales7d: 14,
    lastSaleDate: '2026-04-27',
    daysOfCover: 39.0, status: 'overstock',
    salePrice: 9500, costPrice: 7000,
    lostRevenuePerDay: 0, frozenAmount: 336000,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [68, 65, 72, 118, 125, 98, 78, 72, 88, 108, 118, 105],
  },
  {
    id: 'm11',
    name: 'Симвастатин 20мг, табл. №30',
    manufacturer: 'Berlin-Chemie', country: 'Германия', group: 'Статины',
    stock: 85, optimalStock: 30,
    avgDailySales: 1.5, sales30d: 45, sales7d: 10,
    lastSaleDate: '2026-04-27',
    daysOfCover: 56.7, status: 'overstock',
    salePrice: 15500, costPrice: 11000,
    lostRevenuePerDay: 0, frozenAmount: 605000,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [44, 43, 42, 44, 45, 46, 46, 47, 48, 47, 46, 44],
  },
  {
    id: 'm18',
    name: 'Метопролол 50мг, табл. №30',
    manufacturer: 'Биосинтез', country: 'Россия', group: 'Кардиология',
    stock: 92, optimalStock: 40,
    avgDailySales: 2.7, sales30d: 81, sales7d: 19,
    lastSaleDate: '2026-04-27',
    daysOfCover: 34.1, status: 'overstock',
    salePrice: 7800, costPrice: 5800,
    lostRevenuePerDay: 0, frozenAmount: 301600,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [78, 76, 74, 78, 80, 81, 82, 84, 86, 84, 82, 80],
  },

  // ── Мёртвый сток ──────────────────────────────────────────────────────────
  {
    id: 'm16',
    name: 'Розувастатин 20мг, табл. №30',
    manufacturer: 'Фармасофт', country: 'Россия', group: 'Статины',
    stock: 22, optimalStock: 5,
    avgDailySales: 0.08, sales30d: 2, sales7d: 0,
    lastSaleDate: '2026-03-10',
    daysOfCover: 275, status: 'dead',
    salePrice: 88000, costPrice: 65000,
    lostRevenuePerDay: 0, frozenAmount: 1430000,
    recommendedQty: 0,
    oosSince: null,
    monthlySales: [12, 10, 8, 6, 5, 4, 3, 3, 2, 2, 2, 2],
  },
]
