"use client"

import { useEffect } from "react"
import { useDeviceStore } from "@/store/device-store"
import { DataTable } from "./data-table"
import { TableSkeleton } from "@/components/ui/skeleton"
import { columns } from "./columns"

export function DeviceTable() {
  const devices = useDeviceStore((state) => state.devices)
  const loading = useDeviceStore((state) => state.loading)
  const sync = useDeviceStore((state) => state.sync)

  useEffect(() => {
    sync()
  }, [sync])

  if (loading && devices.length === 0) {
    return <TableSkeleton />
  }

  return <DataTable columns={columns} data={devices} />
}
