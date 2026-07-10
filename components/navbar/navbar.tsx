"use client"
import { Button } from "@/components/ui/button"

export function NavBar() {
  return (
    <div className="w-full flex items-center justify-between p-1 bg-sidebar border-b border-border gap-2">
      <div className="flex items-center gap-0">
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">File</Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">edit</Button>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">view</Button>
      </div>

      <div className="flex-1 flex justify-center">
        <Button variant="outline" size="sm" className="w-full max-w-md justify-start text-muted-foreground">
          Command Palette
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm">Commit</Button>
      </div>
    </div>
  )
}
