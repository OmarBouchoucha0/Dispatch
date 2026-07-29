"use client"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/navbar/command"
import { GitCompare, GitMerge, ChevronDown, Clock, CalendarIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useCommitStore } from "@/store/commit-store"
import { useUiStore } from "@/store/ui-store"
import { usePreferencesStore } from "@/store/preferences-store"
import { Spinner } from "@/components/ui/spinner"
import { useState } from "react"
import { scheduleEvent } from "@/lib/api"
import { useRouter, useSearchParams } from "next/navigation"
import { Diff } from "@/components/diff/diff"
import { SchedulePopover } from "@/components/navbar/schedule-popover"
import { useEventsStore } from "@/store/events-store"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export function NavBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
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
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [eventName, setEventName] = useState("")

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

  function buildConfigsAfter() {
    const { changedFiles, deletedFiles } = useCommitStore.getState()
    const configs = useConfigStore.getState().configs

    const configsAfter = configs
      .filter((c) => !(c.id in deletedFiles))
      .map((c) => {
        if (c.id in changedFiles) {
          return {
            device_id: c.device_id,
            name: c.name,
            content: JSON.parse(changedFiles[c.id]),
          }
        }
        return {
          device_id: c.device_id,
          name: c.name,
          content: c.content,
        }
      })

    return configsAfter
  }

  async function handleSchedule(name: string, scheduledAt?: Date) {
    setScheduleLoading(true)
    try {
      const configsAfter = buildConfigsAfter()
      const ok = await scheduleEvent(name, scheduledAt?.toISOString(), configsAfter)
      if (ok) {
        await useEventsStore.getState().sync()
        setCommitDialogOpen(false)
        setEventName("")
        useCommitStore.setState({ changedFiles: {}, deletedFiles: {} })
        toast.success("Event scheduled")
      }
    } finally {
      setScheduleLoading(false)
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

      <Dialog open={commitDialogOpen} onOpenChange={setCommitDialogOpen}>
        <Button size="sm" onClick={() => { useUiStore.getState().setAccountOpen(false); useUiStore.getState().setSettingsOpen(false); setCommitDialogOpen(true) }}>
          <GitCompare />
          Commit
        </Button>
        <DialogContent
          className="!max-w-[90vw] w-[90vw] h-[80vh] flex flex-col p-0 gap-0"
          showCloseButton={false}
        >

          <div className="flex-1 min-h-0 overflow-auto rounded-xl">
            <Diff />
          </div>

          <DialogFooter className="shrink-0 flex-row items-center justify-between border-t m-0 gap-2">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Input
                placeholder="Event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className="h-7 text-xs"
              />
            </div>

            <div className="flex flex-row items-center gap-2">
              <div className="flex items-center rounded-md border overflow-hidden">
                <Button
                  onClick={() =>
                    handleSchedule(eventName.trim() || "Anonymous")
                  }
                  disabled={!hasChanges || scheduleLoading}
                  className="rounded-none border-0"
                >
                  {scheduleLoading ? <Spinner /> : <GitMerge />}
                  Push
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      disabled={!hasChanges || scheduleLoading}
                      className="rounded-none border-0 border-border border-l-2 px-2"
                      aria-label="Schedule for later"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[220px]">
                    <DropdownMenuItem
                      className="w-full whitespace-nowrap cursor-pointer"
                      onSelect={() => setScheduleOpen(true)}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      Schedule for later
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <SchedulePopover
              open={scheduleOpen}
              onOpenChange={setScheduleOpen}
              onConfirm={handleSchedule}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
