"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { API_URL } from "@/lib/api"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch(
          `${API_URL}/user/me`,
          {
            credentials: "include",
          }
        )

        if (!res.ok) {
          setUser(null)
          return
        }

        const data = await res.json()
        setUser(data)

      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
