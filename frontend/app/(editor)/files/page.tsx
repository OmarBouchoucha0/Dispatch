"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Editor } from "@/components/editor/editor"
import { Explorer, FileNode } from "@/components/fileExlorer/explorer"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"


const mockTree: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      {
        name: "components",
        type: "folder",
        children: [
          { name: "editor.tsx", type: "file" },
          { name: "sidebar.tsx", type: "file" },
        ],
      },
      { name: "index.ts", type: "file" },
    ],
  },
  { name: "package.json", type: "file" },
  { name: "README.md", type: "file" },
]

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
        defaultSize={250}
        minSize={100}
        collapsible={true}
        collapsedSize={0}
        className="bg-sidebar"
      >
        <h1 className="p-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          File Explorer
        </h1>
        <Explorer
          tree={mockTree}
          selectedPath={selectedPath}
          onFileSelect={setSelectedPath}
        />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        minSize={500}
      >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
