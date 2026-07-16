"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config-store"
import { useLogsStore } from "@/store/logs-store"

export function ConfigSync() {
  const syncConfigs = useConfigStore((state) => state.sync)
  const syncLogs = useLogsStore((state) => state.sync)

  useEffect(() => {
    syncConfigs()
    syncLogs()
  }, [])

  return null
}
