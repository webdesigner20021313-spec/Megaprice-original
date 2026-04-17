import { create } from 'zustand'

interface UIState {
  mobileSidebarOpen: boolean
  subPanelOpen: boolean
  language: 'uz' | 'ru' | 'en'
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
  setSubPanelOpen: (val: boolean) => void
  toggleSubPanel: () => void
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void
}

export const useUIStore = create<UIState>((set) => ({
  mobileSidebarOpen: false,
  subPanelOpen: false,
  language: 'ru',
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setSubPanelOpen: (val) => set({ subPanelOpen: val }),
  toggleSubPanel: () => set((s) => ({ subPanelOpen: !s.subPanelOpen })),
  setLanguage: (lang) => set({ language: lang }),
}))
