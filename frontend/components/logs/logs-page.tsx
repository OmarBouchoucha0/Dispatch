"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { LogsTable } from "./logs-table"

export function LogsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <div className="flex flex-1 h-full min-h-0 flex-col p-4 overflow-hidden">
      <LogsTable />
    </div>
  )
}
