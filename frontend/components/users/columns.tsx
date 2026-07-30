"use client"
import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { ChevronDownIcon, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import { useUserStore } from "@/store/users-store"

export type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  created_at: string
}

function TextCell({ value, rowId, field }: { value: string; rowId: string; field: "first_name" | "last_name" | "email" }) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const updateUser = useUserStore((s) => s.updateUser)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setLocalValue(value) }, [value])

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-accent/50 p-1 -mx-1 rounded block truncate"
      >
        {value}
      </span>
    )
  }

  return (
    <div
      ref={ref}
      onBlur={(e) => {
        if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
          if (localValue !== value) updateUser(rowId, { [field]: localValue })
          setEditing(false)
        }
      }}
    >
      <Input
        autoFocus
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="h-7 text-xs"
      />
    </div>
  )
}

function DateCell({ value, rowId }: { value: string; rowId: string }) {
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState(false)
  const [dateState, setDateState] = useState<Date>(() => {
    const d = new Date(value.replace(" ", "T"))
    return isNaN(d.getTime()) ? new Date() : d
  })
  const [timeState, setTimeState] = useState(() => {
    const d = new Date(value.replace(" ", "T"))
    return isNaN(d.getTime()) ? "00:00:00" : format(d, "HH:mm:ss")
  })
  const updateUser = useUserStore((s) => s.updateUser)
  const ref = useRef<HTMLDivElement>(null)
  const dateSelected = useRef(false)

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-accent/50 p-1 -mx-1 rounded block"
      >
        {formatDate(value)}
      </span>
    )
  }

  const save = () => {
    const newVal = `${format(dateState, "yyyy-MM-dd")} ${timeState}`
    if (newVal !== value) updateUser(rowId, { created_at: newVal })
    setEditing(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (open) return
    if (ref.current && !ref.current.contains(e.relatedTarget as Node)) save()
  }

  return (
    <div ref={ref} className="flex items-center gap-3" onBlur={handleBlur}>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) {
            if (dateSelected.current) dateSelected.current = false
            else save()
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button autoFocus variant="outline" size="sm" className="h-7 w-auto px-2 font-normal text-xs">
            {format(dateState, "MMM d, yyyy")}
            <ChevronDownIcon className="ml-1 h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateState}
            defaultMonth={dateState}
            captionLayout="dropdown"
            onSelect={(d) => {
              if (d) {
                dateSelected.current = true
                setDateState(d)
                setOpen(false)
              }
            }}
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        step="1"
        value={timeState}
        onChange={(e) => setTimeState(e.target.value)}
        className="h-7 w-38 text-xs"
      />
    </div>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "first_name",
    header: "First Name",
    meta: { width: "20%" },
    cell: ({ row }) => (
      <TextCell value={row.getValue("first_name")} rowId={row.original.id} field="first_name" />
    ),
  },
  {
    accessorKey: "last_name",
    header: "Last Name",
    meta: { width: "20%" },
    cell: ({ row }) => (
      <TextCell value={row.getValue("last_name")} rowId={row.original.id} field="last_name" />
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    meta: { width: "24%" },
    cell: ({ row }) => (
      <TextCell value={row.getValue("email")} rowId={row.original.id} field="email" />
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button variant="ghost" className="-mx-3 h-10 justify-start px-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    meta: { width: "28%" },
    cell: ({ row }) => <DateCell value={row.getValue("created_at")} rowId={row.original.id} />,
  },
  {
    id: "actions",
    meta: { width: "8%" },
    cell: ({ row }) => {
      const deleteUser = useUserStore((s) => s.deleteUser)
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-full">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onClick={() => deleteUser(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
