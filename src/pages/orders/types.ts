export type OrderStatus = 'sent' | 'completed'

export interface OrderStatusConfig {
  label: string
  bg: string
  text: string
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  sent:      { label: 'Отправлен', bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
  completed: { label: 'Завершён',  bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
}

export interface OrderItem {
  id: string
  medicineName: string
  manufacturer: string
  country: string
  quantity: number
  priceWithVat: number
}

/** Позиции одного оптовика внутри заказа */
export interface OrderDistributorGroup {
  distributorName: string
  distributorCity: string
  items: OrderItem[]
  subtotal: number
}

/**
 * Один заказ — один номер.
 * Внутри может быть один или несколько оптовиков (groups).
 */
export interface Order {
  id: string
  number: string               // ЗАК-XXXXX
  pharmacyName: string
  pharmacyAddress: string
  pharmacyCity: string
  groups: OrderDistributorGroup[]
  totalSum: number
  totalQty: number
  status: OrderStatus
  createdAt: string            // ISO string
}
