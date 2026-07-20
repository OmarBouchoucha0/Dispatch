"use client"

import { useEffect } from "react"
import { API_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

export function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const res = await fetch(`${API_URL}/user/me`, {
        credentials: "include",
      })

      if (res.ok) {
        router.push("/files")
        return
      }

      if (res.status === 401) {
        return
      }
      console.error("Unexpected error:", res.status)
    }

    checkUser()
  }, [router])
  return null
}
