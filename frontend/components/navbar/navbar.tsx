"use client"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/navbar/command"
import { RefreshCw, GitCompare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useState } from "react"
import { commitConfig } from "@/lib/api"

export function NavBar() {
  const sync = useConfigStore((state) => state.sync)
  const syncDevices = useDeviceStore((state) => state.sync)
  const syncLoading = useConfigStore((state) => state.loading)
  const [commitLoading, setCommitLoading] = useState(false)

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

  async function handleSubmitFile(e: React.FormEvent) {
    e.preventDefault()
    setCommitLoading(true)

    try {
      await commitConfig()
    } finally {
      setCommitLoading(false)
    }
  }

  return (
    <div className="w-full flex items-center justify-between p-1 bg-sidebar border-b border-border gap-2">
      <div className="flex items-center gap-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              File
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-full bg-secondary">
            <DropdownMenuItem>
              New File
            </DropdownMenuItem>
            <DropdownMenuItem>
              Open File
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Close File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Edit
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-full bg-secondary">
            <DropdownMenuItem>
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem>
              Redo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Cut
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem>
              Paste
            </DropdownMenuItem>
            <DropdownMenuItem>
              Select All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>


        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            >
              View
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-full bg-secondary">
            <DropdownMenuItem>
              Toggle Sidebar
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem>
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuItem>
              Reset Zoom
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 flex justify-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={handleSync} disabled={syncLoading}>

          {syncLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <RefreshCw />
          )}
          Sync
        </Button>

      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSubmitFile} disabled={commitLoading}>

          {commitLoading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <GitCompare />
          )}
          Commit
        </Button>
      </div>
    </div>
  )
}
