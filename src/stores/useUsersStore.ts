import { create } from 'zustand'
import type { User, Role, ModuleId, ModulePermission } from '@/pages/users/types/users.types'
import { mockUsers, mockRoles } from '@/mocks/users.mocks'

interface UsersState {
  users: User[]
  roles: Role[]
  addUser:    (data: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (id: string, data: Partial<Omit<User, 'id' | 'createdAt'>>) => void
  deleteUser: (id: string) => void
  addRole:    (data: Omit<Role, 'id'>) => void
  updateRole: (id: string, data: { name: string; permissions: Partial<Record<ModuleId, ModulePermission>> }) => void
  deleteRole: (id: string) => void
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export const useUsersStore = create<UsersState>((set) => ({
  users: mockUsers,
  roles: mockRoles,

  addUser: (data) =>
    set((s) => ({
      users: [...s.users, { ...data, id: genId('u'), createdAt: new Date().toISOString() }],
    })),

  updateUser: (id, data) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),

  deleteUser: (id) =>
    set((s) => ({ users: s.users.filter((u) => u.id !== id) })),

  addRole: (data) =>
    set((s) => ({ roles: [...s.roles, { ...data, id: genId('role') }] })),

  updateRole: (id, data) =>
    set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...data } : r)) })),

  deleteRole: (id) =>
    set((s) => ({
      roles: s.roles.filter((r) => r.id !== id),
      users: s.users.map((u) => (u.roleId === id ? { ...u, roleId: null } : u)),
    })),
}))
