"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { API_URL } from "@/lib/api"

type User = {
  firstName: string
  lastName: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => { },
})

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function checkAuth() {
    setLoading(true)
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refresh: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
