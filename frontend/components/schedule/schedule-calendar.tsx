"use client"

import { useRef, useEffect, useState } from "react"
import { useUiStore } from "@/store/ui-store"
import { useEventsStore, type ScheduleEvent } from "@/store/events-store"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import { ChevronLeft, RefreshCw, XCircle } from "lucide-react"
import { EventDiff } from "@/components/diff/event-diff"
import { useConfigStore } from "@/store/config-store"
import { useDeviceStore } from "@/store/device-store"
import { useCommitStore } from "@/store/commit-store"
import { useEditorStore } from "@/store/editor-store"
import { cancelEvent } from "@/lib/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import "./schedule-calendar.css"

const STATUS_COLORS = {
  pending: "#FACC15",
  deployed: "#22C55E",
  cancelled: "#444444",
} as const

export function ScheduleCalendar() {
  const selectedEventId = useUiStore((s) => s.selectedEventId)
  const setSelectedEventId = useUiStore((s) => s.setSelectedEventId)
  const events = useEventsStore((s) => s.events)
  const loading = useEventsStore((s) => s.loading)
  const selectedEvent = selectedEventId ? events.find((e) => e.id === selectedEventId) ?? null : null
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

  async function handleSyncEvent(event: ScheduleEvent) {
    const { configs: currentConfigs } = useConfigStore.getState()
    const currentDevices = useDeviceStore.getState().devices

    const referencedIDs = new Set(event.configsAfter.map((c) => c.device_id))

    const newDevices = Array.from(referencedIDs)
      .filter((id: string) => !currentDevices.some((d) => d.id === id))
      .map((id) => {
        const eventItem = event.configsAfter.find((c) => c.device_id === id)
        return {
          id,
          name: eventItem?.device_name ?? `Device-${id.slice(0, 8)}`,
          created_at: new Date().toISOString(),
        }
      })

    const allDevices = [
      ...currentDevices.filter((d) => referencedIDs.has(d.id)),
      ...newDevices,
    ]

    useDeviceStore.setState({ devices: allDevices })

    const newConfigs = event.configsAfter.map((item) => {
      const existing = currentConfigs.find(
        (c) => c.device_id === item.device_id && c.name === item.name
      )
      const device = allDevices.find((d) => d.id === item.device_id)

      if (existing) {
        return { ...existing, content: item.content }
      }

      return {
        id: `${item.device_id}::${item.name}`,
        device_id: item.device_id,
        device_name: device?.name ?? item.device_id,
        name: item.name,
        content: item.content,
      }
    })

    useConfigStore.setState({ configs: newConfigs })

    for (const config of newConfigs) {
      const content =
        config.content === null
          ? ""
          : JSON.stringify(config.content, null, 2)
      const existingFile = useEditorStore.getState().files[config.id]
      if (existingFile) {
        useEditorStore.setState((state) => ({
          files: {
            ...state.files,
            [config.id]: {
              ...state.files[config.id],
              content,
              modified: false,
            },
          },
        }))
      } else {
        useEditorStore.getState().openFile(config.id, config.content)
      }
    }

    useCommitStore.getState().snapshot()
    setSelectedEventId(null)
    toast.success("Event configs applied to workspace")
  }

  async function handleCancelEvent(eventId: string) {
    const ok = await cancelEvent(eventId)
    if (ok) {
      await useEventsStore.getState().sync()
      setSelectedEventId(null)
    }
  }

  const calendarEvents = events.map((e) => {
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

  if (loading) return null

  return (
    <div className="flex flex-1 h-full min-h-0 flex-col overflow-hidden relative">
      {selectedEvent && (
        <div className="absolute inset-0 z-10 bg-background flex flex-col">
          <div className="flex items-center border-b border-border bg-sidebar px-2 py-2">
            <div className="flex flex-1 items-center gap-3 min-w-0">
              <button
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setSelectedEventId(null)}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </button>

              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[selectedEvent.status] }}
              />

              <span className="truncate text-sm font-medium">
                {selectedEvent.title}
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>
                Scheduled:{" "}
                {new Date(selectedEvent.scheduledAt).toLocaleString(undefined, {
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>

              <span>
                Created:{" "}
                {new Date(selectedEvent.createdAt).toLocaleString(undefined, {
                  month: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex flex-1 justify-end gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleSyncEvent(selectedEvent)}
              >
                <RefreshCw className="h-4 w-4" />
                Sync
              </Button>

              {selectedEvent.status === "pending" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <EventDiff
              configsBefore={selectedEvent.configsBefore}
              configsAfter={selectedEvent.configsAfter}
              devicesBefore={selectedEvent.devicesBefore}
              devicesAfter={selectedEvent.devicesAfter}
            />
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
          events={calendarEvents}
          eventClick={(info) => {
            const event = events.find((e) => e.id === info.event.id)
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
        {events.length > 0 && (
          <span className="ml-auto">
            {events.length} schedule{events.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}
