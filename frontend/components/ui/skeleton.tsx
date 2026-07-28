import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  )
}

export function LoadingFallback({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-full w-full text-muted-foreground", className)}>
      Loading...
    </div>
  )
}
