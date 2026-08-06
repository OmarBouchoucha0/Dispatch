import { toast } from "sonner"
import { useConfigStore } from "@/store/config-store"
import { useEditorStore } from "@/store/editor-store"
import { useCommitStore } from "@/store/commit-store"
import { useUiStore } from "@/store/ui-store"
import { useUserStore } from "@/store/users-store"
import { useDeviceStore } from "@/store/device-store"
import { usePreferencesStore } from "@/store/preferences-store"


export const API_URL = process.env.NEXT_PUBLIC_API_URL!

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined")
}

export function apiFetch(url: string, opts?: RequestInit): Promise<Response> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return fetch(url, {
    ...opts,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Timezone": timezone,
      ...opts?.headers,
    },
  })
}

export async function scheduleEvent(
  name: string,
  scheduledAt: string | undefined,
  configsAfter: {
    device_id: string
    device_name?: string
    name: string
    content: unknown
  }[],
  devicesAfter: { id: string; name: string }[]
): Promise<boolean> {
  try {
    const body: Record<string, unknown> = {
      name,
      configs_after: configsAfter,
      devices_after: devicesAfter,
    }
    if (scheduledAt) {
      body.scheduled_at = scheduledAt
    }
    const res = await apiFetch(`${API_URL}/event`, {
      method: "POST",
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      toast.error(text || "Failed to schedule event")
      return false
    }

    return true
  } catch {
    toast.error("Server error")
    return false
  }
}

export async function cancelEvent(eventId: string): Promise<boolean> {
  try {
    const res = await apiFetch(`${API_URL}/event/${eventId}/cancel`, {
      method: "PUT",
    })

    if (!res.ok) {
      toast.error("Failed to cancel event")
      return false
    }

    return true
  } catch {
    toast.error("Server error")
    return false
  }
}

export async function logout(): Promise<void> {
  try {
    const res = await apiFetch(`${API_URL}/user/logout`, {
      method: "GET",
    })

    if (!res.ok) {
      toast.error("Logout failed")
      return
    }

    useConfigStore.getState().clear()
    useEditorStore.getState().clear()
    useCommitStore.getState().clear()
    useUiStore.getState().clear()
    useUserStore.getState().clear()
    useDeviceStore.getState().clear()
    usePreferencesStore.getState().clear()
  } catch {
    toast.error("Server error")
  }
}
