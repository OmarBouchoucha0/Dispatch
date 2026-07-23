import { create } from "zustand"

type UiStore = {
  accountOpen: boolean
  settingsOpen: boolean
  commitDialogOpen: boolean
  sidebarCollapsed: boolean
  editorInstance: any | null
  setAccountOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setCommitDialogOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setEditorInstance: (instance: any | null) => void
}

export const useUiStore = create<UiStore>((set) => ({
  accountOpen: false,
  settingsOpen: false,
  commitDialogOpen: false,
  sidebarCollapsed: false,
  editorInstance: null,
  setAccountOpen: (open) => set({ accountOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setCommitDialogOpen: (open) => set({ commitDialogOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setEditorInstance: (instance) => set({ editorInstance: instance }),
}))
