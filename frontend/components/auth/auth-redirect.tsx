"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user/me`,
          {
            credentials: "include",
          }
        )

        if (res.ok) {
          router.push("/files")
        }
      } catch (err) {
        // no valid session, stay on login page
      }
    }

    checkUser()
  }, [router])

  return null
}
