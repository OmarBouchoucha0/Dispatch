import { create } from "zustand"
import { API_URL, apiFetch } from "@/lib/api"

export type Device = {
  id: string
  name: string
  created_at: string
}

type DeviceStore = {
  devices: Device[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
  createDevice: (name: string) => Promise<void>
  renameDevice: (id: string, name: string) => void
  updateDevice: (id: string, fields: { name?: string; created_at?: string }) => Promise<void>
  deleteDevice: (id: string) => Promise<void>
  pendingDeviceName: string | null
  setPendingDeviceName: (name: string | null) => void
  clear: () => void
}

export const useDeviceStore = create<DeviceStore>()(
  (set, get) => ({
    devices: [],
    loading: false,
    error: null,

    sync: async () => {
      set({ loading: true, error: null })

      try {
        const res = await apiFetch(`${API_URL}/device`, {
          method: "GET",
        })

        if (!res.ok) {
          throw new Error("Failed to fetch device")
        }

        const devices: Device[] = await res.json()
        set({ devices: devices ?? [] })
      } catch (err) {
        set({
          error:
            err instanceof Error ? err.message : "Unknown error",
        })
      } finally {
        set({ loading: false })
      }
    },

    createDevice: async (name) => {
      const state = useDeviceStore.getState()
      const existingNames = new Set(state.devices.map((d) => d.name))
      let finalName = name
      let counter = 2
      while (existingNames.has(finalName)) {
        finalName = `${name} (${counter})`
        counter++
      }

      const res = await apiFetch(`${API_URL}/device`, {
        method: "POST",
        body: JSON.stringify({ device_name: finalName }),
      })
      if (!res.ok) throw new Error("Failed to create device")
      const device: Device = await res.json()
      set((state) => ({
        devices: [...state.devices, device],
      }))
    },

  renameDevice: (id, name) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.id === id ? { ...d, name } : d
      ),
    })),

  updateDevice: async (id, fields) => {
    await apiFetch(`${API_URL}/device/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    })
    await get().sync()
  },

  deleteDevice: async (id) => {
    await apiFetch(`${API_URL}/device/${id}`, {
      method: "DELETE",
    })
    await get().sync()
  },

    pendingDeviceName: null,

    setPendingDeviceName: (name) =>
      set({ pendingDeviceName: name }),

    clear: () => set({ devices: [], loading: false, error: null, pendingDeviceName: null }),
  })
)
