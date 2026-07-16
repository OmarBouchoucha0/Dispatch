"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Editor } from "@/components/editor/editor"
import { Explorer } from "@/components/fileExlorer/explorer"
import { ExplorerHeader } from "@/components/fileExlorer/explorer-header"
import { LogsTable } from "@/components/logs/logs-table"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { Suspense, useEffect } from "react"

function HomeContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"

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

  if (view === "logs") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-4 overflow-hidden">
        <LogsTable />
      </div>
    )
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

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
