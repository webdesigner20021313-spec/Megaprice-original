import { create } from 'zustand'
import { mockOrders } from '@/mocks/orders.mocks'
import type { Order } from '@/pages/orders/types'

interface OrdersState {
  orders: Order[]
  addOrder: (order: Order) => void
}

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [...mockOrders],
  addOrder: (order) =>
    set(state => ({ orders: [order, ...state.orders] })),
}))
