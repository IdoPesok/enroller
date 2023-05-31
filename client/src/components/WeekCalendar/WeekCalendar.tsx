import { EnrolledWithSection } from "@/interfaces/EnrolledTypes"
import { createConflictEvents, createEvents } from "@/lib/calendar"
import FullCalendar from "@fullcalendar/react"
import timeGridPlugin from "@fullcalendar/timegrid"
import { InfoIcon } from "lucide-react"
import { Spinner } from "../ui/spinner"

interface Props {
  height: number
  sections: EnrolledWithSection[]
  warningMessage?: string
  isLoading?: boolean
}

export default function WeekCalendar({
  height,
  sections,
  warningMessage,
  isLoading,
}: Props) {
  const events = [...createEvents(sections), ...createConflictEvents(sections)]

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
          contentHeight={height} // 1150 for current calanderPage
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
