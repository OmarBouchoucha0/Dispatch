import { create } from "zustand"
import type monaco from "monaco-editor"

type UiStore = {
  accountOpen: boolean
  settingsOpen: boolean
  commitDialogOpen: boolean
  commandPaletteOpen: boolean
  sidebarCollapsed: boolean
  creatingFolderID: string | null
  editorInstance: monaco.editor.IStandaloneCodeEditor | null
  calendarView: string
  calendarDate: string
  setAccountOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
  setCommitDialogOpen: (open: boolean) => void
  setCommandPaletteOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setCreatingFolderID: (id: string | null) => void
  setEditorInstance: (instance: monaco.editor.IStandaloneCodeEditor | null) => void
  setCalendarView: (view: string) => void
  setCalendarDate: (date: string) => void
  clear: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  accountOpen: false,
  settingsOpen: false,
  commitDialogOpen: false,
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  creatingFolderID: null,
  editorInstance: null,
  calendarView: "timeGridWeek",
  calendarDate: new Date().toISOString().slice(0, 10),
  setAccountOpen: (open) => set({ accountOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setCommitDialogOpen: (open) => set({ commitDialogOpen: open }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCreatingFolderID: (id) => set({ creatingFolderID: id }),
  setEditorInstance: (instance) => set({ editorInstance: instance }),
  setCalendarView: (view) => set({ calendarView: view }),
  setCalendarDate: (date) => set({ calendarDate: date }),
  clear: () => set({
    accountOpen: false,
    settingsOpen: false,
    commitDialogOpen: false,
    commandPaletteOpen: false,
    sidebarCollapsed: false,
    creatingFolderID: null,
    editorInstance: null,
    calendarView: "timeGridWeek",
    calendarDate: new Date().toISOString().slice(0, 10),
  }),
}))
