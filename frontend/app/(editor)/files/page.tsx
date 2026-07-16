"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Editor } from "@/components/editor/editor"
import { Explorer } from "@/components/fileExlorer/explorer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"



export default function Home() {
  const [selectedPath, setSelectedPath] = useState<string>()
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/")
    return null
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="bg-sidebar">
      <ResizablePanel
        defaultSize={200}
        minSize={150}
        collapsible={true}
        collapsedSize={0}
        className="bg-sidebar">
        <h1 className="p-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          File Explorer
        </h1>
        <Explorer />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={500} >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
