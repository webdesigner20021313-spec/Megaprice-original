import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useUsersStore } from '@/stores/useUsersStore'
import { MODULE_LIST, MODULES_CONFIG } from '../types/users.types'
import { ConfirmDeleteModal } from './ConfirmDeleteModal'
import type { Role } from '../types/users.types'

// Уникальные права которые включены в роли (объединение по всем модулям)
function getActivePermLabels(role: Role): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const m of MODULES_CONFIG) {
    const perm = role.permissions[m.id]
    if (!perm?.access) continue
    for (const p of m.permissions) {
      if (perm.permissions[p.id] && !seen.has(p.id)) {
        seen.add(p.id)
        result.push(p.label)
      }
    }
  }
  return result
}

export function RoleList() {
  const navigate = useNavigate()
  const { roles, users, deleteRole } = useUsersStore()
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  const getActiveModules = (role: Role) =>
    MODULE_LIST.filter((m) => role.permissions[m.id]?.access)

  const getUserCount = (roleId: string) =>
    users.filter((u) => u.roleId === roleId).length

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="w-10 px-4 py-3 text-center text-xs font-semibold text-gray-400">#</th>
              <th className="px-4 py-3 text-left   text-xs font-semibold text-gray-500">Название</th>
              <th className="px-4 py-3 text-left   text-xs font-semibold text-gray-500">Модули</th>
              <th className="px-4 py-3 text-left   text-xs font-semibold text-gray-500">Права</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Пользователей</th>
              <th className="w-20 px-4 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {roles.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-sm text-gray-400">
                  Ролей пока нет
                </td>
              </tr>
            ) : (
              roles.map((role, idx) => {
                const modules    = getActiveModules(role)
                const permLabels = getActivePermLabels(role)
                return (
                  <tr key={role.id} className="bg-white transition-colors hover:bg-gray-50">

                    {/* # */}
                    <td className="px-4 py-3 text-center text-xs text-gray-400">{idx + 1}</td>

                    {/* Название — без иконки */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">{role.name}</span>
                    </td>

                    {/* Модули */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {modules.length > 0 ? (
                          modules.map((m) => (
                            <span
                              key={m.id}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                            >
                              {m.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Нет доступа</span>
                        )}
                      </div>
                    </td>

                    {/* Права */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {permLabels.length > 0 ? (
                          permLabels.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
                            >
                              {label}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>

                    {/* Пользователей */}
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {getUserCount(role.id)}
                    </td>

                    {/* Действия */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/users/roles/${role.id}/edit`)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(role)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        title="Удалить роль?"
        description={deleteTarget ? `Роль «${deleteTarget.name}» будет удалена. Пользователи с этой ролью останутся без роли.` : ''}
        onConfirm={() => { deleteRole(deleteTarget!.id); setDeleteTarget(null) }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
