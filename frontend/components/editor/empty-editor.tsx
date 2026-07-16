import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { File } from "lucide-react"

export function EmptyEditor() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <Empty className="w-auto flex-none">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <File />
          </EmptyMedia>

          <EmptyTitle className="text-base">No file selected</EmptyTitle>

          <EmptyDescription className="text-base">
            Select a device configuration from the explorer to start editing
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
