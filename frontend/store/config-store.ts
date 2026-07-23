import { create } from "zustand"
import { API_URL } from "@/lib/api"
import { useEditorStore } from "@/store/editor-store"
import { useCommitStore } from "@/store/commit-store"
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
  renameConfigsByDevice: (deviceID: string, newDeviceName: string) => void
  deleteConfig: (id: string) => void
  deleteConfigsByDevice: (deviceID: string) => void
  createConfig: (deviceID: string, deviceName: string, name: string) => void
  setSelectedConfig: (config: Config | null) => void
  setActiveConfig: (id: string) => void
  pendingCreateFileDeviceID: string | null
  setPendingCreateFileDeviceID: (id: string | null) => void
  lastActiveDeviceID: string | null
  setLastActiveDeviceID: (id: string | null) => void

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

            for (const config of configs) {
              if (state.openedConfigs.some((c) => c.id === config.id)) {
                useEditorStore.getState().openFile(config.id, config.content)
              }
            }

            return {
              configs,
              openedConfigs: remaining,
              activeConfig: state.activeConfig &&
                newIds.has(state.activeConfig)
                  ? state.activeConfig
                  : (remaining[0]?.id ?? null),
            }
          })

          useCommitStore.getState().snapshot()
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
          lastActiveDeviceID: config.deviceID,
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
      renameConfigsByDevice: (deviceID, newDeviceName) =>
        set((state) => ({
          configs: state.configs.map((c) =>
            c.deviceID === deviceID
              ? { ...c, deviceName: newDeviceName }
              : c
          ),
          openedConfigs: state.openedConfigs.map((c) =>
            c.deviceID === deviceID
              ? { ...c, deviceName: newDeviceName }
              : c
          ),
        })),
      deleteConfig: (id) => {
        useCommitStore.getState().markDeleted(id)
        useEditorStore.getState().closeFile(id)

        set((state) => {
          const newOpenedConfigs = state.openedConfigs.filter(
            (c) => c.id !== id
          )

          let newActiveConfig = state.activeConfig
          if (state.activeConfig === id) {
            const index = state.openedConfigs.findIndex(
              (c) => c.id === id
            )
            const next =
              newOpenedConfigs[index] ??
              newOpenedConfigs[index - 1] ??
              null
            newActiveConfig = next?.id ?? null
          }

          return {
            configs: state.configs.filter((c) => c.id !== id),
            openedConfigs: newOpenedConfigs,
            activeConfig: newActiveConfig,
          }
        })
      },
      deleteConfigsByDevice: (deviceID) => {
        const toDelete = useConfigStore
          .getState()
          .configs.filter((c) => c.deviceID === deviceID)
        toDelete.forEach((c) => {
          useCommitStore.getState().markDeleted(c.id)
          useEditorStore.getState().closeFile(c.id)
        })

        set((state) => {
          const deletedIds = new Set(toDelete.map((c) => c.id))
          const newOpenedConfigs = state.openedConfigs.filter(
            (c) => !deletedIds.has(c.id)
          )

          let newActiveConfig = state.activeConfig
          if (
            state.activeConfig &&
            deletedIds.has(state.activeConfig)
          ) {
            newActiveConfig = newOpenedConfigs[0]?.id ?? null
          }

          return {
            configs: state.configs.filter(
              (c) => c.deviceID !== deviceID
            ),
            openedConfigs: newOpenedConfigs,
            activeConfig: newActiveConfig,
          }
        })
      },
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

      pendingCreateFileDeviceID: null,

      setPendingCreateFileDeviceID: (id) =>
        set({ pendingCreateFileDeviceID: id }),

      lastActiveDeviceID: null,

      setLastActiveDeviceID: (id) =>
        set({ lastActiveDeviceID: id }),

      clear: () =>
        set({
          configs: [],
          selectedConfig: null,
          openedConfigs: [],
          activeConfig: null,
          pendingCreateFileDeviceID: null,
          lastActiveDeviceID: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "config-store",
    }
  )
)
