export interface PharmacySaleRow {
  pharmacyName: string
  manufacturer: string
  salePrice: number      // цена продажи покупателю
  sales30d: number       // продажи за 30 дней (база для масштабирования)
  stock: number          // текущий остаток (ед.)
  lastPurchaseDate: string
}

// Данные аналитики по аптекам, сгруппированные по medicineId
export const mockPharmacyAnalytics: Record<string, PharmacySaleRow[]> = {
  m1: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Novartis',          salePrice: 52000, sales30d: 28, stock: 12, lastPurchaseDate: '2026-04-01' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Novartis',          salePrice: 53500, sales30d: 15, stock:  8, lastPurchaseDate: '2026-03-20' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Novartis',          salePrice: 51000, sales30d: 32, stock:  5, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Novartis',          salePrice: 50000, sales30d: 10, stock: 18, lastPurchaseDate: '2026-03-15' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Novartis',          salePrice: 49500, sales30d:  7, stock:  3, lastPurchaseDate: '2026-04-05' },
  ],
  m2: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Novartis',          salePrice: 18500, sales30d: 45, stock: 30, lastPurchaseDate: '2026-04-08' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Novartis',          salePrice: 19000, sales30d: 22, stock:  7, lastPurchaseDate: '2026-03-25' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Novartis',          salePrice: 18000, sales30d: 38, stock: 15, lastPurchaseDate: '2026-04-12' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Novartis',          salePrice: 17500, sales30d: 18, stock: 25, lastPurchaseDate: '2026-03-10' },
  ],
  m3: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Novartis',          salePrice: 24000, sales30d: 18, stock:  9, lastPurchaseDate: '2026-04-05' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Novartis',          salePrice: 25000, sales30d: 11, stock:  4, lastPurchaseDate: '2026-03-18' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Novartis',          salePrice: 23500, sales30d: 20, stock: 12, lastPurchaseDate: '2026-04-02' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Novartis',          salePrice: 23000, sales30d:  8, stock:  2, lastPurchaseDate: '2026-03-28' },
  ],
  m4: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Reckitt Benckiser', salePrice: 12500, sales30d: 55, stock: 20, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Reckitt Benckiser', salePrice: 13000, sales30d: 30, stock: 12, lastPurchaseDate: '2026-04-01' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Reckitt Benckiser', salePrice: 12000, sales30d: 42, stock:  8, lastPurchaseDate: '2026-04-15' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Reckitt Benckiser', salePrice: 11500, sales30d: 25, stock: 35, lastPurchaseDate: '2026-03-22' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Reckitt Benckiser', salePrice: 11000, sales30d: 15, stock:  6, lastPurchaseDate: '2026-04-07' },
  ],
  m5: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Биосинтез',         salePrice:  5500, sales30d: 80, stock: 45, lastPurchaseDate: '2026-04-12' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Биосинтез',         salePrice:  5800, sales30d: 50, stock: 20, lastPurchaseDate: '2026-04-05' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Биосинтез',         salePrice:  5300, sales30d: 70, stock: 15, lastPurchaseDate: '2026-04-14' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Биосинтез',         salePrice:  5000, sales30d: 40, stock: 60, lastPurchaseDate: '2026-03-30' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Биосинтез',         salePrice:  4800, sales30d: 25, stock: 10, lastPurchaseDate: '2026-04-02' },
  ],
  m6: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'KRKA',              salePrice: 33000, sales30d: 22, stock:  8, lastPurchaseDate: '2026-04-08' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'KRKA',              salePrice: 34000, sales30d: 14, stock:  5, lastPurchaseDate: '2026-03-22' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'KRKA',              salePrice: 32500, sales30d: 18, stock: 11, lastPurchaseDate: '2026-04-11' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'KRKA',              salePrice: 31000, sales30d:  9, stock: 20, lastPurchaseDate: '2026-03-08' },
  ],
  m7: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'GlaxoSmithKline',   salePrice: 78000, sales30d: 12, stock:  5, lastPurchaseDate: '2026-04-03' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'GlaxoSmithKline',   salePrice: 80000, sales30d:  8, stock:  2, lastPurchaseDate: '2026-03-17' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'GlaxoSmithKline',   salePrice: 77000, sales30d: 15, stock:  7, lastPurchaseDate: '2026-04-09' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'GlaxoSmithKline',   salePrice: 75000, sales30d:  5, stock: 10, lastPurchaseDate: '2026-03-01' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'GlaxoSmithKline',   salePrice: 74000, sales30d:  4, stock:  1, lastPurchaseDate: '2026-04-06' },
  ],
  m8: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Teva',              salePrice: 27000, sales30d: 20, stock: 10, lastPurchaseDate: '2026-04-07' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Teva',              salePrice: 28000, sales30d: 12, stock:  4, lastPurchaseDate: '2026-03-24' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Teva',              salePrice: 26500, sales30d: 16, stock:  8, lastPurchaseDate: '2026-04-13' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Teva',              salePrice: 26000, sales30d:  7, stock:  3, lastPurchaseDate: '2026-03-29' },
  ],
  m9: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Акрихин',           salePrice:  9000, sales30d: 35, stock: 14, lastPurchaseDate: '2026-04-09' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Акрихин',           salePrice:  9500, sales30d: 20, stock:  7, lastPurchaseDate: '2026-04-01' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Акрихин',           salePrice:  8500, sales30d: 28, stock: 10, lastPurchaseDate: '2026-04-11' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Акрихин',           salePrice:  8000, sales30d: 15, stock: 25, lastPurchaseDate: '2026-03-20' },
  ],
  m10: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'KRKA',              salePrice:  9500, sales30d: 30, stock: 12, lastPurchaseDate: '2026-04-06' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'KRKA',              salePrice: 10000, sales30d: 18, stock:  6, lastPurchaseDate: '2026-03-28' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'KRKA',              salePrice:  9200, sales30d: 22, stock:  9, lastPurchaseDate: '2026-04-12' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'KRKA',              salePrice:  9000, sales30d: 10, stock:  4, lastPurchaseDate: '2026-04-03' },
  ],
  m11: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Berlin-Chemie',     salePrice: 15500, sales30d: 24, stock: 11, lastPurchaseDate: '2026-04-04' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Berlin-Chemie',     salePrice: 16000, sales30d: 16, stock:  5, lastPurchaseDate: '2026-03-26' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Berlin-Chemie',     salePrice: 15000, sales30d:  9, stock: 20, lastPurchaseDate: '2026-03-12' },
  ],
  m12: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Teva',              salePrice: 11000, sales30d: 40, stock: 18, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Teva',              salePrice: 11500, sales30d: 25, stock:  8, lastPurchaseDate: '2026-04-02' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Teva',              salePrice: 10500, sales30d: 30, stock: 14, lastPurchaseDate: '2026-04-13' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Teva',              salePrice: 10000, sales30d: 12, stock:  5, lastPurchaseDate: '2026-04-01' },
  ],
  m13: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: "Dr. Reddy's",       salePrice: 17500, sales30d: 32, stock: 14, lastPurchaseDate: '2026-04-07' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: "Dr. Reddy's",       salePrice: 18000, sales30d: 20, stock:  6, lastPurchaseDate: '2026-03-23' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: "Dr. Reddy's",       salePrice: 17000, sales30d: 25, stock: 10, lastPurchaseDate: '2026-04-09' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: "Dr. Reddy's",       salePrice: 16500, sales30d: 11, stock: 22, lastPurchaseDate: '2026-03-05' },
  ],
  m14: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Sanofi',            salePrice: 22000, sales30d: 19, stock:  8, lastPurchaseDate: '2026-04-06' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Sanofi',            salePrice: 23000, sales30d: 13, stock:  3, lastPurchaseDate: '2026-03-19' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Sanofi',            salePrice: 21500, sales30d: 22, stock: 12, lastPurchaseDate: '2026-04-11' },
  ],
  m15: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Takeda',            salePrice: 125000, sales30d:  8, stock:  3, lastPurchaseDate: '2026-04-04' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Takeda',            salePrice: 128000, sales30d:  5, stock:  1, lastPurchaseDate: '2026-03-16' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Takeda',            salePrice: 123000, sales30d:  9, stock:  4, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Takeda',            salePrice: 120000, sales30d:  3, stock:  6, lastPurchaseDate: '2026-02-28' },
  ],
  m16: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Фармасофт',         salePrice: 88000, sales30d:  6, stock:  2, lastPurchaseDate: '2026-04-08' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Фармасофт',         salePrice: 90000, sales30d:  4, stock:  1, lastPurchaseDate: '2026-03-21' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Фармасофт',         salePrice: 85000, sales30d:  3, stock:  5, lastPurchaseDate: '2026-03-03' },
  ],
  m17: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'KRKA',              salePrice:  7000, sales30d: 42, stock: 16, lastPurchaseDate: '2026-04-09' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'KRKA',              salePrice:  7500, sales30d: 28, stock:  9, lastPurchaseDate: '2026-04-01' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'KRKA',              salePrice:  6800, sales30d: 35, stock: 12, lastPurchaseDate: '2026-04-14' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'KRKA',              salePrice:  6500, sales30d: 18, stock:  7, lastPurchaseDate: '2026-04-03' },
  ],
  m18: [
    { pharmacyName: 'Дорилар дунёси (Мирабад)',    manufacturer: 'Биосинтез',         salePrice:  7800, sales30d: 50, stock: 22, lastPurchaseDate: '2026-04-10' },
    { pharmacyName: 'Шифо (Юнусабад)',              manufacturer: 'Биосинтез',         salePrice:  8200, sales30d: 33, stock: 10, lastPurchaseDate: '2026-04-03' },
    { pharmacyName: 'Здоровье (Чиланзар)',          manufacturer: 'Биосинтез',         salePrice:  7500, sales30d: 45, stock: 18, lastPurchaseDate: '2026-04-12' },
    { pharmacyName: 'Hayot Dori (Самарканд)',       manufacturer: 'Биосинтез',         salePrice:  7200, sales30d: 20, stock: 30, lastPurchaseDate: '2026-03-28' },
    { pharmacyName: 'Nasiba Dori (Фергана)',        manufacturer: 'Биосинтез',         salePrice:  7000, sales30d: 15, stock:  8, lastPurchaseDate: '2026-04-05' },
  ],
}
