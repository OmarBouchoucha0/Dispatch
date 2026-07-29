"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useLogsStore } from "@/store/logs-store"
import { useEventsStore } from "@/store/events-store"

export function ConfigSync() {
  const syncConfigs = useConfigStore((state) => state.sync)
  const syncDevices = useDeviceStore((state) => state.sync)
  const syncLogs = useLogsStore((state) => state.sync)
  const syncEvents = useEventsStore((state) => state.sync)

  useEffect(() => {
    syncConfigs()
    syncDevices()
    syncLogs()
    syncEvents()
  }, [syncConfigs, syncDevices, syncLogs, syncEvents])

  return null
}
