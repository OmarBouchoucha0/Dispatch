"use client"

import { useRef, useEffect, useState } from "react"
import { useUiStore } from "@/store/ui-store"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import { CalendarSkeleton } from "@/components/ui/skeleton"
import "./schedule-calendar.css"

export type ScheduleEvent = {
  id: string
  title: string
  scheduledAt: string
  status: "pending" | "deployed" | "cancelled"
  createdAt: string
}

const STATUS_COLORS = {
  pending: "#FFDE21",
  deployed: "#22c55e",
  cancelled: "#9d9d9d",
} as const

const MOCK_EVENTS: ScheduleEvent[] = [
  { id: "1", title: "Deploy config v2.1", scheduledAt: "2026-07-27T09:00:00Z", status: "deployed", createdAt: "2026-07-26T10:00:00Z" },
  { id: "2", title: "Rollback to v2.0", scheduledAt: "2026-07-27T14:30:00Z", status: "pending", createdAt: "2026-07-26T11:00:00Z" },
  { id: "3", title: "Update firewall rules", scheduledAt: "2026-07-28T08:00:00Z", status: "pending", createdAt: "2026-07-25T09:00:00Z" },
  { id: "4", title: "DNS migration", scheduledAt: "2026-07-28T16:00:00Z", status: "cancelled", createdAt: "2026-07-24T14:00:00Z" },
  { id: "5", title: "SSL cert renewal", scheduledAt: "2026-07-29T10:00:00Z", status: "deployed", createdAt: "2026-07-23T08:00:00Z" },
  { id: "6", title: "Database patch", scheduledAt: "2026-07-30T11:00:00Z", status: "pending", createdAt: "2026-07-22T12:00:00Z" },
  { id: "7", title: "Load balancer config", scheduledAt: "2026-07-31T07:30:00Z", status: "cancelled", createdAt: "2026-07-21T16:00:00Z" },
  { id: "8", title: "Monitoring upgrade", scheduledAt: "2026-08-01T13:00:00Z", status: "pending", createdAt: "2026-07-20T10:00:00Z" },
  { id: "9", title: "CI/CD pipeline update", scheduledAt: "2026-07-27T11:00:00Z", status: "deployed", createdAt: "2026-07-19T09:00:00Z" },
  { id: "10", title: "API rate limit change", scheduledAt: "2026-07-29T15:00:00Z", status: "pending", createdAt: "2026-07-18T14:00:00Z" },
]

export function ScheduleCalendar() {
  const [ready, setReady] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const calendarView = useUiStore((s) => s.calendarView)
  const calendarDate = useUiStore((s) => s.calendarDate)
  const setCalendarView = useUiStore((s) => s.setCalendarView)
  const setCalendarDate = useUiStore((s) => s.setCalendarDate)
  const calendarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const el = calendarRef.current
    if (!el) return
    const buttons = el.querySelectorAll<HTMLButtonElement>(".fc-header-toolbar button")
    buttons.forEach((btn) => btn.removeAttribute("title"))
    el.querySelectorAll<HTMLButtonElement>(
      ".fc-dayGridMonth-button, .fc-timeGridWeek-button"
    ).forEach((btn) => {
      btn.addEventListener("click", () => btn.blur())
    })
  })

  if (!ready) return <CalendarSkeleton />

  const calendarEvents = MOCK_EVENTS.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.scheduledAt,
    allDay: false,
    backgroundColor: STATUS_COLORS[e.status],
    borderColor: STATUS_COLORS[e.status],
    extendedProps: {
      status: e.status,
      createdAt: e.createdAt,
    },
  }))


  return (
    <div className="flex flex-1 h-full min-h-0 flex-col overflow-hidden relative">
      {selectedEvent && (
        <div className="absolute inset-0 z-10 bg-background flex flex-col">
          <div className="flex items-center gap-3 p-3 border-b border-border">
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setSelectedEvent(null)}
            >
              ← Back to Schedule
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-xl mx-auto space-y-6">
              <div>
                <h1 className="text-2xl font-semibold">{selectedEvent.title}</h1>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[selectedEvent.status] }}
                />
                <span className="text-sm font-medium capitalize">{selectedEvent.status}</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>
                    Scheduled: {new Date(selectedEvent.scheduledAt).toLocaleDateString()} at{" "}
                    {new Date(selectedEvent.scheduledAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>
                    Created: {new Date(selectedEvent.createdAt).toLocaleDateString()} at{" "}
                    {new Date(selectedEvent.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={calendarRef} className="flex-1 min-h-0 overflow-y-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView={calendarView}
          initialDate={calendarDate}
          datesSet={(arg) => {
            setCalendarView(arg.view.type)
            setCalendarDate(arg.view.currentStart.toISOString().slice(0, 10))
          }}
          events={calendarEvents}
          eventClick={(info) => {
            const event = MOCK_EVENTS.find((e) => e.id === info.event.id)
            if (event) setSelectedEvent(event)
          }}
          eventClassNames={(arg) => `schedule-event--${arg.event.extendedProps.status}`}
          allDaySlot={false}
          nowIndicator={true}
          height="auto"
          locale="en"
          firstDay={1}
          weekNumbers={false}
          views={{
            dayGridMonth: { displayEventTime: false, eventDisplay: "block", dayMaxEvents: false },
            timeGridWeek: { displayEventTime: true },
          }}
          headerToolbar={{
            left: "dayGridMonth,timeGridWeek",
            center: "title",
            right: "prev,next today",
          }}
          titleFormat={{ month: "long" }}
          dayHeaderFormat={{ weekday: "short" }}
          buttonText={{ today: "Today" }}
        />
      </div>

      <div className="flex shrink-0 items-center gap-4 p-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.pending }} />
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.deployed }} />
          Deployed
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.cancelled }} />
          Cancelled
        </div>
        {MOCK_EVENTS.length > 0 && (
          <span className="ml-auto">
            {MOCK_EVENTS.length} schedule{MOCK_EVENTS.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}
