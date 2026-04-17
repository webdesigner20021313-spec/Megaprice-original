import { Plus } from 'lucide-react'

export function CreateOrderPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Plus className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Создать заказ</h1>
      <p className="mt-2 text-sm">Выбор лекарств и оформление — следующий этап</p>
    </div>
  )
}
