import { create } from "zustand"
import { API_URL } from "@/lib/api"
import { persist } from "zustand/middleware"

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
  createDevice: (name: string) => void
  pendingDeviceName: string | null
  setPendingDeviceName: (name: string | null) => void
}

export const useDeviceStore = create<DeviceStore>()(
  persist(
    (set) => ({
      devices: [],
      loading: false,
      error: null,

      sync: async () => {
        set({ loading: true, error: null })

        try {
          const res = await fetch(`${API_URL}/device`, {
            method: "GET",
            credentials: "include",
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

      createDevice: (name) =>
        set((state) => ({
          devices: [
            ...state.devices,
            {
              id: name,
              name,
              created_at: new Date().toISOString(),
            },
          ],
        })),

      pendingDeviceName: null,

      setPendingDeviceName: (name) =>
        set({ pendingDeviceName: name }),
    }),
    {
      name: "device-store",
    }
  )
)
