"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useLogsStore } from "@/store/logs-store"
import { useEventsStore } from "@/store/events-store"
import { useCommitStore } from "@/store/commit-store"
import { useAuth } from "@/components/auth/auth-provider"

export function ConfigSync() {
  const syncConfigs = useConfigStore((state) => state.sync)
  const syncDevices = useDeviceStore((state) => state.sync)
  const syncLogs = useLogsStore((state) => state.sync)
  const syncEvents = useEventsStore((state) => state.sync)
  const configsLoading = useConfigStore((state) => state.loading)
  const devicesLoading = useDeviceStore((state) => state.loading)
  const { user } = useAuth()

  useEffect(() => {
    syncConfigs()
    syncDevices()
    if (user?.role === "admin") {
      syncLogs()
    }
    syncEvents()
  }, [syncConfigs, syncDevices, syncLogs, syncEvents, user?.role])

  useEffect(() => {
    if (!configsLoading && !devicesLoading) {
      useCommitStore.getState().snapshot()
    }
  }, [configsLoading, devicesLoading])

  return null
}
