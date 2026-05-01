import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { UserList } from './components/UserList'
import { UserCreateModal } from './components/UserCreateModal'
import { RoleList } from './components/RoleList'
import type { User } from './types/users.types'

type Tab = 'users' | 'roles'

const TABS: { id: Tab; label: string }[] = [
  { id: 'users', label: 'Пользователи' },
  { id: 'roles', label: 'Роли'         },
]

export function UsersPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const initTab   = (location.state as { tab?: Tab } | null)?.tab ?? 'users'

  const [activeTab,   setActiveTab]   = useState<Tab>(initTab)
  const [userModal,   setUserModal]   = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  function handleCreateUser() {
    setEditingUser(null)
    setUserModal(true)
  }

  function handleEditUser(user: User) {
    setEditingUser(user)
    setUserModal(true)
  }

  function handleCloseUserModal() {
    setUserModal(false)
    setEditingUser(null)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">

      {/* ── Таббар + кнопка ── */}
      <div className="shrink-0 border-b border-gray-200 px-6 py-3 flex items-center gap-4">

        {/* Pill-style tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'rounded-md px-4 py-1.5 text-sm font-medium transition-all',
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Create button — right side */}
        <div className="ml-auto">
          {activeTab === 'users' ? (
            <button
              onClick={handleCreateUser}
              className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Добавить пользователя
            </button>
          ) : (
            <button
              onClick={() => navigate('/users/roles/create')}
              className="flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              <Plus className="h-4 w-4" />
              Создать роль
            </button>
          )}
        </div>
      </div>

      {/* ── Контент ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {activeTab === 'users' ? (
          <UserList onEditUser={handleEditUser} />
        ) : (
          <RoleList />
        )}
      </div>

      {/* ── Модалки ── */}
      <UserCreateModal
        open={userModal}
        onClose={handleCloseUserModal}
        editUser={editingUser}
      />
    </div>
  )
}
