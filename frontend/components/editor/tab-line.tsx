import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/editor/monaco"

const config1 = {
  username: "coder123",
  age: 28,
  is_active: true,
  skills: ["JavaScript", "Python", "JSON"],
  contact: {
    email: "user@example.com",
    city: "Tunis",
  },
}

export function TabsLine() {
  return (
    <Tabs defaultValue="config1" className="flex flex-col gap-0 h-full">
      <TabsList className=" rounded-none bg-muted p-0  shrink-0">
        <TabsTrigger
          value="config1"
          className="
        rounded-none
        px-6
        border-0
        data-[state=active]:!bg-background
        data-[state=active]:!text-foreground
        data-[state=active]:!border-0
        focus-visible:ring-0
        "
        >
          config1.json
        </TabsTrigger>

      </TabsList>

      <TabsContent value="config1" className="mt-0 flex-1 min-h-0 h-full overflow-hidden">
        <CodeEditor
          language="json"
          value={JSON.stringify(config1, null, 2)}
        />
      </TabsContent>
    </Tabs >
  )
}
