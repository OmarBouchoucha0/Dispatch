import { create } from "zustand"
import { API_URL, apiFetch } from "@/lib/api"

export type Log = {
  user_name: string
  device_name: string
  action: "Created" | "Updated" | "Deleted"
  created_at: string
}

type LogsStore = {
  logs: Log[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
}

export const useLogsStore = create<LogsStore>((set) => ({
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
}))
