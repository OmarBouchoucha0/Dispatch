"use client"

import { useEffect } from "react"
import { API_URL } from "@/lib/api"
import { useRouter } from "next/navigation"

export function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch(
          `${API_URL}/user/me`,
          {
            credentials: "include",
          }
        )

        if (res.ok) {
          router.push("/files")
        }
      } catch {
        // no valid session, stay on login page
      }
    }

    checkUser()
  }, [router])

  return null
}
