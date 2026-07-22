import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ConfigEditor } from "@/components/editor/config-editor"
import { useConfigStore } from "@/store/config-store"
import { X } from "lucide-react"

export function TabsLine() {
  const openedConfigs = useConfigStore(
    (state) => state.openedConfigs
  )
  const activeConfig = useConfigStore(
    (state) => state.activeConfig
  )
  const setActiveConfig = useConfigStore(
    (state) => state.setActiveConfig
  )
  const closeConfig = useConfigStore(
    (state) => state.closeConfig
  )
  return (
    <Tabs
      value={activeConfig ?? ""}
      onValueChange={setActiveConfig}
      className="flex flex-col gap-0 min-h-0 h-full">
      <div className="overflow-x-auto shrink-0 overflow-y-hidden">
        <TabsList className=" rounded-none bg-muted p-0  shrink-0">
          {openedConfigs.map((config) => (
            <TabsTrigger
              key={config.id}
              value={config.id}
              className="group rounded-none
                          px-3 
                          pl-7
                          border-r-border
                          data-[state=active]:!bg-background
                          data-[state=active]:!text-foreground
                          data-[state=active]:!border-l-0
                          data-[state=active]:!border-y-0"
            >
              {config.name}
              <span
                className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  closeConfig(config.id)
                }}
              >
                <X />
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {openedConfigs.map((config) => (
        <TabsContent
          key={config.id}
          value={config.id}
          className="mt-0 flex-1 min-h-0 h-full overflow-hidden"
        >
          <ConfigEditor configId={config.id} />
        </TabsContent>
      ))}
    </Tabs >
  )
}
