import { create } from "zustand"
import { API_URL } from "@/lib/api"

export type Log = {
  UserName: string
  DeviceName: string
  Action: "Created" | "Updated" | "Deleted"
  CreatedAt: string
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
      const res = await fetch(`${API_URL}/logs`, {
        method: "GET",
        credentials: "include",
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
