"use client"
import { Button } from "@/components/ui/button"
import { Plus, Monitor } from "lucide-react"
import { useDeviceStore } from "@/store/device-store"

export function ExplorerHeader() {
  const setPendingDeviceName = useDeviceStore(
    (state) => state.setPendingDeviceName
  )

  return (
    <div className="flex flex-row items-center justify-between px-2 py-1">
      <h1 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Explorer
      </h1>
      <Button
        variant="ghost"
        className="px-2 gap-1"
        onClick={() => setPendingDeviceName("")}
      >
        <Plus className="h-4 w-4" />
        <Monitor className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
