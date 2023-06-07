import { EnrolledWithSection } from "@/interfaces/EnrolledTypes"
import { createConflictEvents, createEvents } from "@/lib/calendar"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { InfoIcon } from "lucide-react"
import { Spinner } from "../ui/spinner"
import { useEffect, useState } from "react"
import { CalendarEvent } from "@/interfaces/CalendarTypes"

interface Props {
  sections: EnrolledWithSection[]
  warningMessage?: string
  isLoading?: boolean
  heightOffset?: number
}

export default function WeekCalendar({
  sections,
  warningMessage,
  isLoading,
  heightOffset = 0,
}: Props) {
  const [calendarHeight, setCalendarHeight] = useState<number>(
    window.innerHeight - heightOffset
  )

  // watch for resize events and update calendar height
  useEffect(() => {
    const handleResize = () => {
      setCalendarHeight(window.innerHeight - heightOffset)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [heightOffset])

  const [events, setEvents] = useState<CalendarEvent[]>([])

  useEffect(() => {
    setEvents([...createEvents(sections), ...createConflictEvents(sections)])
  }, [sections])

  return (
    <>
      <div className="w-full relative">
        {isLoading ? (
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded z-10 p-5 shadow-md">
              <Spinner />
            </div>
          </div>
        ) : warningMessage ? (
          <div className="absolute top-0 left-0 w-full h-full bg-white bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded z-10 p-5 shadow-md flex gap-2 items-center">
              <InfoIcon />
              {warningMessage}
            </div>
          </div>
        ) : null}
        <FullCalendar
          plugins={[timeGridPlugin]}
          initialView="timeGridFiveDay"
          views={{
            timeGridFiveDay: {
              type: "timeGrid",
              duration: { days: 5 },
            },
          }}
          allDaySlot={false}
          headerToolbar={{
            left: "",
            center: "",
            right: "",
          }}
          slotMinTime={"06:00:00"}
          slotMaxTime={"22:00:00"}
          firstDay={1}
          contentHeight={calendarHeight} // 1150 for current calanderPage
          initialDate="2023-05-07"
          expandRows={true}
          dayHeaderContent={(day) => {
            const DAYS = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ]
            return DAYS[day.date.getDay()]
          }}
          events={events}
          slotEventOverlap={true}
        />
      </div>
    </>
  )
}
