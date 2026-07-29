"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"
import { format } from "date-fns"

type SchedulePopoverProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (name: string, scheduledAt: Date) => void
}

export function SchedulePopover({
  open,
  onOpenChange,
  onConfirm,
}: SchedulePopoverProps) {
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [time, setTime] = useState(
    new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
  )
  const [dateOpen, setDateOpen] = useState(false)

  function handleConfirm() {
    const [hours, minutes] = time.split(":").map(Number)
    const scheduled = new Date(date)
    scheduled.setHours(hours, minutes, 0, 0)
    onConfirm(name.trim() || "Anonymous", scheduled)
    setName("")
    setDate(new Date())
    setTime(
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Schedule Event</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Input
            placeholder="Event name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />

          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-between font-normal"
              >
                {date ? format(date, "PPP") : "Select date"}
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) setDate(d)
                  setDateOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>

          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
