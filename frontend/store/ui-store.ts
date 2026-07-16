import { create } from "zustand"

type UiStore = {
  accountOpen: boolean
  settingsOpen: boolean
  setAccountOpen: (open: boolean) => void
  setSettingsOpen: (open: boolean) => void
}

export const useUiStore = create<UiStore>((set) => ({
  accountOpen: false,
  settingsOpen: false,
  setAccountOpen: (open) => set({ accountOpen: open }),
  setSettingsOpen: (open) => set({ settingsOpen: open }),
}))
