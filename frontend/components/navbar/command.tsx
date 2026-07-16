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

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
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
              <CommandItem>
                <Files className="size-4" />
                Files
              </CommandItem>
              <CommandItem>
                <ScrollText className="size-4" />
                Logs
              </CommandItem>
              <CommandItem>
                <Settings className="size-4" />
                Settings
              </CommandItem>
              <CommandItem>
                <User className="size-4" />
                Account
              </CommandItem>
              <CommandItem>
                <LogOut className="size-4" />
                Logout
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem>
                <FilePlus className="size-4" />
                New Config
              </CommandItem>
              <CommandItem>
                <Monitor className="size-4" />
                New Device
              </CommandItem>
              <CommandItem>
                <GitCommitVertical className="size-4" />
                Commit
              </CommandItem>
              <CommandItem>
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
