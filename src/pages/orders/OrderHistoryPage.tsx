import { History } from 'lucide-react'

export function OrderHistoryPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <History className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">История заказов</h1>
      <p className="mt-2 text-sm">Таблица заказов с фильтрами — следующий этап</p>
    </div>
  )
}
