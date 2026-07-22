"use client"
import { Files, Settings, Monitor, User, Users, LogOut, ScrollText } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { logout } from "@/lib/api"
import { useTheme } from "next-themes"
import { useUiStore } from "@/store/ui-store"
import { usePreferencesStore } from "@/store/preferences-store"
import { useAuth } from "@/components/auth/auth-provider"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const { user } = useAuth()
  const accountOpen = useUiStore((state) => state.accountOpen)
  const setAccountOpen = useUiStore((state) => state.setAccountOpen)
  const settingsOpen = useUiStore((state) => state.settingsOpen)
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen)
  const editorFont = usePreferencesStore((state) => state.editorFont)
  const editorFontSize = usePreferencesStore((state) => state.editorFontSize)
  const baseEditorFontSize = usePreferencesStore((state) => state.baseEditorFontSize)
  const setEditorFont = usePreferencesStore((state) => state.setEditorFont)
  const setEditorFontSize = usePreferencesStore((state) => state.setEditorFontSize)
  const setBaseEditorFontSize = usePreferencesStore((state) => state.setBaseEditorFontSize)
  const { theme, setTheme } = useTheme()

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
          <SidebarIcon icon={ScrollText}
            onClick={() => router.push("/files?view=logs")}
            active={pathname === "/files" && view === "logs"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Logs</p>
        </TooltipContent >
      </Tooltip>

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={Users}
            onClick={() => router.push("/files?view=users")}
            active={pathname === "/files" && view === "users"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Users</p>
        </TooltipContent >
      </Tooltip>

      <Tooltip >
        <TooltipTrigger asChild>
          <SidebarIcon icon={Monitor}
            onClick={() => router.push("/files?view=devices")}
            active={pathname === "/files" && view === "devices"}
          />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Devices</p>
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
                <Input id="firstName" type="text" required value={user?.firstName ?? ""} readOnly />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" type="text" required value={user?.lastName ?? ""} readOnly />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={user?.email ?? ""} readOnly />
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
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label>Font</Label>
                <Select value={editorFont} onValueChange={setEditorFont}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JetBrains Mono">JetBrains Mono</SelectItem>
                    <SelectItem value="Fira Code">Fira Code</SelectItem>
                    <SelectItem value="Source Code Pro">Source Code Pro</SelectItem>
                    <SelectItem value="Iosevka">Iosevka</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label>Font Size</Label>
                <Input
                  type="number"
                  min={10}
                  max={32}
                  value={baseEditorFontSize}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setBaseEditorFontSize(val)
                    setEditorFontSize(val)
                  }}
                />
              </div>
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
