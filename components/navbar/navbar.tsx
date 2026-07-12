"use client"
import { Button } from "@/components/ui/button"
import { CommandPalette } from "@/components/navbar/command"
import { RefreshCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function NavBar() {
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
        <Button size="sm" variant="secondary" ><RefreshCw /> Sync</Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" >Commit</Button>
      </div>
    </div>
  )
}
