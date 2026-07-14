"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { DataTable } from "./data-table"
import { columns, Config } from "./columns"

export function LogsTable() {
  const [data, setData] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getLogs() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/logs`,
          {
            method: "GET",
            credentials: "include",
          }
        )

        if (!res.ok) {
          toast.error("Couldn't get logs")
          return
        }

        const logs = await res.json()
        setData(logs)

      } catch {
        toast.error("Server error")
      } finally {
        setLoading(false)
      }
    }

    getLogs()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return <DataTable columns={columns} data={data} />
}
