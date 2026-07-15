"use client"

import { useEffect } from "react"
import { useConfigStore } from "@/store/config-store"

export function ConfigSync() {
  const sync = useConfigStore((state) => state.sync)

  useEffect(() => {
    sync()
  }, [])

  return null
}
