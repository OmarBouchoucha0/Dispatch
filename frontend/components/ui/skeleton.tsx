import { cn } from "@/lib/utils"

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  )
}

export function EditorLayoutSkeleton() {
  return (
    <div className="flex h-screen flex-col">
      <div className="flex h-14 shrink-0 items-center gap-4 border-b border-border px-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="ml-auto h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-1 min-h-0">
        <div className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-border py-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-5 rounded" />
          <div className="mt-auto flex flex-col items-center gap-4">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
        <div className="flex flex-1 min-h-0">
          <div className="w-[200px] shrink-0 border-r border-border p-2 space-y-1">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CalendarSkeleton() {
  return (
    <div className="flex flex-1 h-full min-h-0 flex-col p-3 overflow-hidden">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={`hdr-${i}`} className="h-8" />
          ))}
          {Array.from({ length: 42 }).map((_, i) => (
            <Skeleton key={`cell-${i}`} className="h-24" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      <Skeleton className="h-10 w-64" />
      <div className="space-y-0.5">
        <div className="flex gap-4 border-b border-border py-3 px-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-36" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 border-b border-border py-3 px-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}
