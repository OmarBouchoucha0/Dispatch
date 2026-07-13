"use client"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Config = {
  id: string
  deviceId: number
  email: string
  status: "active" | "inactive" | "unknown"
  changedAt: Date
}

export const columns: ColumnDef<Config>[] = [
  {
    accessorKey: "deviceId",
    header: "Device ID",
  },
  {
    accessorKey: "email",
    header: "Email"
  },
  {
    accessorKey: "status",
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
  },
  {
    accessorKey: "changedAt",
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
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

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
              onClick={() => navigator.clipboard.writeText(payment.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export const configs: Config[] = [
  {
    id: "CFG-1001",
    deviceId: 10001,
    email: "alice.johnson@example.com",
    status: "active",
    changedAt: new Date("2026-07-10T09:15:00"),
  },
  {
    id: "CFG-1002",
    deviceId: 10002,
    email: "bob.smith@example.com",
    status: "inactive",
    changedAt: new Date("2026-07-09T14:22:00"),
  },
  {
    id: "CFG-1003",
    deviceId: 10003,
    email: "charlie.brown@example.com",
    status: "unknown",
    changedAt: new Date("2026-07-08T11:05:00"),
  },
  {
    id: "CFG-1004",
    deviceId: 10004,
    email: "diana.miller@example.com",
    status: "active",
    changedAt: new Date("2026-07-07T16:48:00"),
  },
  {
    id: "CFG-1005",
    deviceId: 10005,
    email: "ethan.wilson@example.com",
    status: "inactive",
    changedAt: new Date("2026-07-06T08:30:00"),
  },
  {
    id: "CFG-1006",
    deviceId: 10006,
    email: "fiona.davis@example.com",
    status: "active",
    changedAt: new Date("2026-07-05T13:10:00"),
  },
  {
    id: "CFG-1007",
    deviceId: 10007,
    email: "george.moore@example.com",
    status: "unknown",
    changedAt: new Date("2026-07-04T17:55:00"),
  },
  {
    id: "CFG-1008",
    deviceId: 10008,
    email: "hannah.taylor@example.com",
    status: "active",
    changedAt: new Date("2026-07-03T10:42:00"),
  },
  {
    id: "CFG-1009",
    deviceId: 10009,
    email: "ian.anderson@example.com",
    status: "inactive",
    changedAt: new Date("2026-07-02T15:20:00"),
  },
  {
    id: "CFG-1010",
    deviceId: 10010,
    email: "julia.thomas@example.com",
    status: "active",
    changedAt: new Date("2026-07-01T12:00:00"),
  },
  {
    id: "CFG-1011",
    deviceId: 10011,
    email: "julia.ddd@example.com",
    status: "active",
    changedAt: new Date("2026-07-01T12:00:00"),
  },
]
