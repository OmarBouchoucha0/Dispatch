"use client"

import * as React from "react"
import {
  Files,
  ScrollText,
  Settings,
  User,
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
import { useRouter } from "next/navigation"
import { useConfigStore } from "@/store/config-store"
import { useUiStore } from "@/store/ui-store"
import { commitConfig, logout } from "@/lib/api"
import { toast } from "sonner"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const sync = useConfigStore((state) => state.sync)
  const setAccountOpen = useUiStore((state) => state.setAccountOpen)
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen)

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

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
              <CommandItem onSelect={() => { setSettingsOpen(true); close() }}>
                <Settings className="size-4" />
                Settings
              </CommandItem>
              <CommandItem onSelect={() => { setAccountOpen(true); close() }}>
                <User className="size-4" />
                Account
              </CommandItem>
              <CommandItem onSelect={async () => { await logout(); router.push("/"); close() }}>
                <LogOut className="size-4" />
                Logout
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => { close() }}>
                <FilePlus className="size-4" />
                New Config
              </CommandItem>
              <CommandItem onSelect={() => { close() }}>
                <Monitor className="size-4" />
                New Device
              </CommandItem>
              <CommandItem onSelect={async () => { await commitConfig(); close() }}>
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
