import { useParams } from 'react-router-dom'
import { FileText } from 'lucide-react'

export function OrderDetailPage() {
  const { id } = useParams()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <FileText className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Заказ {id}</h1>
      <p className="mt-2 text-sm">Детали заказа — следующий этап</p>
    </div>
  )
}
