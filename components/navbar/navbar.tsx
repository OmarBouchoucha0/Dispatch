"use client"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/navbar/command"

export function NavBar() {
  return (
    <div className="w-full flex items-center justify-between p-1 bg-sidebar border-b border-border gap-2">
      <div className="flex items-center gap-0">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          File
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
          View
        </Button>
      </div>

      <div className="flex-1 flex justify-center">
        <CommandPalette />
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm">Commit</Button>
      </div>
    </div>
  )
}
