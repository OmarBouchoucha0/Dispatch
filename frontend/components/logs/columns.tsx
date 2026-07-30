"use client"
import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { ChevronDownIcon, MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/lib/utils"
import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLogsStore } from "@/store/logs-store"
import { useUserStore } from "@/store/users-store"
import { useDeviceStore } from "@/store/device-store"

export type Config = {
  id: string
  user_name: string
  device_name: string
  action: string
  created_at: string
}

const ACTIONS = ["Created", "Updated", "Deleted", "Renamed"] as const

function ActionCell({ value, rowId }: { value: string; rowId: string }) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [selOpen, setSelOpen] = useState(false)
  const updateLog = useLogsStore((s) => s.updateLog)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-accent/50 p-1 -mx-1 rounded block"
      >
        {value}
      </span>
    )
  }

  return (
    <div
      ref={ref}
      onBlur={(e) => {
        if (selOpen) return
        if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
          setEditing(false)
        }
      }}
    >
      <Select
        value={localValue}
        onValueChange={(val) => {
          setLocalValue(val)
          updateLog(rowId, { action: val })
        }}
        onOpenChange={(o) => {
          setSelOpen(o)
          if (!o) setEditing(false)
        }}
      >
        <SelectTrigger autoFocus className="h-7 w-full border-none bg-transparent shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          {ACTIONS.map((a) => (
            <SelectItem key={a} value={a}>{a}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function UserCell({ value, rowId }: { value: string; rowId: string }) {
  const [editing, setEditing] = useState(false)
  const [comboOpen, setComboOpen] = useState(false)
  const users = useUserStore((s) => s.users)
  const updateLog = useLogsStore((s) => s.updateLog)
  const ref = useRef<HTMLDivElement>(null)

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-accent/50 p-1 -mx-1 rounded block "
      >
        {value}
      </span>
    )
  }

  const userItems = users.map((u) => ({
    value: u.id,
    label: `${u.first_name} ${u.last_name}`,
  }))

  return (
    <div
      ref={ref}
      onBlur={(e) => {
        if (comboOpen) return
        if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
          setEditing(false)
        }
      }}
    >
      <Combobox
        items={userItems}
        onValueChange={(val) => {
          const v = val as string
          if (v) updateLog(rowId, { user_id: v })
          setEditing(false)
        }}
        onOpenChange={(open) => {
          setComboOpen(open)
          if (!open) setEditing(false)
        }}
      >
        <ComboboxInput
          autoFocus
          placeholder="Search users..."
        />
        <ComboboxContent>
          <ComboboxEmpty>No users found.</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  )
}

function DeviceCell({ value, rowId }: { value: string; rowId: string }) {
  const [editing, setEditing] = useState(false)
  const [comboOpen, setComboOpen] = useState(false)
  const devices = useDeviceStore((s) => s.devices)
  const updateLog = useLogsStore((s) => s.updateLog)
  const ref = useRef<HTMLDivElement>(null)

  if (!editing) {
    return (
      <span
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-accent/50 p-1 -mx-1 rounded block"
      >
        {value}
      </span>
    )
  }

  const deviceItems = devices.map((d) => ({
    value: d.id,
    label: d.name,
  }))

  return (
    <div
      ref={ref}
      onBlur={(e) => {
        if (comboOpen) return
        if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
          setEditing(false)
        }
      }}
    >
      <Combobox
        items={deviceItems}
        onValueChange={(val) => {
          const v = val as string
          if (v) updateLog(rowId, { device_id: v })
          setEditing(false)
        }}
        onOpenChange={(open) => {
          setComboOpen(open)
          if (!open) setEditing(false)
        }}
      >
        <ComboboxInput
          autoFocus
          placeholder="Search devices..."
        />
        <ComboboxContent>
          <ComboboxEmpty>No devices found.</ComboboxEmpty>
          <ComboboxList>
            {(item: { value: string; label: string }) => (
              <ComboboxItem key={item.value} value={item.value}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
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
  const updateLog = useLogsStore((s) => s.updateLog)
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

  const pendingValue = `${format(dateState, "yyyy-MM-dd")} ${timeState}`

  const save = () => {
    if (pendingValue !== value) {
      updateLog(rowId, { created_at: pendingValue })
    }
    setEditing(false)
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (open) return
    if (ref.current && !ref.current.contains(e.relatedTarget as Node)) {
      save()
    }
  }

  return (
    <div ref={ref} className="flex items-center gap-3" onBlur={handleBlur}>
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) {
            if (dateSelected.current) {
              dateSelected.current = false
            } else {
              save()
            }
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

export const columns: ColumnDef<Config>[] = [
  {
    accessorKey: "user_name",
    header: "User",
    meta: { width: "26%" },
    cell: ({ row }) => (
      <UserCell value={row.getValue("user_name")} rowId={row.original.id} />
    ),
  },
  {
    accessorKey: "device_name",
    header: "Device",
    meta: { width: "26%" },
    cell: ({ row }) => (
      <DeviceCell value={row.getValue("device_name")} rowId={row.original.id} />
    ),
  },
  {
    accessorKey: "action",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-mx-3 h-10 justify-start px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    meta: { width: "12%" },
    cell: ({ row }) => (
      <ActionCell value={row.getValue("action")} rowId={row.original.id} />
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="-mx-3 h-10 justify-start px-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Made At
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      )
    },
    meta: { width: "29%" },
    cell: ({ row }) => (
      <DateCell value={row.getValue("created_at")} rowId={row.original.id} />
    ),
  },
  {
    id: "actions",
    meta: { width: "7%" },
    cell: ({ row }) => {
      const deleteLog = useLogsStore((s) => s.deleteLog)
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
            <DropdownMenuItem
              variant="destructive"
              onClick={() => deleteLog(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


