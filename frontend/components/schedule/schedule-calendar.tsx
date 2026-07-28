"use client"

import { useRef, useEffect, useState } from "react"
import { useUiStore } from "@/store/ui-store"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import { ChevronLeft } from "lucide-react"
import { Diff } from "@/components/diff/diff"
import "./schedule-calendar.css"

export type ScheduleEvent = {
  id: string
  title: string
  scheduledAt: string
  status: "pending" | "deployed" | "cancelled"
  createdAt: string
}

const STATUS_COLORS = {
  pending: "#FACC15",
  deployed: "#22C55E",
  cancelled: "#444444",
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
  { id: "11", title: "Cache invalidation", scheduledAt: "2026-07-29T09:00:00Z", status: "deployed", createdAt: "2026-07-28T10:00:00Z" },
  { id: "12", title: "Rate limit update", scheduledAt: "2026-07-29T09:05:00Z", status: "pending", createdAt: "2026-07-28T11:00:00Z" },
  { id: "13", title: "Deploy hotfix v2.1.1", scheduledAt: "2026-07-30T14:00:00Z", status: "pending", createdAt: "2026-07-29T09:00:00Z" },
  { id: "14", title: "Enable access logs", scheduledAt: "2026-07-30T14:00:00Z", status: "cancelled", createdAt: "2026-07-29T11:00:00Z" },
]

const CALENDAR_EVENTS = MOCK_EVENTS.map((e) => {
  const start = new Date(e.scheduledAt)
  const end = new Date(start.getTime() + 1)
  return {
    id: e.id,
    title: e.title,
    start: e.scheduledAt,
    end: end.toISOString(),
    allDay: false,
    backgroundColor: STATUS_COLORS[e.status],
    borderColor: STATUS_COLORS[e.status],
    extendedProps: { status: e.status, createdAt: e.createdAt },
  }
})

export function ScheduleCalendar() {
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const setSelectedEventId = useUiStore((s) => s.setSelectedEventId)
  const selectedEvent = selectedEventId ? MOCK_EVENTS.find((e) => e.id === selectedEventId) ?? null : null
  const [tooltip, setTooltip] = useState<{ title: string; time: string; status: string; x: number; y: number } | null>(null)
  const calendarView = useUiStore((s) => s.calendarView)
  const calendarDate = useUiStore((s) => s.calendarDate)
  const setCalendarView = useUiStore((s) => s.setCalendarView)
  const setCalendarDate = useUiStore((s) => s.setCalendarDate)
  const calendarRef = useRef<HTMLDivElement>(null)

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
  console.log(calendarView, calendarDate)
  return (
    <div className="flex flex-1 h-full min-h-0 flex-col overflow-hidden relative">
      {selectedEvent && (
        <div className="absolute inset-0 z-10 bg-background flex flex-col">
          <div className="flex items-center gap-3 p-3 border-b border-border bg-sidebar">
            <button
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setSelectedEventId(null)}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLORS[selectedEvent.status] }}
            />
            <span className="text-sm font-medium truncate">{selectedEvent.title}</span>
            <span className="text-xs text-muted-foreground ml-auto">
              Scheduled: {new Date(selectedEvent.scheduledAt).toLocaleString(undefined, { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
            <span className="text-xs text-muted-foreground">
              Created: {new Date(selectedEvent.createdAt).toLocaleString(undefined, { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <Diff />
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
            setCalendarDate(arg.view.calendar.getDate().toISOString())
          }}
          events={CALENDAR_EVENTS}
          eventClick={(info) => {
            const event = MOCK_EVENTS.find((e) => e.id === info.event.id)
            if (event) setSelectedEventId(event.id)
          }}
          eventMouseEnter={(info) => {
            setTooltip({
              title: info.event.title,
              time: info.event.start?.toLocaleString() ?? "",
              status: info.event.extendedProps.status as string,
              x: info.jsEvent.clientX,
              y: info.jsEvent.clientY,
            })
          }}
          eventMouseLeave={() => setTooltip(null)}
          eventClassNames={(arg) => `schedule-event--${arg.event.extendedProps.status}`}
          allDaySlot={false}
          nowIndicator={true}
          height="100%"
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

      {tooltip && (
        <div
          style={{ position: "fixed", left: tooltip.x, top: tooltip.y - 8, transform: "translateY(-100%)" }}
          className="z-50 max-w-xs rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md pointer-events-none"
        >
          <div className="font-medium">{tooltip.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[tooltip.status as keyof typeof STATUS_COLORS] }} />
            {tooltip.time}
          </div>
        </div>
      )}

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
