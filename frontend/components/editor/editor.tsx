import { TabsLine } from "@/components/editor/tab-line"
import { EmptyEditor } from "@/components/editor/empty-editor"
import { useConfigStore } from "@/store/config-store"

export function Editor() {
  const openedConfigs = useConfigStore((state) => state.openedConfigs)

  if (openedConfigs.length === 0) {
    return <EmptyEditor />
  }

  return (
    <div className="flex flex-col h-full w-full">
      <TabsLine />
    </div>
  )
}
