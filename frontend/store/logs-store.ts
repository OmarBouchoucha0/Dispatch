import { create } from "zustand"
import { API_URL, apiFetch } from "@/lib/api"

export type Log = {
  id: string
  user_name: string
  device_name: string
  action: string
  created_at: string
}

type LogsStore = {
  logs: Log[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
  updateLog: (id: string, fields: { user_id?: string; device_id?: string; action?: string; created_at?: string }) => Promise<void>
  deleteLog: (id: string) => Promise<void>
}

export const useLogsStore = create<LogsStore>((set, get) => ({
  logs: [],
  loading: false,
  error: null,

  sync: async () => {
    set({ loading: true, error: null })

    try {
      const res = await apiFetch(`${API_URL}/logs`, {
        method: "GET",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch logs")
      }

      const logs: Log[] = await res.json()
      set({ logs: logs ?? [] })
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      set({ loading: false })
    }
  },

  updateLog: async (id, fields) => {
    await apiFetch(`${API_URL}/logs/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    })
    await get().sync()
  },

  deleteLog: async (id) => {
    await apiFetch(`${API_URL}/logs/${id}`, {
      method: "DELETE",
    })
    await get().sync()
  },
}))
