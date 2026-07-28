"use client"

import { useEffect } from "react"
import { useLogsStore } from "@/store/logs-store"
import { DataTable } from "./data-table"
import { LoadingFallback } from "@/components/ui/skeleton"
import { columns } from "./columns"

export function LogsTable() {
  const logs = useLogsStore((state) => state.logs)
  const loading = useLogsStore((state) => state.loading)
  const sync = useLogsStore((state) => state.sync)

  useEffect(() => {
    sync()
  }, [sync])

  if (loading && logs.length === 0) {
    return <LoadingFallback />
  }

  return <DataTable columns={columns} data={logs} />
}
