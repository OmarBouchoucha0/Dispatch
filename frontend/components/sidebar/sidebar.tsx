"use client"
import { useState } from "react"
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
import { API_URL, logout } from "@/lib/api"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { useUiStore } from "@/store/ui-store"
import { usePreferencesStore } from "@/store/preferences-store"
import { useAuth } from "@/components/auth/auth-provider"

export function SideBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get("view") ?? "files"
  const { user, refresh } = useAuth()
  const [firstName, setFirstName] = useState(user?.firstName ?? "")
  const [lastName, setLastName] = useState(user?.lastName ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [saving, setSaving] = useState(false)
  const [mode, setMode] = useState<"profile" | "password">("profile")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const accountOpen = useUiStore((state) => state.accountOpen)
  const setAccountOpen = useUiStore((state) => state.setAccountOpen)
  const settingsOpen = useUiStore((state) => state.settingsOpen)
  const setSettingsOpen = useUiStore((state) => state.setSettingsOpen)
  const setCommitDialogOpen = useUiStore((state) => state.setCommitDialogOpen)

  function syncFormFromUser() {
    setFirstName(user?.firstName ?? "")
    setLastName(user?.lastName ?? "")
    setEmail(user?.email ?? "")
  }

  function resetForm() {
    setMode("profile")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password")
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch(`${API_URL}/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        toast.error(text || "Failed to update password")
        return
      }

      toast.success("Password updated")
      setAccountOpen(false)
    } catch {
      toast.error("Server error")
    } finally {
      setChangingPassword(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/user/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
        }),
      })

      if (!res.ok) {
        toast.error("Failed to update account")
        return
      }

      toast.success("Account updated")
      await refresh()
    } catch {
      toast.error("Server error")
    } finally {
      setSaving(false)
    }
  }
  const editorFont = usePreferencesStore((state) => state.editorFont)
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
        <Dialog open={accountOpen} onOpenChange={(open) => {
          if (open) syncFormFromUser()
          else resetForm()
          setAccountOpen(open)
        }}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarIcon icon={User} onClick={() => { setSettingsOpen(false); setCommitDialogOpen(false); syncFormFromUser(); setAccountOpen(true) }} />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Account</p>
            </TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
            {mode === "profile" ? (
              <>
                <DialogHeader>
                  <DialogTitle>Account</DialogTitle>
                  <DialogDescription>
                    Manage your account details here.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setMode("password")}>Reset Password</Button>
                  <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your current password and a new password.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>

                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>

                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setMode("profile")}>Back</Button>
                  <Button onClick={handleChangePassword} disabled={changingPassword}>{changingPassword ? "Updating..." : "Update Password"}</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>


        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarIcon icon={Settings} onClick={() => { setAccountOpen(false); setCommitDialogOpen(false); setSettingsOpen(true) }} />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
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
