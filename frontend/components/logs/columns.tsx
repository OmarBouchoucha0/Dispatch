"use client"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type Config = {
  UserName: string
  DeviceName: string
  Action: "Created" | "Updated" | "Deleted"
  CreatedAt: string
}

export const columns: ColumnDef<Config>[] = [
  {
    accessorKey: "UserName",
    header: "User",
  },
  {
    accessorKey: "DeviceName",
    header: "Device"
  },
  {
    accessorKey: "Action",
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
    accessorKey: "CreatedAt",
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
    cell: ({ row }) => formatDate(row.getValue("CreatedAt")),
  },
  {
    id: "actions",
    cell: () => {

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
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]


