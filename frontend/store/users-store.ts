import { create } from "zustand"
import { API_URL } from "@/lib/api"

export type User = {
  FirstName: string
  LastName: string
  Email: string
  CreatedAt: string
}

type UsersStore = {
  users: User[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
}

export const useUserStore = create<UsersStore>((set) => ({
  users: [],
  loading: false,
  error: null,

  sync: async () => {
    set({ loading: true, error: null })

    try {
      const res = await fetch(`${API_URL}/user`, {
        method: "GET",
        credentials: "include",
      })

      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }

      const users: User[] = await res.json()
      set({ users: users ?? [] })
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Unknown error",
      })
    } finally {
      set({ loading: false })
    }
  },
}))
