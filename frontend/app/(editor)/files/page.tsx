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
import { ScheduleCalendar } from "@/components/schedule/schedule-calendar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth/auth-provider"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useUiStore } from "@/store/ui-store"
import { Suspense, useEffect, useRef } from "react"
import { LoadingFallback } from "@/components/ui/skeleton"
import type { PanelImperativeHandle } from "react-resizable-panels"

function HomeContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const view = useUiStore((state) => state.view)
  const setView = useUiStore((state) => state.setView)
  const sidebarRef = useRef<PanelImperativeHandle | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlView = params.get("view") ?? "files"
    setView(urlView)
  }, [setView])

  useEffect(() => {
    router.replace(
      view === "files" ? "/files" : `/files?view=${view}`,
      { scroll: false }
    )
  }, [view, router])

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

  const isAdmin = user?.role === "admin"

  useEffect(() => {
    const adminViews = ["logs", "users", "devices"]
    if (user && !isAdmin && adminViews.includes(view)) {
      setView("files")
    }
  }, [user, isAdmin, view, setView])

  useEffect(() => {
    if (!sidebarRef.current) return
    if (sidebarCollapsed && !sidebarRef.current.isCollapsed()) {
      sidebarRef.current.collapse()
    } else if (!sidebarCollapsed && sidebarRef.current.isCollapsed()) {
      sidebarRef.current.expand()
    }
  }, [sidebarCollapsed])

  if (loading) {
    return <LoadingFallback />
  }

  if (!user) {
    return null
  }

  if (view === "schedule") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-0 overflow-hidden">
        <ScheduleCalendar />
      </div>
    )
  }
  if (view === "logs") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-3 overflow-hidden">
        <LogsTable />
      </div>
    )
  }

  if (view === "users") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-3 overflow-hidden">
        <UserTable />
      </div>
    )
  }

  if (view === "devices") {
    return (
      <div className="flex flex-1 h-full min-h-0 flex-col p-3 overflow-hidden">
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
      <ResizablePanel minSize={400} >
        <Editor />
      </ResizablePanel>
    </ResizablePanelGroup >
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  )
}
