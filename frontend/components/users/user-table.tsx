"use client"

import { useEffect } from "react"
import { useUserStore } from "@/store/users-store"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export function UserTable() {
  const users = useUserStore((state) => state.users)
  const loading = useUserStore((state) => state.loading)
  const sync = useUserStore((state) => state.sync)

  useEffect(() => {
    sync()
  }, [sync])

  if (loading && users.length === 0) {
    return <div>Loading...</div>
  }

  return <DataTable columns={columns} data={users} />
}
