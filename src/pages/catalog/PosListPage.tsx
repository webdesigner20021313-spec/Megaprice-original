import { Monitor } from 'lucide-react'

export function PosListPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Monitor className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Список из POS</h1>
      <p className="mt-2 text-sm">Синхронизированные лекарства — следующий этап</p>
    </div>
  )
}
