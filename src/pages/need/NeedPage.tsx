import { TrendingUp } from 'lucide-react'

export function NeedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <TrendingUp className="mb-4 h-12 w-12" />
      <h1 className="text-2xl font-bold text-gray-900">Потребность</h1>
      <p className="mt-2 text-sm text-gray-500">
        Анализ продаж из POS-систем и расчёт потребности в закупке — следующий этап
      </p>
    </div>
  )
}
