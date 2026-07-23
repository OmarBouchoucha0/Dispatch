import { create } from "zustand"
import { useConfigStore } from "./config-store"
import { useEditorStore } from "./editor-store"

export type DeletedFileInfo = {
  id: string
  name: string
  deviceID: string
  deviceName: string
  content: string
}

type CommitStore = {
  snapshots: Record<string, string>
  changedFiles: Record<string, string>
  deletedFiles: Record<string, DeletedFileInfo>

  snapshot: () => void
  markChanged: (id: string, content: string) => void
  markDeleted: (id: string) => void
  unmarkDeleted: (id: string) => void
  computeChanged: () => void
  clear: () => void
}

export const useCommitStore = create<CommitStore>((set, get) => ({
  snapshots: {},
  changedFiles: {},
  deletedFiles: {},

  snapshot: () => {
    const configs = useConfigStore.getState().configs
    const snapshots: Record<string, string> = {}
    for (const config of configs) {
      snapshots[config.id] =
        config.content === null ? "" : JSON.stringify(config.content, null, 2)
    }
    set({ snapshots })
    get().computeChanged()
  },

  markChanged: (id, content) => {
    set((state) => ({
      changedFiles: { ...state.changedFiles, [id]: content },
    }))
  },

  markDeleted: (id) => {
    const state = get()
    const config = useConfigStore.getState().configs.find((c) => c.id === id)
    if (!config) return

    if (!(id in state.snapshots)) {
      set((state) => {
        const { [id]: _, ...rest } = state.changedFiles
        return { changedFiles: rest }
      })
      return
    }

    const content = state.snapshots[id]
    set((state) => {
      const { [id]: _, ...rest } = state.changedFiles
      return {
        deletedFiles: {
          ...state.deletedFiles,
          [id]: {
            id: config.id,
            name: config.name,
            deviceID: config.deviceID,
            deviceName: config.deviceName,
            content,
          },
        },
        changedFiles: rest,
      }
    })
  },

  unmarkDeleted: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.deletedFiles
      return { deletedFiles: rest }
    })
  },

  computeChanged: () => {
    const snapshots = get().snapshots
    const editorFiles = useEditorStore.getState().files
    const changedFiles: Record<string, string> = {}

    for (const [id, snapshotContent] of Object.entries(snapshots)) {
      const editorFile = editorFiles[id]
      if (editorFile && editorFile.content !== snapshotContent) {
        changedFiles[id] = editorFile.content
      }
    }

    for (const id of Object.keys(editorFiles)) {
      if (!(id in snapshots)) {
        changedFiles[id] = editorFiles[id].content
      }
    }

    set({ changedFiles })
  },

  clear: () => {
    set({ snapshots: {}, changedFiles: {}, deletedFiles: {} })
  },
}))
