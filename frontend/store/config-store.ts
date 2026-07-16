import { create } from "zustand"
import { API_URL } from "@/lib/api"
import { useEditorStore } from "@/store/editor-store"
import { persist } from "zustand/middleware"

export type Config = {
  id: string
  deviceID: string
  deviceName: string
  name: string
  content: object
}

type ConfigStore = {
  configs: Config[]

  selectedConfig: Config | null
  openedConfigs: Config[]
  activeConfig: string | null
  closeConfig: (id: string) => void

  loading: boolean
  error: string | null

  sync: () => Promise<void>

  openConfig: (config: Config) => void
  setSelectedConfig: (config: Config | null) => void
  setActiveConfig: (id: string) => void

  clear: () => void
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      configs: [],
      selectedConfig: null,

      openedConfigs: [],
      activeConfig: null,
      closeConfig: (id) =>
        set((state) => {
          const newOpenedConfigs = state.openedConfigs.filter(
            (config) => config.id !== id
          )

          let newActiveConfig = state.activeConfig

          if (state.activeConfig === id) {
            const index = state.openedConfigs.findIndex(
              (config) => config.id === id
            )

            const nextConfig =
              newOpenedConfigs[index] ??
              newOpenedConfigs[index - 1] ??
              null

            newActiveConfig = nextConfig?.id ?? null
          }

          return {
            openedConfigs: newOpenedConfigs,
            activeConfig: newActiveConfig,
          }
        }),

      loading: false,
      error: null,

      sync: async () => {
        set({
          loading: true,
          error: null,
        })

        try {
          const res = await fetch(
            `${API_URL}/config`,
            {
              credentials: "include",
            }
          )

          if (!res.ok) {
            throw new Error("Failed to fetch configs")
          }

          const configs: Config[] = await res.json()

          set({
            configs,
          })
        } catch (err) {
          set({
            error:
              err instanceof Error
                ? err.message
                : "Unknown error",
          })
        } finally {
          set({
            loading: false,
          })
        }
      },

      openConfig: (config) => {
        const editorFile = useEditorStore
          .getState()
          .files[config.id]

        if (!editorFile) {
          useEditorStore
            .getState()
            .openFile(
              config.id,
              config.content
            )
        }

        set((state) => ({
          openedConfigs: state.openedConfigs.some(
            (c) => c.id === config.id
          )
            ? state.openedConfigs
            : [...state.openedConfigs, config],

          activeConfig: config.id,
        }))
      },
      setActiveConfig: (id) =>
        set({
          activeConfig: id,
        }),

      setSelectedConfig: (config) =>
        set({
          selectedConfig: config,
        }),

      clear: () =>
        set({
          configs: [],
          selectedConfig: null,
          openedConfigs: [],
          activeConfig: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "config-store",
    }
  )
)
