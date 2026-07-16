import { toast } from "sonner"
import { useConfigStore } from "@/store/config-store"
import { useEditorStore } from "@/store/editor-store"

export const API_URL = process.env.NEXT_PUBLIC_API_URL!

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

export async function commitConfig(): Promise<boolean> {
  const state = useConfigStore.getState()
  const files = useEditorStore.getState().files

  const activeConfig = state.openedConfigs.find(
    (config) => config.id === state.activeConfig
  )

  if (!activeConfig) {
    toast.error("No file selected")
    return false
  }

  const editorFile = files[activeConfig.id]

  if (!editorFile) {
    toast.error("No editor content found")
    return false
  }

  try {
    const res = await fetch(`${API_URL}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        device_id: activeConfig.deviceID,
        content: JSON.parse(editorFile.content),
      }),
    })

    if (!res.ok) {
      toast.error("Failed to save config")
      return false
    }

    toast.success("Config saved")
    return true
  } catch {
    toast.error("Invalid JSON or server error")
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
