import { BarChart3 } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <BarChart3 className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Дашборд</h1>
      <p className="mt-2 text-sm">Обзор метрик и статистика — следующий этап</p>
    </div>
  )
}
