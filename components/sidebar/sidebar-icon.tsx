"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface SidebarIconProps {
  icon: LucideIcon
}

export function SidebarIcon({ icon: Icon }: SidebarIconProps) {
  const [hovered, setHovered] = useState(false)
  return (
    <Button
      variant="ghost"
      className="h-11 w-11"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon
        className="!h-7 !w-7 transition-colors"
        strokeWidth={1.5}
        style={{ color: hovered ? "var(--foreground)" : "var(--muted-foreground)" }}
      />
    </Button>
  )
}
