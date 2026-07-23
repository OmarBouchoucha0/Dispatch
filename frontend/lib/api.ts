import { toast } from "sonner"
import { useConfigStore } from "@/store/config-store"
import { useEditorStore } from "@/store/editor-store"
import { useCommitStore } from "@/store/commit-store"

export const API_URL = process.env.NEXT_PUBLIC_API_URL!

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

export async function commitChanges(): Promise<boolean> {
  const { changedFiles, deletedFiles, snapshots } = useCommitStore.getState()
  const configs = useConfigStore.getState().configs

  const changedEntries = Object.entries(changedFiles)
  const deletedEntries = Object.entries(deletedFiles)

  if (changedEntries.length === 0 && deletedEntries.length === 0) {
    toast.error("No changes to commit")
    return false
  }

  const changed = changedEntries.map(([id, content]) => {
    const config = configs.find((c) => c.id === id)
    if (!config) return null
    return {
      device_id: config.deviceID,
      name: config.name,
      content: JSON.parse(content),
    }
  })

  if (changed.some((c) => c === null)) {
    toast.error("Some changed configs not found")
    return false
  }

  const deleted = deletedEntries.map(([id]) => id)

  try {
    const res = await fetch(`${API_URL}/config/commit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ changed, deleted }),
    })

    if (!res.ok) {
      toast.error("Commit failed")
      return false
    }

    const newSnapshots = { ...snapshots }
    for (const [id, content] of changedEntries) {
      newSnapshots[id] = content
    }
    for (const [id] of deletedEntries) {
      delete newSnapshots[id]
    }

    useCommitStore.setState({
      snapshots: newSnapshots,
      changedFiles: {},
      deletedFiles: {},
    })

    toast.success("Committed successfully")
    return true
  } catch {
    toast.error("Server error during commit")
    return false
  }
}

export async function logout(): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/user/logout`, {
      method: "GET",
      credentials: "include",
    })

    if (!res.ok) {
      toast.error("Logout failed")
      return
    }

    useConfigStore.getState().clear()
    useEditorStore.getState().clear()
  } catch {
    toast.error("Server error")
  }
}
