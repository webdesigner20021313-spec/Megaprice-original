import { Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { PurchasePage } from '@/pages/purchase/PurchasePage'
import { OrderHistoryPage } from '@/pages/orders/OrderHistoryPage'
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'
import { MedicineCatalogPage } from '@/pages/catalog/MedicineCatalogPage'
import { ExcelUploadPage } from '@/pages/catalog/ExcelUploadPage'
import { PosListPage } from '@/pages/catalog/PosListPage'
import { PharmacyListPage } from '@/pages/pharmacies/PharmacyListPage'
import { AddPharmacyPage } from '@/pages/pharmacies/AddPharmacyPage'
import { PharmacyDetailPage } from '@/pages/pharmacies/PharmacyDetailPage'
import { ReportsPage } from '@/pages/analytics/ReportsPage'
import { StatisticsPage } from '@/pages/analytics/StatisticsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { CartPage } from '@/pages/cart/CartPage'
import { NeedPage } from '@/pages/need/NeedPage'

function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="purchase" element={<PurchasePage />} />
        <Route path="orders">
          <Route index element={<OrderHistoryPage />} />
          <Route path=":id" element={<OrderDetailPage />} />
        </Route>
        <Route path="catalog">
          <Route index element={<MedicineCatalogPage />} />
          <Route path="upload" element={<ExcelUploadPage />} />
          <Route path="pos" element={<PosListPage />} />
        </Route>
        <Route path="pharmacies">
          <Route index element={<PharmacyListPage />} />
          <Route path="add" element={<AddPharmacyPage />} />
          <Route path=":id" element={<PharmacyDetailPage />} />
        </Route>
        <Route path="analytics">
          <Route path="reports" element={<ReportsPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
        <Route path="cart" element={<CartPage />} />
        <Route path="need" element={<NeedPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
