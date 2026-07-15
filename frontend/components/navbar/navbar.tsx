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
import { useEditorStore } from "@/store/editor-store"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useEffect } from "react"
import { useState } from "react"
import { API_URL } from "@/lib/api"

export function NavBar() {
  const sync = useConfigStore((state) => state.sync)
  const syncLoading = useConfigStore((state) => state.loading)
  const syncError = useConfigStore((state) => state.error)
  const [commitLoading, setCommitLoading] = useState(false)
  const activeConfigId = useConfigStore(
    (state) => state.activeConfig
  )

  const openedConfigs = useConfigStore(
    (state) => state.openedConfigs
  )

  const files = useEditorStore(
    (state) => state.files
  )
  useEffect(() => {
    if (syncError) {
      toast.error("Couldn't fetch config files")
    }
  }, [syncError])

  async function handleSubmitFile(e: React.FormEvent) {
    e.preventDefault()
    setCommitLoading(true)

    try {
      const activeConfig = openedConfigs.find(
        (config) => config.id === activeConfigId
      )

      if (!activeConfig) {
        toast.error("No file selected")
        return
      }

      const editorFile = files[activeConfig.id]

      if (!editorFile) {
        toast.error("No editor content found")
        return
      }

      const res = await fetch(
        `${API_URL}/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            device_id: activeConfig.deviceID,
            content: JSON.parse(editorFile.content),
          }),
        }
      )

      if (!res.ok) {
        toast.error("Failed to save config")
        return
      }

      toast.success("Config saved")

    } catch {
      toast.error("Invalid JSON or server error")
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
            <DropdownMenuItem>
              Save
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              Close File
            </DropdownMenuItem>
            <DropdownMenuItem>
              Exit
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
            <DropdownMenuItem>
              Toggle Terminal
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
        <Button size="sm" variant="secondary" onClick={sync} disabled={syncLoading}>

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
