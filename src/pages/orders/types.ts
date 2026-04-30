export type OrderStatus     = 'new' | 'partial' | 'sent' | 'completed' | 'cancelled'
export type GroupSendStatus = 'pending' | 'sent'

export interface OrderStatusConfig {
  label: string
  bg: string
  text: string
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, OrderStatusConfig> = {
  new:       { label: 'Новый',              bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]' },
  partial:   { label: 'Частично отправлен', bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  sent:      { label: 'Отправлен',          bg: 'bg-[#EDE9FE]', text: 'text-[#5B21B6]' },
  completed: { label: 'Завершён',           bg: 'bg-[#D1FAE5]', text: 'text-[#065F46]' },
  cancelled: { label: 'Отменён',            bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]' },
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
  distributorId: string
  distributorName: string
  distributorCity: string
  contactType: 'telegram' | 'email'
  contact: string            // @handle или email
  sendStatus: GroupSendStatus
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
