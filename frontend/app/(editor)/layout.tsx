import { NavBar } from "@/components/navbar/navbar"
import { SideBar } from "@/components/sidebar/sidebar"
import { ConfigSync } from "./config-sync"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen flex-col">
      <NavBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SideBar />
        <main className="flex-1 min-h-0 overflow-hidden">
          <ConfigSync />
          {children}
        </main>
      </div>
    </div>
  )
}
