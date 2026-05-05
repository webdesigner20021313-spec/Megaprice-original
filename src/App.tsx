import { Routes, Route, Navigate } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import { PrivateRoute } from '@/components/shared/PrivateRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { PurchasePage } from '@/pages/purchase/PurchasePage'
import { OrderHistoryPage } from '@/pages/orders/OrderHistoryPage'
import { OrderDetailPage } from '@/pages/orders/OrderDetailPage'
import { CartPage } from '@/pages/cart/CartPage'
import { NeedPage } from '@/pages/need/NeedPage'
import { WholesalersPage } from '@/pages/wholesalers/WholesalersPage'
import { UsersPage } from '@/pages/users/UsersPage'
import { RoleCreatePage } from '@/pages/users/RoleCreatePage'
import { RoleEditPage } from '@/pages/users/RoleEditPage'

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        element={
          <PrivateRoute>
            <RootLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/purchase" replace />} />
        <Route path="purchase" element={<PurchasePage />} />
        <Route path="orders">
          <Route index element={<OrderHistoryPage />} />
          <Route path=":id" element={<OrderDetailPage />} />
        </Route>
        <Route path="cart" element={<CartPage />} />
        <Route path="need" element={<NeedPage />} />
        <Route path="wholesalers" element={<WholesalersPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/roles/create" element={<RoleCreatePage />} />
        <Route path="users/roles/:id/edit" element={<RoleEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
