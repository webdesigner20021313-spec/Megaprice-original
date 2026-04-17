import { Upload } from 'lucide-react'

export function ExcelUploadPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Upload className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Загрузить Excel</h1>
      <p className="mt-2 text-sm">Загрузка и парсинг Excel — следующий этап</p>
    </div>
  )
}
