"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useLogsStore } from "@/store/logs-store"

export function ConfigSync() {
  const syncConfigs = useConfigStore((state) => state.sync)
  const syncDevices = useDeviceStore((state) => state.sync)
  const syncLogs = useLogsStore((state) => state.sync)

  useEffect(() => {
    syncConfigs()
    syncDevices()
    syncLogs()
  }, [])

  return null
}
