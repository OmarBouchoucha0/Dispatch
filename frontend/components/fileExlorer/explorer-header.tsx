import { Button } from "@/components/ui/button"
import { Plus, Monitor } from "lucide-react"

export function ExplorerHeader() {
  return (
    <div className="flex flex-row items-center justify-between px-2 py-1">
      <h1 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Explorer
      </h1>
      <Button variant="ghost" className="px-2 gap-1">
        <Plus className="h-4 w-4" />
        <Monitor className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  )
}
