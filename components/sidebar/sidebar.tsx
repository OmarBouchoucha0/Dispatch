"use client"
import { Files, History, Settings, User } from "lucide-react"
import { SidebarIcon } from "@/components/sidebar/sidebar-icon"
import { useRouter, usePathname } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  return (
    <div className="flex flex-col items-center gap-1  h-full bg-sidebar border-r border-border">

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
        <Dialog>
          <DialogTrigger asChild>
            <SidebarIcon icon={User} />
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>
                Manage your account details here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/*  */}
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Dialog>
          <DialogTrigger asChild>
            <SidebarIcon icon={Settings} />
          </DialogTrigger>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Adjust your editor preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/*  */}
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div >
  )
}
