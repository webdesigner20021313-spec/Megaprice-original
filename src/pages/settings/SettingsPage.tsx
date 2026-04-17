import { Settings } from 'lucide-react'

export function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <Settings className="mb-4 h-12 w-12" />
      <h1 className="font-lexend text-2xl font-semibold text-gray-900">Настройки</h1>
      <p className="mt-2 text-sm">Профиль и настройки — следующий этап</p>
    </div>
  )
}
