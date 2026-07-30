import { create } from "zustand"
import { API_URL, apiFetch } from "@/lib/api"

export type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: string
}

type UsersStore = {
  users: User[]
  loading: boolean
  error: string | null
  sync: () => Promise<void>
  updateUser: (id: string, fields: { first_name?: string; last_name?: string; email?: string; created_at?: string }) => Promise<void>
  deleteUser: (id: string) => Promise<void>
  clear: () => void
}

export const useUserStore = create<UsersStore>((set, get) => ({
  users: [],
  loading: false,
  error: null,

  sync: async () => {
    set({ loading: true, error: null })

    try {
      const res = await apiFetch(`${API_URL}/user`, {
        method: "GET",
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

  updateUser: async (id, fields) => {
    await apiFetch(`${API_URL}/user/${id}`, {
      method: "PUT",
      body: JSON.stringify(fields),
    })
    await get().sync()
  },

  deleteUser: async (id) => {
    await apiFetch(`${API_URL}/user/${id}`, {
      method: "DELETE",
    })
    await get().sync()
  },

  clear: () => set({ users: [], loading: false, error: null }),
}))
