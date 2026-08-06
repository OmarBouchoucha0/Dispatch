import { create } from "zustand"
import { API_URL, apiFetch } from "@/lib/api"

export type ConfigSnapshotItem = {
  device_id: string
  device_name?: string
  name: string
  content: Record<string, unknown>
}

export type DeviceSnapshotItem = {
  id: string
  name: string
}

export type ScheduleEvent = {
  id: string
  title: string
  scheduledAt: string
  status: "pending" | "deployed" | "cancelled"
  createdAt: string
  configsBefore: ConfigSnapshotItem[]
  configsAfter: ConfigSnapshotItem[]
  devicesBefore: DeviceSnapshotItem[]
  devicesAfter: DeviceSnapshotItem[]
}

type BackendEvent = {
  id: string
  name: string
  configs_before: ConfigSnapshotItem[] | null
  configs_after: ConfigSnapshotItem[]
  devices_before: DeviceSnapshotItem[] | null
  devices_after: DeviceSnapshotItem[] | null
  scheduled_at: string
  status: "pending" | "deployed" | "cancelled"
  created_at: string
}

type EventsStore = {
  events: ScheduleEvent[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
}

export const useEventsStore = create<EventsStore>((set) => ({
  events: [],
  loading: false,
  error: null,

  sync: async () => {
    set({ loading: true, error: null })

    try {
      const res = await apiFetch(`${API_URL}/event`, {
        method: "GET",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch events")
      }

      const data: BackendEvent[] = await res.json()
      const events = data.map((e) => ({
        id: e.id,
        title: e.name,
        scheduledAt: e.scheduled_at,
        status: e.status,
        createdAt: e.created_at,
        configsBefore: e.configs_before ?? [],
        configsAfter: e.configs_after,
        devicesBefore: e.devices_before ?? [],
        devicesAfter: e.devices_after ?? [],
      }))

      set({ events })
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      set({ loading: false })
    }
  },
}))
