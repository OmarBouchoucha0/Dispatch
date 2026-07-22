import { create } from "zustand"

type UiStore = {
  accountOpen: boolean
  settingsOpen: boolean
  sidebarCollapsed: boolean
  editorInstance: any | null
  setAccountOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setEditorInstance: (instance: any | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  accountOpen: false,
  settingsOpen: false,
  sidebarCollapsed: false,
  editorInstance: null,
  setAccountOpen: (open) => set({ accountOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setEditorInstance: (instance) => set({ editorInstance: instance }),
}))
