import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

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

const config2 = {
  username: "coder44",
  age: 40,
  is_active: true,
  skills: ["JavaScript", "c", "JSON"],
  contact: {
    email: "user@example.com",
    city: "Tunis",
  },
}

const config3 = {
  username: "adadd",
  age: 99,
  is_active: true,
  skills: ["JavaScript", "c", "JSON"],
  contact: {
    email: "user@example.com",
    city: "Tunis",
  },
}

export function TabsLine() {
  return (
    <Tabs defaultValue="config1" className="gap-0">
      <TabsList className=" rounded-none bg-muted pt-0 px-0">
        <TabsTrigger
          value="config1"
          className="
        rounded-none
        px-6
        data-[state=active]:!bg-background
        data-[state=active]:!text-foreground
      "
        >
          config1.json
        </TabsTrigger>

        <TabsTrigger
          value="config2"
          className="
        rounded-none
        px-6
        data-[state=active]:!bg-background
        data-[state=active]:!text-foreground
      "
        >
          config2.json
        </TabsTrigger>

        <TabsTrigger
          value="config3"
          className="
        rounded-none
        px-6
        data-[state=active]:!bg-background
        data-[state=active]:!text-foreground
      "
        >
          config3.json
        </TabsTrigger>

      </TabsList>

      <TabsContent value="config1" className="mt-0 ">
        <Card className="rounded-none bg-background h-screen ">
          <CardContent className="text-sm text-muted-foreground">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(config1, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="config2" className="mt-0">
        <Card className="rounded-none bg-background h-screen">
          <CardContent className="text-sm text-muted-foreground">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(config2, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="config3" className="mt-0 ">
        <Card className="rounded-none bg-background h-screen ">
          <CardContent className="text-sm text-muted-foreground">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(config3, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs >
  )
}
