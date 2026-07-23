"use client"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/navbar/command"
import { RefreshCw, GitCompare, GitMerge } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useCommitStore } from "@/store/commit-store"
import { useUiStore } from "@/store/ui-store"
import { usePreferencesStore } from "@/store/preferences-store"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useState } from "react"
import { commitChanges } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Diff } from "@/components/diff/diff"

export function NavBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const sync = useConfigStore((state) => state.sync)
  const syncDevices = useDeviceStore((state) => state.sync)
  const syncLoading = useConfigStore((state) => state.loading)
  const activeConfig = useConfigStore((state) => state.activeConfig)
  const closeConfig = useConfigStore((state) => state.closeConfig)
  const setPendingCreateFileDeviceID = useConfigStore(
    (state) => state.setPendingCreateFileDeviceID
  )
  const lastActiveDeviceID = useConfigStore(
    (state) => state.lastActiveDeviceID
  )
  const devices = useDeviceStore((state) => state.devices)
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed)
  const editorInstance = useUiStore((state) => state.editorInstance)
  const editorFontSize = usePreferencesStore((state) => state.editorFontSize)
  const setEditorFontSize = usePreferencesStore((state) => state.setEditorFontSize)
  const baseEditorFontSize = usePreferencesStore((state) => state.baseEditorFontSize)
  const changedCount = useCommitStore((s) => Object.keys(s.changedFiles).length)
  const deletedCount = useCommitStore((s) => Object.keys(s.deletedFiles).length)
  const commitDialogOpen = useUiStore((s) => s.commitDialogOpen)
  const setCommitDialogOpen = useUiStore((s) => s.setCommitDialogOpen)
  const hasChanges = changedCount > 0 || deletedCount > 0
  const [commitLoading, setCommitLoading] = useState(false)

  function triggerEditor(actionId: string) {
    editorInstance?.trigger("menu", actionId, null)
  }

  async function editorCopy() {
    const editor = editorInstance
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    const text = editor.getModel()?.getValueInRange(selection)
    if (text) await navigator.clipboard.writeText(text)
  }

  async function editorCut() {
    const editor = editorInstance
    if (!editor) return
    const selection = editor.getSelection()
    if (!selection) return
    const text = editor.getModel()?.getValueInRange(selection)
    if (text) {
      await navigator.clipboard.writeText(text)
      editor.executeEdits("menu", [
        { range: selection, text: "", forceMoveMarkers: true },
      ])
    }
  }

  async function editorPaste() {
    const editor = editorInstance
    if (!editor) return
    const text = await navigator.clipboard.readText()
    if (!text) return
    const pos = editor.getPosition()!
    editor.executeEdits("menu", [
      {
        range: {
          startLineNumber: pos.lineNumber, startColumn: pos.column,
          endLineNumber: pos.lineNumber, endColumn: pos.column,
        },
        text,
      },
    ])
  }

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

  async function handlePush() {
    setCommitLoading(true)

    try {
      const ok = await commitChanges()
      if (ok) setCommitDialogOpen(false)
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

          <DropdownMenuContent
            align="start" className="w-full bg-secondary"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuItem
              onSelect={() => {
                const deviceID = lastActiveDeviceID ?? devices[0]?.id
                if (!deviceID) return
                if (view !== "files") {
                  router.push("/files")
                }
                setPendingCreateFileDeviceID(deviceID)
              }}
            >
              New File
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => { if (activeConfig) closeConfig(activeConfig) }}
            >
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
            <DropdownMenuItem onSelect={() => triggerEditor("undo")}>
              Undo
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => triggerEditor("redo")}>
              Redo
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={editorCut}>
              Cut
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={editorCopy}>
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={editorPaste}>
              Paste
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => triggerEditor("editor.action.selectAll")}>
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
            <DropdownMenuItem
              onSelect={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              Toggle Sidebar
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => setEditorFontSize(Math.min(editorFontSize + 1, 32))}>
              Zoom In
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditorFontSize(Math.max(editorFontSize - 1, 10))}>
              Zoom Out
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setEditorFontSize(baseEditorFontSize)}>
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

      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <Button size="sm" onClick={() => setCommitDialogOpen(true)}>
          <GitCompare />
          Commit
        </Button>
        <DialogContent
          className="!max-w-[90vw] w-[90vw] h-[80vh] flex flex-col p-0 gap-0"
        >

          <div className="flex-1 min-h-0 overflow-auto">
            <Diff />
          </div>

          <DialogFooter className="shrink-0 flex-row justify-end border-t m-0">
            <Button onClick={handlePush} disabled={!hasChanges || commitLoading}>
              {commitLoading ? (
                <Spinner />
              ) : (
                <GitMerge />
              )}
              Push
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
