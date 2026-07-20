import { create } from "zustand"
import { API_URL } from "@/lib/api"
import { useEditorStore } from "@/store/editor-store"
import { persist } from "zustand/middleware"

export type Config = {
  id: string
  deviceID: string
  deviceName: string
  name: string
  content: object | null
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
  renameConfig: (id: string, name: string) => void
  deleteConfig: (id: string) => void
  createConfig: (deviceID: string, deviceName: string, name: string) => void
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

          set((state) => {
            const newIds = new Set(configs.map((c) => c.id))
            const remaining = state.openedConfigs.filter((c) =>
              newIds.has(c.id)
            )
            const removed = state.openedConfigs.filter(
              (c) => !newIds.has(c.id)
            )
            removed.forEach((c) =>
              useEditorStore.getState().closeFile(c.id)
            )

            return {
              configs,
              openedConfigs: remaining,
              activeConfig: state.activeConfig &&
                newIds.has(state.activeConfig)
                  ? state.activeConfig
                  : (remaining[0]?.id ?? null),
            }
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
      renameConfig: (id, name) =>
        set((state) => ({
          configs: state.configs.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
          openedConfigs: state.openedConfigs.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),
      deleteConfig: (id) =>
        set((state) => {
          useEditorStore.getState().closeFile(id)

          return {
            configs: state.configs.filter((c) => c.id !== id),
            openedConfigs: state.openedConfigs.filter(
              (c) => c.id !== id
            ),
            activeConfig:
              state.activeConfig === id ? null : state.activeConfig,
          }
        }),
      createConfig: (deviceID, deviceName, name) => {
        const state = useConfigStore.getState()
        const existingNames = state.configs
          .filter((c) => c.deviceID === deviceID)
          .map((c) => c.name)

        let finalName = name
        let counter = 2
        while (existingNames.includes(finalName)) {
          finalName = `${name}${counter}`
          counter++
        }

        const newConfig: Config = {
          id: finalName,
          deviceID,
          deviceName,
          name: finalName,
          content: null,
        }

        set((state) => ({
          configs: [...state.configs, newConfig],
        }))

        useConfigStore.getState().openConfig(newConfig)
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
