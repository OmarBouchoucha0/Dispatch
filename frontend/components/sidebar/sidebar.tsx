"use client"
import { Files, History, Settings, User, LogOut } from "lucide-react"
import { SidebarIcon } from "@/components/sidebar/sidebar-icon"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { logout } from "@/lib/api"
import { useUiStore } from "@/store/ui-store"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const accountOpen = useUiStore((state) => state.accountOpen)
  const setAccountOpen = useUiStore((state) => state.setAccountOpen)
  const settingsOpen = useUiStore((state) => state.settingsOpen)
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen)

  async function handleLogout() {
    await logout()
    router.push("/")
  }

  return (
    <div className="flex flex-col items-center gap-0  h-full bg-sidebar border-r border-border">

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={Files}
            onClick={() => router.push("/files")}
            active={pathname === "/files" && view === "files"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Files</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={History}
            onClick={() => router.push("/files?view=logs")}
            active={pathname === "/files" && view === "logs"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logs</p>
        </TooltipContent >
      </Tooltip>

      <div className="mt-auto flex flex-col items-center gap-0">
        <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarIcon icon={User} onClick={() => setAccountOpen(true)} />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Account</p>
            </TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Account</DialogTitle>
              <DialogDescription>
                Manage your account details here.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" type="text" required />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" required />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarIcon icon={Settings} onClick={() => setSettingsOpen(true)} />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

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

        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarIcon icon={LogOut} onClick={handleLogout} />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Logout</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div >
  )
}
