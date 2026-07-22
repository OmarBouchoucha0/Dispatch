"use client"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { Editor } from "@/components/editor/editor"
import { Explorer } from "@/components/fileExlorer/explorer"
import { ExplorerHeader } from "@/components/fileExlorer/explorer-header"
import { LogsTable } from "@/components/logs/logs-table"
import { UserTable } from "@/components/users/user-table"
import { DeviceTable } from "@/components/devices/device-table"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useUiStore } from "@/store/ui-store"
import { Suspense, useEffect, useRef } from "react"
import type { PanelImperativeHandle } from "react-resizable-panels"

function HomeContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const sidebarRef = useRef<PanelImperativeHandle | null>(null)

  const activeConfig = useConfigStore((state) => state.activeConfig)
  const closeConfig = useConfigStore((state) => state.closeConfig)
  const lastActiveDeviceID = useConfigStore(
    (state) => state.lastActiveDeviceID
  )
  const setPendingCreateFileDeviceID = useConfigStore(
    (state) => state.setPendingCreateFileDeviceID
  )
  const devices = useDeviceStore((state) => state.devices)
  const setPendingDeviceName = useDeviceStore(
    (state) => state.setPendingDeviceName
  )
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!sidebarRef.current) return
    if (sidebarCollapsed && !sidebarRef.current.isCollapsed()) {
      sidebarRef.current.collapse()
    } else if (!sidebarCollapsed && sidebarRef.current.isCollapsed()) {
      sidebarRef.current.expand()
    }
  }, [sidebarCollapsed])

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

  if (view === "users") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-4 overflow-hidden">
        <UserTable />
      </div>
    )
  }

  if (view === "devices") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-4 overflow-hidden">
        <DeviceTable />
      </div>
    )
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="bg-sidebar">
      <ResizablePanel
        panelRef={sidebarRef}
        defaultSize={200}
        minSize={150}
        collapsible={true}
        collapsedSize={0}
        onResize={() => {
          if (sidebarRef.current) {
            setSidebarCollapsed(sidebarRef.current.isCollapsed())
          }
        }}
        className="bg-sidebar">
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="h-full">
              <ExplorerHeader />
              <Explorer />
            </div>
          </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onSelect={() => {
                  const deviceID = lastActiveDeviceID ?? devices[0]?.id
                  if (deviceID) setPendingCreateFileDeviceID(deviceID)
                }}
              >
                New File
              </ContextMenuItem>
              <ContextMenuItem
                onSelect={() => { if (activeConfig) closeConfig(activeConfig) }}
              >
                Close File
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => setPendingDeviceName("")}
              >
                New Device
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() => {
                  if (sidebarRef.current?.isCollapsed()) {
                    sidebarRef.current.expand()
                  } else {
                    sidebarRef.current?.collapse()
                  }
                }}
              >
                Toggle Sidebar
              </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel minSize={500} >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
