import { create } from "zustand"
import { persist } from "zustand/middleware"

type PreferencesStore = {
  editorFont: string
  editorFontSize: number
  baseEditorFontSize: number
  setEditorFont: (font: string) => void
  setEditorFontSize: (size: number) => void
  setBaseEditorFontSize: (size: number) => void
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      editorFont: "JetBrains Mono",
      editorFontSize: 18,
      baseEditorFontSize: 18,
      setEditorFont: (font) => set({ editorFont: font }),
      setEditorFontSize: (size) => set({ editorFontSize: size }),
      setBaseEditorFontSize: (size) => set({ baseEditorFontSize: size }),
    }),
    {
      name: "preferences-store",
    }
  )
)
