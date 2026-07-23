"use client"

import * as React from "react"
import {
  Files,
  ScrollText,
  Settings,
  User,
  Users,
  LogOut,
  FilePlus,
  Monitor,
  GitCommitVertical,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useRouter, useSearchParams } from "next/navigation"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useUiStore } from "@/store/ui-store"
import { logout } from "@/lib/api"
import { toast } from "sonner"

export function CommandPalette() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const open = useUiStore((state) => state.commandPaletteOpen)
  const setOpen = useUiStore((state) => state.setCommandPaletteOpen)
  const sync = useConfigStore((state) => state.sync)
  const setAccountOpen = useUiStore((state) => state.setAccountOpen)
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen)
  const setCommitDialogOpen = useUiStore((state) => state.setCommitDialogOpen)
  const lastActiveDeviceID = useConfigStore((state) => state.lastActiveDeviceID)
  const setPendingCreateFileDeviceID = useConfigStore(
    (state) => state.setPendingCreateFileDeviceID
  )
  const devices = useDeviceStore((state) => state.devices)
  const setPendingDeviceName = useDeviceStore(
    (state) => state.setPendingDeviceName
  )

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key === "k") {
        e.preventDefault()
        setOpen(!open)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, setOpen])

  function close() {
    setOpen(false)
  }

  return (
    <div className="w-full max-w-md flex flex-col gap-4">
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full justify-start text-muted-foreground"
        size="sm"
      >
        Command Palette
        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          Ctrl+Alt+K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              <CommandItem onSelect={() => { router.push("/files"); close() }}>
                <Files className="size-4" />
                Files
              </CommandItem>
              <CommandItem onSelect={() => { router.push("/files?view=logs"); close() }}>
                <ScrollText className="size-4" />
                Logs
              </CommandItem>
              <CommandItem onSelect={() => { router.push("/files?view=users"); close() }}>
                <Users className="size-4" />
                Users
              </CommandItem>
              <CommandItem onSelect={() => { router.push("/files?view=devices"); close() }}>
                <Monitor className="size-4" />
                Devices
              </CommandItem>
              <CommandItem onSelect={() => { setSettingsOpen(false); setCommitDialogOpen(false); setAccountOpen(true); close() }}>
                <User className="size-4" />
                Account
              </CommandItem>
              <CommandItem onSelect={() => { setAccountOpen(false); setCommitDialogOpen(false); setSettingsOpen(true); close() }}>
                <Settings className="size-4" />
                Settings
              </CommandItem>
              <CommandItem onSelect={async () => { await logout(); router.push("/"); close() }}>
                <LogOut className="size-4" />
                Logout
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => {
                const deviceID = lastActiveDeviceID ?? devices[0]?.id
                if (!deviceID) { close(); return }
                if (view !== "files") router.push("/files")
                setPendingCreateFileDeviceID(deviceID)
                close()
              }}>
                <FilePlus className="size-4" />
                New Config
              </CommandItem>
              <CommandItem onSelect={() => {
                if (view !== "files") router.push("/files")
                setPendingDeviceName("")
                close()
              }}>
                <Monitor className="size-4" />
                New Device
              </CommandItem>
              <CommandItem onSelect={() => { setAccountOpen(false); setSettingsOpen(false); setCommitDialogOpen(true); close() }}>
                <GitCommitVertical className="size-4" />
                Commit
              </CommandItem>
              <CommandItem onSelect={async () => { await sync(); toast.success("Configs synchronized"); close() }}>
                <RefreshCw className="size-4" />
                Sync
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  )
}
