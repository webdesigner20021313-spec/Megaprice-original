import { TrendingUp } from 'lucide-react'

export function StatisticsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <TrendingUp className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Статистика</h1>
      <p className="mt-2 text-sm">Графики и аналитика — следующий этап</p>
    </div>
  )
}
