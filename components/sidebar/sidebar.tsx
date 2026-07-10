"use client"
import { Button } from "@/components/ui/button"
import { Files, History, Settings, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarIcon } from "@/components/sidebar/sidebar-icon"
import { useRouter, usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div className="flex flex-col items-center gap-1 p-1 h-full bg-sidebar border-r border-border">

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={Files}
            onClick={() => {
              console.log("clicked", "/files")
              router.push("/files")
            }
            }
            active={pathname === "/files"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Files</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={History}
            onClick={() => router.push("/logs")}
            active={pathname === "/logs"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logs</p>
        </TooltipContent >
      </Tooltip>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Tooltip >
          <TooltipTrigger asChild>
            <SidebarIcon icon={User} />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Account</p>
          </TooltipContent >
        </Tooltip>

        <Tooltip >
          <TooltipTrigger asChild>
            <SidebarIcon icon={Settings} />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

      </div>
    </div>
  )
}
