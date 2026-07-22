"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface SidebarIconProps
  extends React.ComponentProps<typeof Button> {
  icon: LucideIcon
  active?: boolean
}

export const SidebarIcon = React.forwardRef<
  HTMLButtonElement,
  SidebarIconProps
>(({ icon: Icon, active, className, ...props }, ref) => {
  const [hovered, setHovered] = React.useState(false)
  const isLit = hovered || active

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={`h-5 w-5 border-l-3 rounded-none p-6 ${active ? "border-l-primary" : "border-l-transparent"
        } ${className ?? ""}`}
      onMouseEnter={(e) => {
        setHovered(true)
        props.onMouseEnter?.(e)
      }}
      onMouseLeave={(e) => {
        setHovered(false)
        props.onMouseLeave?.(e)
      }}
      {...props}
    >
      <Icon
        className={`!h-6 !w-6 transition-colors ${
          isLit
            ? "text-foreground dark:text-primary-foreground"
            : "text-muted-foreground"
        }`}
        strokeWidth={1.5}
      />
    </Button>
  )
})

SidebarIcon.displayName = "SidebarIcon"
