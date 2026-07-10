import { NavBar } from "@/components/navbar/navbar"
import { SideBar } from "@/components/sidebar/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <SideBar />
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
