"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface SidebarIconProps {
  icon: LucideIcon
  onClick?: () => void
  active?: boolean
}

export function SidebarIcon({ icon: Icon, onClick, active }: SidebarIconProps) {
  const [hovered, setHovered] = useState(false)
  const isLit = hovered || active

  return (
    <Button
      variant="ghost"
      className="h-10 w-10"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Icon
        className="!h-6 !w-6 transition-colors"
        strokeWidth={1.5}
        style={{ color: isLit ? "var(--foreground)" : "var(--muted-foreground)" }}
      />
    </Button>
  )
}
