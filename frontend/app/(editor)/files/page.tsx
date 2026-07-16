"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Editor } from "@/components/editor/editor"
import { Explorer } from "@/components/fileExlorer/explorer"
import { ExplorerHeader } from "@/components/fileExlorer/explorer-header"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useEffect } from "react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
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
        <ExplorerHeader />
        <Explorer />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={500} >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
