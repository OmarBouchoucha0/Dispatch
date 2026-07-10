"use client"
import { Button } from "@/components/ui/button"
import { Files, History, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarIcon } from "@/components/sidebar/sidebar-icon"
import { useRouter, usePathname } from "next/navigation"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div className="flex flex-col items-center gap-1 p-1 h-full bg-sidebar border-r border-border">
      <SidebarIcon icon={Files}
        onClick={() => {
          console.log("clicked", "/files")
          router.push("/files")
        }
        }
        active={pathname === "/files"}
      />
      <SidebarIcon icon={History}
        onClick={() => router.push("/logs")}
        active={pathname === "/logs"}
      />
      <div className="mt-auto flex flex-col items-center gap-2">
        <SidebarIcon icon={User} />
        <SidebarIcon icon={Settings} />
      </div>
    </div>
  )
}
