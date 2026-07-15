import { create } from "zustand"

type EditorFile = {
  id: string
  content: string
  modified: boolean
}

type EditorStore = {
  files: Record<string, EditorFile>

  openFile: (id: string, content: object) => void
  updateFile: (id: string, content: string) => void
  closeFile: (id: string) => void

  getFile: (id: string) => EditorFile | undefined
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  files: {},


  openFile: (id, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [id]: {
          id,
          content: JSON.stringify(content, null, 2),
          modified: false,
        },
      },
    })),


  updateFile: (id, content) =>
    set((state) => ({
      files: {
        ...state.files,
        [id]: {
          ...state.files[id],
          content,
          modified: true,
        },
      },
    })),


  closeFile: (id) =>
    set((state) => {
      const files = { ...state.files }

      delete files[id]

      return {
        files,
      }
    }),


  getFile: (id) =>
    get().files[id],
}))
