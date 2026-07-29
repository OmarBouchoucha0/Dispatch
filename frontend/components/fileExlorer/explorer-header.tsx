"use client"
import { Button } from "@/components/ui/button"
import { Plus, Monitor, RefreshCw } from "lucide-react"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

export function ExplorerHeader() {
  const sync = useConfigStore((state) => state.sync)
  const syncLoading = useConfigStore((state) => state.loading)
  const syncDevices = useDeviceStore((state) => state.sync)
  const setPendingDeviceName = useDeviceStore(
    (state) => state.setPendingDeviceName
  )

  async function handleSync() {
    try {
      await Promise.all([sync(), syncDevices()])
      toast.success("Synchronized")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Couldn't fetch config files"
      )
    }
  }

  return (
    <div className="flex flex-row items-center justify-between px-2 pr-1 py-1">
      <h1 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Explorer
      </h1>
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="p-1 m-0 gap-1"
          onClick={handleSync}
          disabled={syncLoading}
        >
          {syncLoading ? (
            <Spinner />
          ) : (
            <RefreshCw />
          )}
        </Button>
        <Button
          variant="ghost"
          className="p-1 m-0 gap-1"
          onClick={() => setPendingDeviceName("")}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}
