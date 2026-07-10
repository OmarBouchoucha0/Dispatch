"use client"
import { Button } from "@/components/ui/button"
import { Files, History, Settings, Square } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarIcon } from "@/components/sidebar/sidebar-icon"

export function SideBar() {
  return (
    <div className="flex flex-col items-center gap-1 p-1 h-full bg-sidebar border-r border-border">
      <SidebarIcon icon={Files} />
      <SidebarIcon icon={History} />
      <div className="mt-auto flex flex-col items-center gap-2">
        <Button variant="ghost" className="h-11 w-11 ">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
        <SidebarIcon icon={Settings} />
      </div>
    </div>
  )
}
