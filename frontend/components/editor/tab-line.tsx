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
              className="rounded-none
                          px-4 
                          data-[state=active]:!bg-background
                          data-[state=active]:!text-foreground
                          data-[state=active]:!border-0"
            >
              {config.deviceName}.json
              {activeConfig === config.id && (
                <span
                  className="flex h-4 w-4 items-center ml-2"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeConfig(config.id)
                  }}
                >
                  <X className="!h-4 !w-4" />
                </span>
              )}
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
